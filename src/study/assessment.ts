import blueprint from '../../content/blueprints/az104-2026-04-17.json';
import type {ContentTrust,Question} from '../content/types';
import {classifyQuestion} from '../content/trust';
import {allocations,type SelectionInput,type SelectionResult} from './selection';
interface CaseOptions {trust:ContentTrust[];draft:boolean;useReserved:boolean;releasedIds?:string[]}
function allowed(q:Question,options:CaseOptions):boolean{return (options.draft?q.status!=='retired'&&classifyQuestion(q,options.trust.find(t=>t.questionId===q.id&&t.revision===q.revision)??null)!=='invalidated':classifyQuestion(q,options.trust.find(t=>t.questionId===q.id&&t.revision===q.revision)??null)==='eligible')&&(!q.assessmentReserved||options.useReserved||!!options.releasedIds?.includes(q.id))}
export function selectCaseStudy(questions:Question[],groupId:string,options:CaseOptions):Question[]{const group=questions.filter(q=>q.caseStudy?.id===groupId);return group.length&&group.every(q=>allowed(q,options))?group:[]}
export function selectBalancedAssessment(input:SelectionInput):SelectionResult{
 const candidates=[...new Map(input.questions.filter(q=>allowed(q,{trust:input.trust,draft:input.mode==='draft-preview',useReserved:input.useReserved,releasedIds:input.releasedIds})&&(!input.domainId||q.domainId===input.domainId)&&(!input.objectiveId||q.objectiveId===input.objectiveId)).map(q=>[q.id,q])).values()];
 // A tied deterministic random source retains stable ordering; prior-session questions go last.
 const ranked=candidates.map(q=>({q,tie:input.random()})).sort((a,b)=>Number(input.previousSessionIds.includes(a.q.id))-Number(input.previousSessionIds.includes(b.q.id))||a.tie-b.tie).map(x=>x.q);
 const domains=blueprint.domains.filter(d=>!input.domainId||d.id===input.domainId),weights=domains.map(d=>(d.weight[0]+d.weight[1])/2),total=weights.reduce((a,b)=>a+b,0),quotas=allocations(input.requestedCount,weights.map(w=>w/total));
 const selected:Question[]=[],shortages:string[]=[];
 const balanced=(pool:Question[])=>{const groups=[...new Set(pool.map(q=>q.objectiveId))].map(id=>pool.filter(q=>q.objectiveId===id)),result:Question[]=[];while(groups.some(g=>g.length))for(const group of groups){const q=group.shift();if(q)result.push(q)}return result};
 domains.forEach((d,index)=>{const pool=balanced(ranked.filter(q=>q.domainId===d.id));selected.push(...pool.slice(0,quotas[index]));if(pool.length<quotas[index])shortages.push(`Limited ${d.id} coverage: ${pool.length} available for ${quotas[index]} allocated`)});
 const target=Math.min(input.requestedCount,candidates.length),selectedIds=new Set(selected.map(q=>q.id));selected.push(...balanced(ranked.filter(q=>!selectedIds.has(q.id))).slice(0,Math.max(0,target-selected.length)));
 if(candidates.length<input.requestedCount)shortages.push(`Only ${candidates.length} unique questions are available`);
 return {questions:selected.slice(0,target),requestedCount:input.requestedCount,availableCount:candidates.length,shortages,releasesReservedIds:selected.filter(q=>q.assessmentReserved&&!input.releasedIds?.includes(q.id)).map(q=>q.id),allocations:quotas};
}
