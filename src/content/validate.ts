import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../../content/schemas/question-pack.schema.json' with {type:'json'};
import blueprintSchema from '../../content/schemas/blueprint.schema.json' with {type:'json'};
import type { Blueprint,ContentPack,ValidationIssue } from './types';
const ajv=new Ajv({allErrors:true}); addFormats(ajv);
const check=ajv.compile<ContentPack>(schema); export const checkBlueprint=ajv.compile(blueprintSchema);
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
  if(q.correctOptionIds.length!==q.requiredSelections||q.requiredSelections>=q.options.length||q.correctOptionIds.some(id=>!opts.has(id))||(q.type==='single'&&q.requiredSelections!==1)||(q.type==='multiple'&&q.requiredSelections<2))issue(p+'.correctOptionIds','Incorrect answer count or IDs');
  for(const [j,o] of q.options.entries())if(o.referenceIds.some(id=>!refs.has(id)))issue(p+`.options[${j}].referenceIds`,'Unknown evidence reference');
  if(q.summaryReferenceIds.some(id=>!refs.has(id)))issue(p+'.summaryReferenceIds','Unknown summary evidence');
  for(const r of q.references)if(!isOfficialSource(r.url))issue(p+'.references','Use a canonical Microsoft Learn HTTPS URL');
  if(['reviewed','verified'].includes(q.status)&&!q.review)issue(p+'.review','Review record required');
 }
 return {pack:issues.length?null:pack,issues};
}
