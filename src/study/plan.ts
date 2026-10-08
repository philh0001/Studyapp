export interface PlanObjective{id:string;title:string;studied:number;accuracy:number|null}
export interface StudyStep{kind:'review'|'topic';title:string;objectiveId?:string;reason:string}
export function buildStudyPlan(objectives:PlanObjective[],due:number):StudyStep[]{
 const priority=(o:PlanObjective)=>o.studied>=5&&o.accuracy!==null&&o.accuracy<.7?0:o.studied===0?1:o.studied<5?2:3;
 const topics=[...objectives].sort((a,b)=>priority(a)-priority(b)||(a.accuracy??0)-(b.accuracy??0)).slice(0,3);
 return [...(due?[{kind:'review' as const,title:'Revisit your due questions',reason:`${due} questions are due for revision.`}]:[]),...topics.map(o=>({kind:'topic' as const,title:o.title,objectiveId:o.id,reason:priority(o)===0?'Revisit a weaker topic, then explain the reasoning in your own words.':o.studied===0?'Read the official guide, then try a short session.':'Add distinct practice questions to build evidence.'}))];
}
