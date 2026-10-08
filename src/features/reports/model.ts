import type {Question} from '../../content/types';
import {classifyQuestion,isStudyAvailable} from '../../content/trust';
import type {DatabaseSnapshot,SessionMode,SessionAnswer} from '../../sessions/types';
import {canSubmit} from '../../study/scoring';
import {isAssessmentSession} from '../../sessions/types';
export interface HistoryFilters {from:string;to:string;mode:SessionMode|'';domain:string}
function date(value:unknown):string {return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value?value:''}
export function normaliseFilters(value:unknown):HistoryFilters {const v=value&&typeof value==='object'?value as Record<string,unknown>:{};return {from:date(v.from),to:date(v.to),mode:v.mode==='learn'||v.mode==='timed'||v.mode==='draft-preview'?v.mode:'',domain:typeof v.domain==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(v.domain)?v.domain:''}}
export interface HistoryDetail {question:Question;answer:SessionAnswer|null;correct:boolean|null;stale:boolean;currentEligibleAttempt:boolean;eligibility:ReturnType<typeof classifyQuestion>}
export interface HistoryRow {id:string;mode:SessionMode;status:string;startedAt:string;submittedAt:string|null;answered:number;total:number;withheld:number;responseMs:number;formats:Record<Question['type'],number>;details:HistoryDetail[]}
export function deriveHistory(snapshot:DatabaseSnapshot, input:Partial<HistoryFilters>):HistoryRow[]{
 const filters=normaliseFilters(input);if(filters.from&&filters.to&&filters.from>filters.to)return [];
 const hidden=new Set(snapshot.sessions.filter(s=>s.status==='active'&&isAssessmentSession(s)).flatMap(s=>s.questionSnapshots.map(q=>q.id)));
 const current=snapshot.packs.flatMap(p=>p.questions);
 return snapshot.sessions.filter(s=>!filters.mode||s.mode===filters.mode).filter(s=>{const d=s.startedAt.slice(0,10);return (!filters.from||d>=filters.from)&&(!filters.to||d<=filters.to)}).flatMap(s=>{
 const questions=s.questionSnapshots.filter(q=>!filters.domain||q.domainId===filters.domain);if(filters.domain&&!questions.length)return [];
 const formats:HistoryRow['formats']={single:0,multiple:0,ordering:0,matching:0};let answered=0,responseMs=0,withheld=0;
 const details:HistoryDetail[]=[];
 for(const q of questions){const attempt=snapshot.attempts.find(a=>a.sessionId===s.id&&a.questionId===q.id&&a.questionRevision===q.revision);const answer=s.answers[q.id]??(attempt?{selectedOptionIds:attempt.selectedOptionIds,confidence:attempt.confidence,responseMs:attempt.responseMs}:null);const complete=!!answer&&canSubmit(q,answer.selectedOptionIds);if(complete)answered++;
 if(hidden.has(q.id)||(q.assessmentReserved&&!complete&&!snapshot.releasedHoldouts.some(r=>r.questionId===q.id))){withheld++;continue}
 if(complete&&answer){formats[q.type]++;if(Number.isFinite(answer.responseMs)&&answer.responseMs>0)responseMs+=answer.responseMs}
 const installed=current.filter(x=>x.id===q.id).sort((a,b)=>b.revision-a.revision)[0];const stale=!installed||installed.revision!==q.revision;const trust=snapshot.contentTrust.find(t=>t.questionId===q.id&&t.revision===q.revision)??null;
 details.push({question:q,answer,currentEligibleAttempt:complete&&!!attempt&&s.mode!=='draft-preview'&&attempt.mode!=='draft-preview'&&!stale&&!!installed&&isStudyAvailable(installed,trust),correct:attempt?.correct??null,stale,eligibility:stale&&classifyQuestion(q,trust)==='eligible'?'invalidated':classifyQuestion(q,trust)});
 }
 return [{id:s.id,mode:s.mode,status:s.status,startedAt:s.startedAt,submittedAt:s.submittedAt,answered,total:questions.length,withheld,responseMs,formats,details}];
 }).sort((a,b)=>b.startedAt.localeCompare(a.startedAt));
}
export function historyJSON(rows:HistoryRow[]):string{return JSON.stringify({kind:'personal-session-history',notice:'Personal practice history does not predict exam readiness. Withheld content is omitted.',sessions:rows},null,2)}
export function csvCell(value:unknown):string{let text=String(value??'');const probe=Array.from(text.trimStart());while(probe.length&&probe[0].charCodeAt(0)<=32)probe.shift();if(/^[=+@-]/.test(probe.join(''))||/^[\t\r\n]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"'}
export function historyCSV(rows:HistoryRow[]):string {const header=['Session','Started','Submitted','Mode','Status','Answered','Total','Measured response milliseconds','Single answers','Multiple answers','Ordering answers','Matching answers','Withheld questions'];return [header,...rows.map(r=>[r.id,r.startedAt,r.submittedAt,r.mode,r.status,r.answered,r.total,r.responseMs,r.formats.single,r.formats.multiple,r.formats.ordering,r.formats.matching,r.withheld])].map(row=>row.map(csvCell).join(',')).join('\r\n')}
