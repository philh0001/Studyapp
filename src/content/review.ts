import {isOfficialSource} from './validate';
import type {StudyRepository} from '../storage/repository';
/** Approval is a local human decision, never inferred from bundled metadata. */
export async function approveQuestion(repo:StudyRepository,questionId:string,revision:number,confirmed:boolean):Promise<void>{
 if(!confirmed)throw Error('Confirm the answer and every explanation against the official sources first.');
 await repo.db.transaction('rw',repo.db.packs,repo.db.contentTrust,repo.db.sourceChecks,async()=>{
  const packs=await repo.db.packs.toArray();const pack=packs.find(p=>p.questions.some(q=>q.id===questionId&&q.revision===revision));const q=pack?.questions.find(q=>q.id===questionId&&q.revision===revision);
  if(!pack||!q||q.status==='retired')throw Error('This question revision is unavailable.');
  const checks=await repo.db.sourceChecks.toArray();
  if(q.references.some(r=>!isOfficialSource(r.url)||!checks.some(c=>c.canonicalUrl===r.url&&c.result==='checked')))throw Error('Official source checks are missing.');
  const now=new Date().toISOString();for(const reference of q.references)reference.microsoftOwnershipVerified=true;q.status='reviewed';q.review={reviewer:'Local reviewer',reviewedAt:now,method:'Manual answer and explanation review against Microsoft Learn'};
  await repo.db.packs.put(pack);await repo.db.contentTrust.put({questionId,revision,sourceCheckedAt:q.references.reduce((a,r)=>a<r.checkedAt?a:r.checkedAt,now),humanReviewedAt:now,reviewer:'Local reviewer',invalidatedAt:null});
 });
}
