import {checkPack as check,checkBlueprint} from './generated/validators.js';
export {checkBlueprint};
import type {Blueprint,ContentPack,ValidationIssue} from './types';
export function isOfficialSource(url:string):boolean {try { const u=new URL(url);return u.protocol==='https:'&&u.hostname==='learn.microsoft.com'&&!u.username&&!u.password&&!u.port;}catch{return false}}
export function validatePack(input:unknown,blueprint:Blueprint):{pack:ContentPack|null;issues:ValidationIssue[]} {
 if(!check(input))return {pack:null,issues:(check.errors??[]).map(e=>({path:e.instancePath.replace(/^\//,'').replaceAll('/','.')+(e.params.missingProperty?'.'+e.params.missingProperty:''),message:e.message??'Invalid field'}))};
 const pack=input as ContentPack,issues:ValidationIssue[]=[],seen=new Set<string>();
 const issue=(path:string,message:string)=>issues.push({path,message});
 if(pack.blueprintId!==blueprint.id)issue('blueprintId','Unknown blueprint');
 for(const [i,q] of pack.questions.entries()){
  const p=`questions[${i}]`;
  if(seen.has(q.id))issue(p+'.id','Duplicate question identity');seen.add(q.id);
  if(q.blueprintId!==blueprint.id||!blueprint.domains.some(d=>d.id===q.domainId&&d.objectives.some(o=>o.id===q.objectiveId)))issue(p+'.objectiveId','Unknown objective/domain mapping');
  const opts=new Set(q.options.map(o=>o.id)), refs=new Set(q.references.map(r=>r.id));
  if(opts.size!==q.options.length||refs.size!==q.references.length)issue(p,'Duplicate option/reference IDs');
  const ordered=q.type==='ordering'||q.type==='matching';
  if(q.correctOptionIds.length!==q.requiredSelections||(ordered?q.requiredSelections!==q.options.length:q.requiredSelections>=q.options.length)||q.correctOptionIds.some(id=>!opts.has(id))||(q.type==='single'&&q.requiredSelections!==1)||(q.type==='multiple'&&q.requiredSelections<2))issue(p+'.correctOptionIds','Incorrect answer count or IDs');
  if(q.type==='matching'){if(!q.matchPrompts||q.matchPrompts.length!==q.options.length||new Set(q.matchPrompts.map(x=>x.id)).size!==q.matchPrompts.length)issue(p+'.matchPrompts','Matching requires unique prompts and every option once')}
  else if(q.matchPrompts)issue(p+'.matchPrompts','Prompts are only valid for matching questions');
  const objective=blueprint.domains.find(d=>d.id===q.domainId)?.objectives.find(o=>o.id===q.objectiveId);
  if(q.subObjectiveIds?.some(id=>!objective?.subObjectives.some((_,index)=>id===`${objective.id}.${index+1}`)))issue(p+'.subObjectiveIds','Unknown subskill for this objective');
  for(const [j,exhibit] of (q.exhibits??[]).entries()){
   if(exhibit.type==='table'&&(!exhibit.columns?.length||!exhibit.rows?.length||exhibit.rows.some(row=>row.length!==exhibit.columns!.length)))issue(p+`.exhibits[${j}]`,'Table requires columns and rectangular rows');
   if(exhibit.type!=='table'&&!exhibit.text?.trim())issue(p+`.exhibits[${j}]`,'Code and diagram exhibits require accessible text');
  }
  for(const [j,o] of q.options.entries())if(o.referenceIds.some(id=>!refs.has(id)))issue(p+`.options[${j}].referenceIds`,'Unknown evidence reference');
  if(q.summaryReferenceIds.some(id=>!refs.has(id)))issue(p+'.summaryReferenceIds','Unknown summary evidence');
  for(const r of q.references)if(!isOfficialSource(r.url))issue(p+'.references','Use a canonical Microsoft Learn HTTPS URL');
  if(['reviewed','verified'].includes(q.status)&&!q.review)issue(p+'.review','Review record required');
 }
 return {pack:issues.length?null:pack,issues};
}
