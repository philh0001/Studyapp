import {isOfficialSource} from '../content/validate';
import {scoreAnswer,canSubmit} from '../study/scoring';
import type {Attempt} from '../sessions/types';
import {isTimedSession} from '../sessions/types';
import type {Question,ValidationIssue} from '../content/types';
import {MAX_BACKUP_BYTES,MAX_EXPANDED_BACKUP_BYTES,backupTables,type BackupValidation} from './types';
import {checkBackup as check} from '../content/generated/validators.js';
function canonical(value:unknown):string{if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value!==null&&typeof value==='object')return '{'+Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>JSON.stringify(key)+':'+canonical(item)).join(',')+'}';return JSON.stringify(value)}
export function validateBackup(input:unknown,byteLength:number,compressed=false):BackupValidation{
 const issues:ValidationIssue[]=[],issue=(path:string,message:string)=>issues.push({path,message});
 const reject=():BackupValidation=>({valid:false,backup:null,issues});
 if(!Number.isFinite(byteLength)||byteLength<0||byteLength>(compressed?MAX_EXPANDED_BACKUP_BYTES:MAX_BACKUP_BYTES)){issue('file',compressed?'Expanded backup must be at most 64 MiB.':'Backup must be at most 10 MiB (10,485,760 bytes).');return reject()}
 if(typeof input==='object'&&input!==null&&'schemaVersion' in input&&input.schemaVersion!==1){issue('schemaVersion','Unsupported backup version. Only schema version 1 is supported.');return reject()}
 if(!check(input)){for(const e of check.errors??[])issue(e.instancePath||'backup',e.message??'Invalid record');return reject()}
 const b=input;
 // Match every IndexedDB primary key; duplicates would otherwise silently overwrite records.
 for(const table of backupTables){const keys=new Set<string>();for(const [i,row] of b[table].entries()){const record=row as unknown as Record<string,unknown>;const key=table==='contentTrust'?JSON.stringify([record.questionId,record.revision]):String(record[table==='sourceChecks'?'referenceId':['reviews','bookmarks','notes','releasedHoldouts'].includes(table)?'questionId':'id']);if(keys.has(key))issue(`${table}[${i}]`,'Duplicate primary key');keys.add(key)}}
 const identities=new Set<string>(),questionIds=new Set<string>();
 const identityKey=(id:string,rev:number)=>JSON.stringify([id,rev]);
 const inspectQuestion=(question:Question,path:string)=>{
  identities.add(identityKey(question.id,question.revision));questionIds.add(question.id);
  const opts=new Set(question.options.map(o=>o.id)),references=new Set(question.references.map(r=>r.id));
  if(opts.size!==question.options.length||references.size!==question.references.length)issue(path,'Duplicate option or reference identity');
  if(question.correctOptionIds.length!==question.requiredSelections||question.requiredSelections>question.options.length||(['single','multiple'].includes(question.type)&&question.requiredSelections===question.options.length)||(['ordering','matching'].includes(question.type)&&question.requiredSelections!==question.options.length)||question.correctOptionIds.some(id=>!opts.has(id))||(question.type==='single'&&question.requiredSelections!==1)||(question.type==='multiple'&&question.requiredSelections<2))issue(path+'.correctOptionIds','Invalid answer count or option identity');
  if(question.type==='matching'&&(!question.matchPrompts||question.matchPrompts.length!==question.options.length||new Set(question.matchPrompts.map(p=>p.id)).size!==question.matchPrompts.length))issue(path+'.matchPrompts','Invalid matching prompts');
  if(new Set(question.correctOptionIds).size!==question.correctOptionIds.length)issue(path+'.correctOptionIds','Duplicate correct answer identity');
  if(question.summaryReferenceIds.some(id=>!references.has(id))||question.options.some(o=>o.referenceIds.some(id=>!references.has(id))))issue(path+'.references','Dangling evidence reference');
  if(['verified','reviewed'].includes(question.status)&&!question.review)issue(path+'.review','Missing review record');
  for(const r of question.references){if(!isOfficialSource(r.url))issue(path+'.references','Use a canonical Microsoft Learn HTTPS source')}
 };
 const installedIds=new Set<string>();
 for(const [i,p] of b.packs.entries())for(const [j,question] of p.questions.entries()){if(installedIds.has(question.id))issue(`packs[${i}].questions[${j}]`,'Duplicate installed question identity');installedIds.add(question.id);if(question.blueprintId!==p.blueprintId)issue(`packs[${i}].questions[${j}]`,'Question blueprint differs from pack');inspectQuestion(question,`packs[${i}].questions[${j}]`)}
 for(const [i,s] of b.sessions.entries())for(const [j,question] of s.questionSnapshots.entries())inspectQuestion(question,`sessions[${i}].questionSnapshots[${j}]`);
 for(const [i,a] of b.attempts.entries())inspectQuestion(a.questionSnapshot,`attempts[${i}].questionSnapshot`);
 for(const [i,s] of b.sourceChecks.entries()){if(!isOfficialSource(s.canonicalUrl))issue(`sourceChecks[${i}].canonicalUrl`,'Use a canonical Microsoft Learn HTTPS source')}
 for(const table of ['contentTrust','reviews','bookmarks','notes'] as const)for(const [i,r] of b[table].entries())if(!identities.has(identityKey(r.questionId,r.revision)))issue(`${table}[${i}]`,'Dangling question revision');
 for(const [i,r] of b.releasedHoldouts.entries())if(!questionIds.has(r.questionId))issue(`releasedHoldouts[${i}]`,'Dangling question identity');
 const sessions=new Map(b.sessions.map(s=>[s.id,s]));const attempts=new Map(b.attempts.map(a=>[a.id,a]));
 const attemptsBySession=new Map<string,Attempt[]>(),attemptPairs=new Set<string>();
 for(const [i,a] of b.attempts.entries()){const pair=JSON.stringify([a.sessionId,a.questionId]);if(a.id!==`${a.sessionId}:${a.questionId}`)issue(`attempts[${i}].id`,'Attempt ID must match sessionId:questionId');if(attemptPairs.has(pair))issue(`attempts[${i}]`,'Duplicate session/question attempt');attemptPairs.add(pair);const group=attemptsBySession.get(a.sessionId)??[];group.push(a);attemptsBySession.set(a.sessionId,group)}
 for(const [i,s] of b.sessions.entries()){
  const path=`sessions[${i}]`,questions=new Map(s.questionSnapshots.map(question=>[question.id,question]));
  if(questions.size!==s.questionSnapshots.length||s.questionSnapshots.length===0||s.currentIndex>=s.questionSnapshots.length)issue(path,'Invalid session question list or position');
  if(s.deadlineAt&&(Date.parse(s.deadlineAt)<=Date.parse(s.startedAt)))issue(path+'.deadlineAt','Deadline must follow start');
  if((s.mode==='timed'&&!isTimedSession(s))||(s.mode==='learn'&&isTimedSession(s)))issue(path+'.deadlineAt','Timed sessions require a deadline and learning sessions cannot have one');
  if((s.status==='submitted')!==(s.submittedAt!==null)||s.submittedAt&&Date.parse(s.submittedAt)<Date.parse(s.startedAt))issue(path+'.submittedAt','Invalid submission date');
  for(const [id,order] of Object.entries(s.optionOrders)){const question=questions.get(id);if(!question||order.length!==question.options.length||order.some(option=>!question.options.some(o=>o.id===option)))issue(path+'.optionOrders','Invalid saved option order')}
  for(const question of s.questionSnapshots)if(!Object.hasOwn(s.optionOrders,question.id))issue(path+'.optionOrders','Missing saved option order');
  for(const [id,answer] of Object.entries(s.answers)){const question=questions.get(id);if(!question||answer.selectedOptionIds.length>question.requiredSelections||answer.selectedOptionIds.some(option=>!question.options.some(o=>o.id===option)))issue(path+'.answers','Invalid saved answer')}
  if(s.flags.some(id=>!questions.has(id))||s.correctionWarnings.some(r=>!s.questionSnapshots.some(q=>q.id===r.questionId&&q.revision===r.revision)))issue(path,'Dangling session question reference');
  const sessionAttempts=attemptsBySession.get(s.id)??[];
  if((s.status==='submitted')!==(s.result!==undefined))issue(path+'.result','Submitted sessions require a result; active sessions cannot have one');
  if(isTimedSession(s)&&s.status==='active'&&sessionAttempts.length)issue(path,'Active timed sessions cannot contain final attempts');
  if(s.status==='submitted'&&(sessionAttempts.length!==s.questionSnapshots.length||s.questionSnapshots.some(q=>!sessionAttempts.some(a=>a.questionId===q.id&&a.questionRevision===q.revision))))issue(path,'Submitted session must contain one attempt for every saved question');
  if(s.result){
   const r=s.result,domainIds=new Set(s.questionSnapshots.map(q=>q.domainId));
   if(r.sessionId!==s.id||r.submittedAt!==s.submittedAt||r.total!==s.questionSnapshots.length||r.correct!==sessionAttempts.filter(a=>a.correct).length||r.attemptIds.length!==sessionAttempts.length||r.attemptIds.some(id=>attempts.get(id)?.sessionId!==s.id)||sessionAttempts.some(a=>!r.attemptIds.includes(a.id)))issue(path+'.result','Inconsistent session result or incomplete attempt references');
   if(r.domainResults.length!==domainIds.size||new Set(r.domainResults.map(d=>d.domainId)).size!==r.domainResults.length||r.domainResults.some(d=>!domainIds.has(d.domainId)||d.total!==s.questionSnapshots.filter(q=>q.domainId===d.domainId).length||d.correct!==sessionAttempts.filter(a=>a.questionSnapshot.domainId===d.domainId&&a.correct).length))issue(path+'.result.domainResults','Domain totals must match saved session attempts');
  }
 }
 for(const [i,a] of b.attempts.entries()){
  const s=sessions.get(a.sessionId),q=a.questionSnapshot;
  const saved=s?.questionSnapshots.find(sq=>sq.id===a.questionId&&sq.revision===a.questionRevision);
  if(!s||!saved||canonical(saved)!==canonical(q)||q.id!==a.questionId||q.revision!==a.questionRevision||(s&&!isTimedSession(s)&&!canSubmit(q,a.selectedOptionIds))||a.selectedOptionIds.length>q.requiredSelections||a.selectedOptionIds.some(id=>!q.options.some(o=>o.id===id))||s.mode!==a.mode)issue(`attempts[${i}]`,'Dangling or inconsistent attempt reference');
  if(a.correct!==scoreAnswer(q,a.selectedOptionIds))issue(`attempts[${i}].correct`,'Attempt score differs from its saved question');
  if(s){
   if(Date.parse(a.submittedAt)<Date.parse(s.startedAt)||s.submittedAt&&Date.parse(a.submittedAt)>Date.parse(s.submittedAt)||isTimedSession(s)&&a.submittedAt!==s.submittedAt)issue(`attempts[${i}].submittedAt`,'Attempt submission date is inconsistent with its session');
   const answer=s.answers[a.questionId];
   if(answer?(canonical(answer.selectedOptionIds)!==canonical(a.selectedOptionIds)||answer.confidence!==a.confidence||answer.responseMs!==a.responseMs):(!isTimedSession(s)||a.selectedOptionIds.length!==0||a.confidence!=='unknown'||a.responseMs!==0))issue(`attempts[${i}]`,'Attempt differs from its durable saved answer');
  }
 }
 return issues.length?reject():{valid:true,backup:b,issues};
}
