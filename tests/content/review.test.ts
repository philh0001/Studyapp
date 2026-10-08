import {afterEach,describe,expect,it} from 'vitest';
import Dexie from 'dexie';
import {approveQuestion} from '../../src/content/review';
import {classifyQuestion} from '../../src/content/trust';
import {createAppServices} from '../../src/app/bootstrap';
import {StudyDatabase} from '../../src/storage/database';
import {StudyRepository} from '../../src/storage/repository';
import type {SourceCheck} from '../../src/content/types';
import {pack,question} from '../fixtures';
const opened:StudyDatabase[]=[];
let defaultDatabaseUsed=false;
afterEach(async()=>{for(const db of opened.splice(0)){db.close();if(db.name!=='az104-studyapp')await db.delete()}if(defaultDatabaseUsed){await Dexie.delete('az104-studyapp');defaultDatabaseUsed=false}});
async function repository(withCheck=true){
 const db=new StudyDatabase('approval-'+crypto.randomUUID());opened.push(db);
 const repo=new StudyRepository(db),q=question();
 const check:SourceCheck={referenceId:'s1',canonicalUrl:q.references[0].url,checkedAt:q.references[0].checkedAt,result:'checked',evidenceSummary:'Test retrieval record'};
 await repo.installPack(pack([q]),withCheck?[check]:[]);return repo;
}
describe('explicit content approval',()=>{
 it('requires manual confirmation and leaves the revision draft without it',async()=>{
  const repo=await repository();
  await expect(approveQuestion(repo,'q1',1,false)).rejects.toThrow(/Confirm/);
  expect((await repo.getQuestions())[0]).toMatchObject({status:'draft',review:null});
  expect(await repo.db.contentTrust.count()).toBe(0);
 });
 it('rejects approval with missing successful official source checks',async()=>{
  const repo=await repository(false);
  await expect(approveQuestion(repo,'q1',1,true)).rejects.toThrow(/source checks/i);
  expect((await repo.getQuestions())[0].status).toBe('draft');
  expect(await repo.db.contentTrust.count()).toBe(0);
 });
 it('manual approval enables only the exact reviewed revision',async()=>{
  const repo=await repository();await approveQuestion(repo,'q1',1,true);
  const q=(await repo.getQuestions())[0],trust=await repo.db.contentTrust.get(['q1',1]);
  expect(q.status).toBe('reviewed');expect(q.review?.method).toMatch(/Manual/);
  expect(trust?.humanReviewedAt).toBe(q.review?.reviewedAt);
  expect(classifyQuestion(q,trust??null)).toBe('eligible');
  expect(classifyQuestion({...q,revision:2},trust??null)).toBe('draft');
  await expect(approveQuestion(repo,'q1',2,true)).rejects.toThrow(/unavailable/);
  expect(await repo.db.contentTrust.get(['q1',2])).toBeUndefined();
 });
 it('bootstrap preserves an approved starter revision after a closed-database restart',async()=>{
  defaultDatabaseUsed=true;await Dexie.delete('az104-studyapp');
  const first=await createAppServices();opened.push(first.repository.db);
  const q=(await first.repository.getQuestions())[0];await approveQuestion(first.repository,q.id,q.revision,true);
  first.repository.db.close();
  const restarted=await createAppServices();opened.push(restarted.repository.db);
  const installed=(await restarted.repository.getQuestions()).find(x=>x.id===q.id);
  const trust=await restarted.repository.db.contentTrust.get([q.id,q.revision]);
  expect(installed?.status).toBe('reviewed');expect(installed?.review).not.toBeNull();
  expect(classifyQuestion(installed!,trust??null)).toBe('eligible');
  expect(await restarted.repository.db.packs.count()).toBe(1);
 });
});
