import {afterEach,describe,it,expect} from 'vitest';
import {classifySourceObservation,applySourceReport,parseSourceReport} from '../../src/content/freshness';
import {StudyDatabase} from '../../src/storage/database';
import {StudyRepository} from '../../src/storage/repository';
import {question,pack} from '../fixtures';
import type {SourceCheck} from '../../src/content/types';
const baseline:SourceCheck={referenceId:'s1',canonicalUrl:question().references[0].url,checkedAt:'2026-10-01T12:00:00Z',result:'checked',evidenceSummary:'Original retrieval',contentHash:'a'.repeat(64)};
const observed={...baseline,checkedAt:'2026-10-08T13:00:00Z',contentHash:'b'.repeat(64)};
const dbs:StudyDatabase[]=[];afterEach(async()=>{for(const d of dbs.splice(0)){d.close();await d.delete()}});
async function setup(){const db=new StudyDatabase('freshness-'+crypto.randomUUID());dbs.push(db);const repo=new StudyRepository(db);await repo.installPack(pack([question({status:'reviewed'})]),[baseline]);await db.contentTrust.put({questionId:'q1',revision:1,sourceCheckedAt:baseline.checkedAt,humanReviewedAt:baseline.checkedAt,reviewer:'Human',invalidatedAt:null});return repo;}
const report=(check:SourceCheck=observed)=>({version:1 as const,generatedAt:check.checkedAt,entries:[classifySourceObservation(baseline,check)]});
describe('reviewable source evidence changes',()=>{
 it('distinguishes equal hashes, changes, missing baselines and outages',()=>{
  expect(classifySourceObservation(baseline,{...observed,contentHash:baseline.contentHash}).status).toBe('unchanged');
  expect(classifySourceObservation(baseline,observed).status).toBe('changed');
  expect(classifySourceObservation({...baseline,contentHash:undefined},observed).status).toBe('baseline-missing');
  expect(classifySourceObservation(baseline,{...observed,result:'unavailable',contentHash:undefined}).status).toBe('unavailable');
 });
 it('quarantines affected drafts without creating human approval',async()=>{const repo=await setup();await repo.db.contentTrust.clear();await repo.db.packs.put(pack([question()]));await applySourceReport(repo,report(),true);expect(await repo.db.contentTrust.get(['q1',1])).toMatchObject({humanReviewedAt:null,reviewer:null,invalidatedAt:observed.checkedAt});expect((await repo.getQuestions())[0]).toMatchObject({status:'draft',review:null});});
 it('requires explicit report confirmation before mutating trust',async()=>{
  const repo=await setup();await expect(applySourceReport(repo,report(),false)).rejects.toThrow(/Confirm/);expect((await repo.db.contentTrust.get(['q1',1]))?.invalidatedAt).toBeNull();
 });
 it('quarantines exact local reviewed revisions and keeps historical snapshots',async()=>{
  const repo=await setup();const old=question();await repo.db.sessions.put({id:'historic',questionSnapshots:[old],correctionWarnings:[]} as never);
  const result=await applySourceReport(repo,report(),true);expect(result.quarantined).toEqual([{questionId:'q1',revision:1}]);
  expect((await repo.db.contentTrust.get(['q1',1]))?.invalidatedAt).toBe(observed.checkedAt);
  expect((await repo.db.sessions.get('historic'))?.questionSnapshots).toEqual([old]);
  expect((await repo.db.sessions.get('historic'))?.correctionWarnings).toEqual([{questionId:'q1',revision:1}]);
  expect((await repo.db.sourceChecks.get('s1'))?.contentHash).toBe(observed.contentHash);
  expect((await repo.getQuestions())[0].status).toBe('reviewed');
 });
 it('does not invalidate on an outage or automatically re-enable prior quarantines',async()=>{
  const repo=await setup();await applySourceReport(repo,report({...observed,result:'unavailable',contentHash:undefined}),true);expect((await repo.db.contentTrust.get(['q1',1]))?.invalidatedAt).toBeNull();expect((await repo.db.sourceChecks.get('s1'))?.contentHash).toBe(baseline.contentHash);
  await applySourceReport(repo,report(),true);const unchanged=classifySourceObservation(observed,{...observed,checkedAt:'2026-10-09T13:00:00Z'});await applySourceReport(repo,{version:1,generatedAt:unchanged.observed.checkedAt,entries:[unchanged]},true);expect((await repo.db.contentTrust.get(['q1',1]))?.invalidatedAt).toBe(observed.checkedAt);
 });
 it('rejects malformed, nonofficial, contradictory and stale reports atomically',async()=>{
  expect(()=>parseSourceReport('{}')).toThrow();
  expect(()=>parseSourceReport(JSON.stringify({...report(),entries:[{...report().entries[0],status:'unchanged'}]}))).toThrow();
  expect(()=>parseSourceReport(JSON.stringify(report({...observed,canonicalUrl:'https://evil.example/'})))).toThrow();
  const repo=await setup();await repo.db.sourceChecks.put({...baseline,contentHash:'c'.repeat(64)});await expect(applySourceReport(repo,report(),true)).rejects.toThrow(/baseline/);expect((await repo.db.contentTrust.get(['q1',1]))?.invalidatedAt).toBeNull();
 });
});
it('shows ordered/case/exhibit context and applies an imported report only after confirmation',async()=>{
 const {createElement}=await import('react');const {render,screen,fireEvent,waitFor}=await import('@testing-library/react');const {ContentReview}=await import('../../src/features/review/ContentReview');let applied=0;
 const q=question({type:'ordering',requiredSelections:3,correctOptionIds:['b','a','c'],caseStudy:{id:'case',title:'Recovery rehearsal',overview:'Shared regional recovery context.'},exhibits:[{type:'diagram',title:'Recovery direction',text:'Region A -> Region B'}]});
 render(createElement(ContentReview,{questions:[q],trust:[],onApprove:async()=>{},onCorrection:async()=>{},onApplySourceReport:async()=>{applied++;return {quarantined:1,unavailable:0}}}));
 expect(screen.getByText('Shared regional recovery context.')).toBeInTheDocument();expect(screen.getByText('Region A -> Region B')).toBeInTheDocument();expect(screen.getByText('B → A → C')).toBeInTheDocument();
 fireEvent.change(screen.getByLabelText('Source report JSON'),{target:{files:[{text:async()=>JSON.stringify(report())}]}});
 await waitFor(()=>expect(screen.getByRole('button',{name:'Apply source report'})).toBeDisabled());expect(applied).toBe(0);
 fireEvent.click(screen.getByLabelText(/I reviewed this report/));fireEvent.click(screen.getByRole('button',{name:'Apply source report'}));await waitFor(()=>expect(applied).toBe(1));expect(await screen.findByText(/No questions were automatically approved/)).toBeInTheDocument();
});
