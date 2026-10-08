import type {Question,ContentTrust} from '../content/types';import type {ReviewItem} from './review';import {classifyQuestion} from '../content/trust';
export interface SelectionInput {questions:Question[];trust:ContentTrust[];reviewItems:ReviewItem[];objectiveStats:{objectiveId:string;distinctAttempts:number;accuracy:number;confidentWrongCount:number}[];previousSessionIds:string[];attemptedIds:string[];requestedCount:number;mode:'learn'|'timed'|'draft-preview';useReserved:boolean;domainId?:string;objectiveId?:string;now:Date;random:()=>number;releasedIds?:string[]}
export interface SelectionResult {questions:Question[];requestedCount:number;availableCount:number;shortages:string[];releasesReservedIds:string[];allocations:number[]}
export function allocations(count:number,weights=[.4,.25,.2,.15]):number[]{const raw=weights.map(x=>x*count),rounded=raw.map(Math.floor);const ranked=raw.map((x,i)=>({i,remainder:x-rounded[i]})).sort((a,b)=>b.remainder-a.remainder||a.i-b.i);let missing=count-rounded.reduce((a,b)=>a+b,0);for(const r of ranked){if(!missing--)break;rounded[r.i]++}return rounded}
function shuffle<T>(items:T[],random:()=>number):T[]{const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.min(i,Math.floor(random()*(i+1)));[result[i],result[j]]=[result[j],result[i]]}return result}
export function selectQuestions(i:SelectionInput):SelectionResult{
 const all=i.questions.filter(q=>(i.mode==='draft-preview'?q.status!=='retired':classifyQuestion(q,i.trust.find(t=>t.questionId===q.id&&t.revision===q.revision)??null)==='eligible')&&(!i.domainId||q.domainId===i.domainId)&&(!i.objectiveId||q.objectiveId===i.objectiveId)&&(!q.assessmentReserved||i.useReserved||i.releasedIds?.includes(q.id)));
 const unique=[...new Map(all.map(q=>[q.id,q])).values()],count=Math.min(i.requestedCount,unique.length),shortages:string[]=[];
 let candidates=shuffle(unique,i.random);if(candidates.filter(q=>!i.previousSessionIds.includes(q.id)).length>=count)candidates=candidates.filter(q=>!i.previousSessionIds.includes(q.id));
 const selected:Question[]=[],seen=new Set<string>(),take=(pool:Question[],n:number)=>{for(const q of pool){if(n<=0)break;if(!seen.has(q.id)){selected.push(q);seen.add(q.id);n--}}};
 const mix=allocations(i.requestedCount);
 if(i.mode==='timed'&&!i.domainId){const domains=['identity','storage','compute','networking','monitoring'],quotas=allocations(count,[22.5,17.5,22.5,17.5,12.5].map(x=>x/92.5));domains.forEach((d,n)=>{const pool=candidates.filter(q=>q.domainId===d);if(pool.length<quotas[n])shortages.push(`Limited ${d} coverage`);take(pool,quotas[n])})}else{
 const due=candidates.filter(q=>i.reviewItems.some(r=>r.questionId===q.id&&Date.parse(r.dueAt)<=i.now.getTime())).sort((a,b)=>Number(i.reviewItems.find(r=>r.questionId===b.id)?.misconception)-Number(i.reviewItems.find(r=>r.questionId===a.id)?.misconception));
 const weak=candidates.filter(q=>i.objectiveStats.some(s=>s.objectiveId===q.objectiveId&&s.distinctAttempts>=5&&(s.accuracy<.7||s.confidentWrongCount>0))||i.reviewItems.some(r=>r.questionId===q.id&&r.misconception));
 const unseen=candidates.filter(q=>!i.attemptedIds.includes(q.id)),reinforcement=candidates.filter(q=>i.attemptedIds.includes(q.id));
 [weak,due,unseen,reinforcement].forEach((pool,n)=>take(pool,mix[n]));
 }
 take(candidates,count-selected.length);if(unique.length<i.requestedCount)shortages.push(`Only ${unique.length} unique questions are available`);
 return {questions:selected.slice(0,count),requestedCount:i.requestedCount,availableCount:unique.length,shortages,releasesReservedIds:selected.filter(q=>q.assessmentReserved&&!i.releasedIds?.includes(q.id)).map(q=>q.id),allocations:mix};
}
