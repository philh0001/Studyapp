import type {DatabaseSnapshot} from '../../sessions/types';
import type {SourceCheck} from '../../content/types';
import type {BlueprintChange} from '../../content/blueprint-diff';
import type {SectionChange} from '../../content/section-diff';
import {isOfficialSource} from '../../content/validate';
import {classifyQuestion} from '../../content/trust';
export interface SectionEntry {referenceId:string;canonicalUrl:string;checkedAt:string;status:'unchanged'|'changed'|'unavailable'|'baseline-missing';baselineHash:string|null;contentHash:string|null;changes:SectionChange[];error?:string|null}
export interface SectionReport {version:1;kind:'sections';generatedAt:string;entries:SectionEntry[]}
export interface BlueprintReport {version:1;kind:'blueprint';generatedAt:string;baselineId:string;candidateId?:string;source:string;status:'unchanged'|'changed'|'unavailable';changes:BlueprintChange[];requiresReview:boolean;error?:string|null;contentHash?:string;candidate?:{effectiveDate:string}|null}
export type EvidenceReport=SectionReport|BlueprintReport;
export interface SourceRow {referenceId:string;url:string;checkedAt:string|null;ageDays:number|null;stale:boolean;hash:string|null;state:SourceCheck['result']|'baseline-missing';requiresCorrection:boolean;affected:string[];reviewedCount:number}
export function sourceRows(snapshot:DatabaseSnapshot,now=new Date()):SourceRow[]{
 const questions=[...snapshot.packs.flatMap(p=>p.questions),...snapshot.sessions.flatMap(s=>s.questionSnapshots)],checks=snapshot.sourceChecks,ids=[...new Set([...checks.map(s=>s.referenceId),...questions.flatMap(q=>q.references.map(r=>r.id))])];
 return ids.map((referenceId):SourceRow=>{const check=checks.find(c=>c.referenceId===referenceId),linked=questions.filter(q=>q.references.some(r=>r.id===referenceId)),date=check?.checkedAt??null,ageDays=date?Math.max(0,Math.floor((now.getTime()-Date.parse(date))/86400000)):null;return {referenceId,url:check?.canonicalUrl??linked[0]?.references.find(r=>r.id===referenceId)?.url??'',checkedAt:date,ageDays,stale:ageDays===null||ageDays>=30,hash:check?.contentHash??null,state:check?.result??'baseline-missing',requiresCorrection:check?.result==='changed',affected:[...new Set(linked.map(q=>`${q.id}@${q.revision}`))],reviewedCount:new Set(linked.filter(q=>classifyQuestion(q,snapshot.contentTrust.find(t=>t.questionId===q.id&&t.revision===q.revision)??null)==='eligible').map(q=>`${q.id}@${q.revision}`)).size}}).sort((a,b)=>a.referenceId.localeCompare(b.referenceId));
}
function validDate(value:unknown):boolean{return typeof value==='string'&&Number.isFinite(Date.parse(value))}
function boundedText(value:unknown,max=200000):boolean{return typeof value==='string'&&value.length<=max}
function hash(value:unknown):boolean{return value===null||typeof value==='string'&&/^[a-f0-9]{64}$/.test(value)}
export function parseEvidenceReport(text:string):EvidenceReport{
 if(text.length>8_000_000)throw Error('Evidence report too large');const input:unknown=JSON.parse(text);if(!input||typeof input!=='object')throw Error('Invalid evidence report');const report=input as EvidenceReport;
 if(report.version!==1||!validDate(report.generatedAt))throw Error('Invalid evidence report date/version');
 if(report.kind==='sections'){
  if(!Array.isArray(report.entries)||report.entries.length>5000)throw Error('Invalid section entries');const ids=new Set();for(const entry of report.entries){
   if(!entry||!boundedText(entry.referenceId,200)||!entry.referenceId||ids.has(entry.referenceId)||!isOfficialSource(entry.canonicalUrl)||!validDate(entry.checkedAt)||!['unchanged','changed','unavailable','baseline-missing'].includes(entry.status)||!hash(entry.baselineHash)||!hash(entry.contentHash)||!Array.isArray(entry.changes)||entry.changes.length>1000)throw Error('Invalid section evidence');
   if(entry.status==='unavailable'&&entry.changes.length||entry.status==='unchanged'&&entry.changes.length||entry.status==='changed'&&!entry.changes.length)throw Error('Contradictory section evidence');
   for(const c of entry.changes)if(!c||!boundedText(c.sectionId,500)||!boundedText(c.title,2000)||!['added','removed','modified'].includes(c.kind)||c.before!==null&&!boundedText(c.before)||c.after!==null&&!boundedText(c.after))throw Error('Invalid section difference');ids.add(entry.referenceId);
  }
 }else if(report.kind==='blueprint'){
  if(!isOfficialSource(report.source)||!boundedText(report.baselineId,200)||!['unchanged','changed','unavailable'].includes(report.status)||typeof report.requiresReview!=='boolean'||!Array.isArray(report.changes)||report.changes.length>1000||report.status!=='changed'&&report.changes.length)throw Error('Invalid blueprint report');
  for(const c of report.changes)if(!c||!['effective-date','domain-added','domain-removed','weight','objective-added','objective-removed','subskills','order'].includes(c.kind)||c.domainId!==null&&!boundedText(c.domainId,200)||c.objectiveId!==null&&!boundedText(c.objectiveId,200)||!boundedText(c.reason,10000))throw Error('Invalid blueprint difference');
 }else throw Error('Expected a blueprint or section evidence report');
 return report;
}
export interface Resolution {state:'open'|'investigating'|'resolved';reason:string}
export function resolutionValue(state:Resolution['state'],reason:string):Resolution{if(!['open','investigating','resolved'].includes(state)||reason.length>10000)throw Error('Invalid resolution');if(state==='resolved'&&!reason.trim())throw Error('Record a resolution reason before closing this finding.');return {state,reason:reason.trim()}}
export function normaliseResolutions(value:unknown):Record<string,Resolution>{const result:Record<string,Resolution>={};if(!value||typeof value!=='object'||Array.isArray(value))return result;for(const [id,input] of Object.entries(value)){if(['__proto__','constructor','prototype'].includes(id)||!input||typeof input!=='object'||Array.isArray(input))continue;const note=input as Partial<Resolution>;if(!['open','investigating','resolved'].includes(note.state??'')||typeof note.reason!=='string'||note.reason.length>10000||note.state==='resolved'&&!note.reason.trim())continue;result[id]={state:note.state!,reason:note.reason};}return result;}
