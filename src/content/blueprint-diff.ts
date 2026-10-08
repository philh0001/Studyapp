import type {Blueprint,Question} from './types';
import {plainText,sectionSlug} from './section-diff.ts';
export interface BlueprintChange {kind:'effective-date'|'domain-added'|'domain-removed'|'weight'|'objective-added'|'objective-removed'|'subskills'|'order';domainId:string|null;objectiveId:string|null;before:unknown;after:unknown;reason:string}
export interface BlueprintDiff {version:1;kind:'blueprint';baselineId:string;candidateId:string;status:'unchanged'|'changed';requiresReview:boolean;changes:BlueprintChange[]}
export function extractBlueprint(html:string,baseline:Blueprint,checkedAt=new Date().toISOString()):Blueprint{
 const start=/<h2\b[^>]*>\s*Skills measured as of ([\s\S]*?)<\/h2>/i.exec(html);
 if(!start)throw Error('Skills measured heading missing; preserve the prior blueprint.');
 const date=new Date(plainText(start[1])+' UTC');if(!Number.isFinite(date.getTime()))throw Error('Skills measured date is not supported; manual review required.');
 const effectiveDate=date.toISOString().slice(0,10),tail=html.slice(start.index+start[0].length),body=tail.split(/<h2\b/i)[0];
 const domains:Blueprint['domains']=[];let domain:Blueprint['domains'][number]|undefined,objective:Blueprint['domains'][number]['objectives'][number]|undefined;
 const parts=[...body.matchAll(/<(h3|h4|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
 for(const part of parts){const text=plainText(part[2]);if(part[1].toLowerCase()==='h3'){
  const weighted=/^(.*?)\s*\((\d+)[–-](\d+)%\)$/.exec(text);objective=undefined;domain=undefined;if(!weighted)continue;
  const title=weighted[1].trim(),old=baseline.domains.find(d=>d.title.toLowerCase()===title.toLowerCase());domain={id:old?.id??'proposed-'+sectionSlug(title),title,weight:[Number(weighted[2]),Number(weighted[3])],objectives:[]};domains.push(domain);
 }else if(part[1].toLowerCase()==='h4'&&domain){const old=baseline.domains.find(d=>d.id===domain?.id)?.objectives.find(o=>o.title.toLowerCase()===text.toLowerCase());objective={id:old?.id??'proposed-'+sectionSlug(text),title:text,subObjectives:[]};domain.objectives.push(objective)}
 else if(part[1].toLowerCase()==='li'&&objective&&text)objective.subObjectives.push(text);
 }
 if(!domains.length||domains.some(d=>!d.objectives.length||d.objectives.some(o=>!o.subObjectives.length)))throw Error('Incomplete measured skills; preserve the prior blueprint.');
 return {id:'az104-'+effectiveDate,certificationId:'AZ-104',effectiveDate,checkedAt,source:baseline.source,domains};
}
export function diffBlueprint(before:Blueprint,after:Blueprint):BlueprintDiff{
 const changes:BlueprintChange[]=[],add=(kind:BlueprintChange['kind'],domainId:string|null,objectiveId:string|null,old:unknown,next:unknown,reason:string)=>changes.push({kind,domainId,objectiveId,before:old,after:next,reason});
 if(before.effectiveDate!==after.effectiveDate)add('effective-date',null,null,before.effectiveDate,after.effectiveDate,'The published skills effective date changed; existing question mappings remain unchanged.');
 for(const d of before.domains){const next=after.domains.find(n=>n.id===d.id);if(!next){add('domain-removed',d.id,null,d,null,'Domain title no longer matches; inspect possible rename before remapping.');continue;}
 if(JSON.stringify(d.weight)!==JSON.stringify(next.weight))add('weight',d.id,null,d.weight,next.weight,'Assessment distribution may need review.');
 for(const o of d.objectives){const n=next.objectives.find(n=>n.id===o.id);if(!n)add('objective-removed',d.id,o.id,o,null,'Objective disappeared or was renamed; review linked questions.');else if(JSON.stringify(o.subObjectives)!==JSON.stringify(n.subObjectives))add('subskills',d.id,o.id,o.subObjectives,n.subObjectives,'Subskill wording or order changed; compare assumptions and explanations.');}
 for(const o of next.objectives)if(!d.objectives.some(n=>n.id===o.id))add('objective-added',d.id,o.id,null,o,'New objective or proposed rename requires an explicit mapping decision.');
 if(JSON.stringify(d.objectives.map(o=>o.id))!==JSON.stringify(next.objectives.map(o=>o.id))&&d.objectives.length===next.objectives.length&&d.objectives.every(o=>next.objectives.some(n=>n.id===o.id)))add('order',d.id,null,d.objectives.map(o=>o.id),next.objectives.map(o=>o.id),'Published objective ordering changed.');
 }
 for(const d of after.domains)if(!before.domains.some(n=>n.id===d.id))add('domain-added',d.id,null,null,d,'New domain or proposed rename requires an explicit mapping decision.');
 if(JSON.stringify(before.domains.map(d=>d.id))!==JSON.stringify(after.domains.map(d=>d.id))&&before.domains.length===after.domains.length&&before.domains.every(d=>after.domains.some(n=>n.id===d.id)))add('order',null,null,before.domains.map(d=>d.id),after.domains.map(d=>d.id),'Published domain ordering changed.');
 return {version:1,kind:'blueprint',baselineId:before.id,candidateId:after.id,status:changes.length?'changed':'unchanged',requiresReview:changes.length>0,changes};
}
export function blueprintImpact(report:BlueprintDiff,questions:Question[]):string[]{return [...new Set(questions.filter(q=>report.changes.some(c=>(c.domainId===null||c.domainId===q.domainId)&&(c.objectiveId===null||c.objectiveId===q.objectiveId))).map(q=>`${q.id}@${q.revision}`))]}
