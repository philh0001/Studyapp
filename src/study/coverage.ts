import type {Blueprint,ContentTrust,Question} from '../content/types';
import type {Attempt} from '../sessions/types';
import {classifyQuestion} from '../content/trust';
export interface CoverageRow {id:string;title:string;domainId:string;objectiveId:string;installed:number;approved:number;studied:number;accuracy:number|null;insufficientEvidence:boolean}
export function computeCoverage(blueprint:Blueprint,questions:Question[],trust:ContentTrust[],attempts:Attempt[],legacyMappings:Record<string,string[]>={}):CoverageRow[]{
 const revisions=new Map<string,Question>();
 for(const q of questions){const previous=revisions.get(q.id);if(!previous||q.revision>=previous.revision)revisions.set(q.id,q)}
 const current=[...revisions.values()];
 const eligible=current.filter(q=>classifyQuestion(q,trust.find(t=>t.questionId===q.id&&t.revision===q.revision)??null)==='eligible');
 const latest=new Map<string,Attempt>();
 for(const a of attempts){if(a.mode==='draft-preview'||!eligible.some(q=>q.id===a.questionId&&q.revision===a.questionRevision))continue;const previous=latest.get(a.questionId);if(!previous||Date.parse(a.submittedAt)>=Date.parse(previous.submittedAt))latest.set(a.questionId,a)}
 const mapped=(q:Question,id:string)=> (q.subObjectiveIds??legacyMappings[`${q.id}@${q.revision}`]??[]).includes(id);
 return blueprint.domains.flatMap(d=>d.objectives.flatMap(o=>o.subObjectives.map((title,index)=>{const id=`${o.id}.${index+1}`,installed=current.filter(q=>q.status!=='retired'&&q.domainId===d.id&&q.objectiveId===o.id&&mapped(q,id)),approved=eligible.filter(q=>installed.includes(q)),studied=approved.flatMap(q=>latest.has(q.id)?[latest.get(q.id)!]:[]);return {id,title,domainId:d.id,objectiveId:o.id,installed:installed.length,approved:approved.length,studied:studied.length,accuracy:studied.length?studied.filter(a=>a.correct).length/studied.length:null,insufficientEvidence:studied.length<5}})));
}
