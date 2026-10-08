import {isOfficialSource} from './validate.ts';
import type {SourceCheck,QuestionIdentity} from './types';
import type {StudyRepository} from '../storage/repository';
export interface SourceObservation {referenceId:string;previousHash:string|null;previousUrl:string;status:'unchanged'|'changed'|'unavailable'|'baseline-missing';observed:SourceCheck}
export interface SourceReport {version:1;generatedAt:string;entries:SourceObservation[]}
export function classifySourceObservation(previous:SourceCheck,observed:SourceCheck):SourceObservation{
 const status=observed.result==='unavailable'?'unavailable':observed.result==='changed'||previous.canonicalUrl!==observed.canonicalUrl?'changed':!previous.contentHash||!observed.contentHash?'baseline-missing':previous.contentHash!==observed.contentHash||previous.canonicalUrl!==observed.canonicalUrl?'changed':'unchanged';
 return {referenceId:previous.referenceId,previousHash:previous.contentHash??null,previousUrl:previous.canonicalUrl,status,observed:{...observed,referenceId:previous.referenceId}};
}
export function parseSourceReport(text:string):SourceReport{
 const value:unknown=JSON.parse(text);if(!value||typeof value!=='object')throw Error('Invalid source report');
 const report=value as SourceReport;if(report.version!==1||!Number.isFinite(Date.parse(report.generatedAt))||!Array.isArray(report.entries)||report.entries.length>5000)throw Error('Invalid source report');
 const ids=new Set<string>();for(const entry of report.entries){const check=entry?.observed;
  if(!check||typeof entry.referenceId!=='string'||!entry.referenceId||ids.has(entry.referenceId)||check.referenceId!==entry.referenceId||!isOfficialSource(entry.previousUrl)||!isOfficialSource(check.canonicalUrl)||!Number.isFinite(Date.parse(check.checkedAt))||typeof check.evidenceSummary!=='string'||!['checked','changed','unavailable'].includes(check.result)||entry.previousHash!==null&&!/^[a-f0-9]{64}$/.test(entry.previousHash)||check.contentHash!==undefined&&!/^[a-f0-9]{64}$/.test(check.contentHash))throw Error('Invalid source report entry');
  const expected=classifySourceObservation({referenceId:entry.referenceId,canonicalUrl:entry.previousUrl,contentHash:entry.previousHash??undefined,checkedAt:check.checkedAt,result:'checked',evidenceSummary:''},check);
  if(expected.status!==entry.status||check.result==='checked'&&!check.contentHash)throw Error('Contradictory source report entry');ids.add(entry.referenceId);
 }
 return report;
}
/** Explicit local report application quarantines trust, never approves wording or changes snapshots. */
export async function applySourceReport(repo:StudyRepository,input:SourceReport,confirmed:boolean):Promise<{quarantined:QuestionIdentity[];unavailable:number}>{
 if(!confirmed)throw Error('Confirm you reviewed the source-change report before applying it.');
 const report=parseSourceReport(JSON.stringify(input));const quarantined:QuestionIdentity[]=[];let unavailable=0;
 await repo.db.transaction('rw',repo.db.sourceChecks,repo.db.contentTrust,repo.db.packs,repo.db.sessions,async()=>{
  const checks=await repo.db.sourceChecks.toArray(),questions=[...(await repo.db.packs.toArray()).flatMap(p=>p.questions),...(await repo.db.sessions.toArray()).flatMap(s=>s.questionSnapshots)];
  for(const entry of report.entries){const local=checks.find(c=>c.referenceId===entry.referenceId);if(!local||local.canonicalUrl!==entry.previousUrl||(local.contentHash??null)!==entry.previousHash)throw Error('Source report baseline differs from this browser; regenerate the report.');if(Date.parse(entry.observed.checkedAt)<Date.parse(local.checkedAt))throw Error('Source report is older than the local baseline.');}
  for(const entry of report.entries){const local=checks.find(c=>c.referenceId===entry.referenceId)!;
   if(entry.status==='unavailable'){unavailable++;await repo.db.sourceChecks.put({...local,result:'unavailable',evidenceSummary:entry.observed.evidenceSummary});continue;}
   await repo.db.sourceChecks.put(entry.observed);
   if(entry.status!=='changed')continue;
   for(const q of questions.filter(q=>q.references.some(r=>r.id===entry.referenceId||r.url===entry.previousUrl))){const trust=await repo.db.contentTrust.get([q.id,q.revision]);
    const identity={questionId:q.id,revision:q.revision};if(quarantined.some(i=>i.questionId===q.id&&i.revision===q.revision))continue;
    await repo.db.contentTrust.put({...(trust??{questionId:q.id,revision:q.revision,sourceCheckedAt:q.references.reduce((date,r)=>r.checkedAt<date?r.checkedAt:date,entry.observed.checkedAt),humanReviewedAt:null,reviewer:null}),invalidatedAt:trust?.invalidatedAt??entry.observed.checkedAt});quarantined.push(identity);
   }
  }
  for(const identity of quarantined)await repo.db.sessions.filter(s=>s.questionSnapshots.some(q=>q.id===identity.questionId&&q.revision===identity.revision)).modify(s=>{if(!s.correctionWarnings.some(i=>i.questionId===identity.questionId&&i.revision===identity.revision))s.correctionWarnings.push(identity)});
 });return {quarantined,unavailable};
}
