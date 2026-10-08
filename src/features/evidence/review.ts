import type {Question,ContentTrust} from '../../content/types';
import {isAssessmentSession,type DatabaseSnapshot} from '../../sessions/types';
import {classifyQuestion} from '../../content/trust';
export type IssueKind='factual'|'wording'|'source-freshness'|'ambiguity';
export type IssueStatus='open'|'investigating'|'resolved'|'deferred';
export interface ReviewIssue{ id:string;questionId:string;revision:number;kind:IssueKind;detail:string;status:IssueStatus;history:{at:string;status:IssueStatus;reason:string}[] }
export interface WordingProposal{id:string;questionId:string;baseRevision:number;proposedRevision:number;field:string;oldText:string;newText:string;reason:string;createdAt:string}
export interface AuditRecord{questionId:string;revision:number;disposition:string;optionAudits:unknown[]}
export interface ReviewFilters{queue:'all'|'drafts'|'corrections'|'approved';format:string;objective:string;search:string;domain?:string;difficulty?:string;issueKind?:string}
export function filterReviewQueue(questions:Question[],trust:ContentTrust[],issues:ReviewIssue[],filters:ReviewFilters):Question[]{return questions.filter(q=>{
 const state=classifyQuestion(q,trust.find(t=>t.questionId===q.id&&t.revision===q.revision)??null), correction=issues.some(i=>i.questionId===q.id&&i.revision===q.revision&&i.status!=='resolved')||state==='invalidated';
 const matchesQueue=filters.queue==='all'||(filters.queue==='drafts'&&state==='draft'&&!correction)||(filters.queue==='corrections'&&correction)||(filters.queue==='approved'&&state==='eligible');
 return matchesQueue&&(!filters.domain||filters.domain==='all'||q.domainId===filters.domain)&&(!filters.difficulty||filters.difficulty==='all'||q.difficulty===filters.difficulty)&&(!filters.issueKind||filters.issueKind==='all'||issues.some(i=>i.questionId===q.id&&i.revision===q.revision&&i.kind===filters.issueKind&&i.status!=='resolved'))&&(filters.format==='all'||q.type===filters.format)&&(filters.objective==='all'||q.objectiveId===filters.objective)&&`${q.id} ${q.scenario} ${q.prompt} ${q.domainId} ${q.objectiveId}`.toLowerCase().includes(filters.search.trim().toLowerCase());
})}
function required(text:string,label:string){if(!text.trim()||text.length>10000)throw Error(`${label} is required and must fit within 10000 characters.`);return text.trim()}
export function createIssue(q:Question,kind:IssueKind,detail:string,at=new Date().toISOString()):ReviewIssue{detail=required(detail,'Issue detail');return {id:crypto.randomUUID(),questionId:q.id,revision:q.revision,kind,detail,status:'open',history:[{at,status:'open',reason:detail}]}}
export function transitionIssue(i:ReviewIssue,status:IssueStatus,reason:string,at=new Date().toISOString()):ReviewIssue{reason=required(reason,'State change reason');return {...i,status,history:[...i.history,{at,status,reason}]}}
export function proposeWording(q:Question,field:string,newText:string,reason:string,createdAt=new Date().toISOString()):WordingProposal{
 const option=q.options.find(o=>field===`option:${o.id}`);const matchingPrompt=q.matchPrompts?.find(p=>field===`match:${p.id}`);const oldText=field==='prompt'?q.prompt:field==='scenario'?q.scenario:field==='summaryExplanation'?q.summaryExplanation:option?.text??matchingPrompt?.text;
 if(oldText===undefined)throw Error('Choose an editable wording field.');newText=required(newText,'Proposed wording');reason=required(reason,'Proposal reason');if(oldText===newText)throw Error('Proposed wording must change the selected field.');
 return {id:crypto.randomUUID(),questionId:q.id,baseRevision:q.revision,proposedRevision:q.revision+1,field,oldText,newText,reason,createdAt};
}
export function assessmentProtectedIds(snapshot:DatabaseSnapshot):Set<string>{return new Set(snapshot.sessions.filter(s=>s.status==='active'&&isAssessmentSession(s)).flatMap(s=>s.questionSnapshots.map(q=>q.id)))}
export function exportReviewReport(questions:Question[],issues:ReviewIssue[],proposals:WordingProposal[],checklists:Record<string,string[]>,audits:AuditRecord[]=[],historicalRevisions:unknown[]=[]):string{const ids=new Set(questions.map(q=>q.id));return JSON.stringify({schemaVersion:1,kind:'personal-review-report',exportedAt:new Date().toISOString(),humanApprovalGranted:false,notice:'Findings, proposals and checklists are personal review support. Importing them cannot grant factual approval.',questions:questions.map(q=>({questionId:q.id,revision:q.revision,objectiveId:q.objectiveId,references:q.references})),issues:issues.filter(i=>ids.has(i.questionId)),proposals:proposals.filter(p=>ids.has(p.questionId)),checklists:Object.fromEntries(Object.entries(checklists).filter(([key])=>questions.some(q=>key===`${q.id}:${q.revision}`))),audits:audits.filter(a=>ids.has(a.questionId)),historicalRevisions:historicalRevisions.filter(r=>r&&typeof r==='object'&&'questionId' in r&&ids.has(String(r.questionId)))},null,2)}
export function reviewChecklist(q:Question):{id:string;label:string}[]{return [
 {id:'sources',label:'Open and read the cited official sections; check dates and availability'}, {id:'answer',label:'Check the correct answer and required selection count'},
 ...q.options.map(o=>({id:`option:${o.id}`,label:`Check option ${o.id}: ${o.text} and its explanation`})),
 {id:'summary',label:'Check summary explanation against the retrieved evidence'},{id:'assumptions',label:'Check scope, prerequisites, SKU/licensing and availability assumptions'},
 ...(q.type==='ordering'?[{id:'ordering',label:'Check every dependency and whether another step order is valid'}]:[]),
 ...(q.type==='matching'?[{id:'matching',label:'Check each prompt-to-answer pairing and whether another mapping is valid'}]:[]),
 ...(q.caseStudy?[{id:'case',label:'Check persistent case facts and consistency with every linked question'}]:[]),
 {id:'ambiguity',label:'Check plausible alternatives, ambiguous wording and unresolved source claims'}
]}
export function qualitySummary(questions:Question[],trust:ContentTrust[],audits:AuditRecord[]){return {total:questions.length,humanApproved:questions.filter(q=>classifyQuestion(q,trust.find(t=>t.questionId===q.id&&t.revision===q.revision)??null)==='eligible').length,aiAudited:questions.filter(q=>audits.some(a=>a.questionId===q.id&&a.revision===q.revision)).length,uncertain:questions.filter(q=>!audits.some(a=>a.questionId===q.id&&a.revision===q.revision&&a.disposition==='supported')).length}}
