import draft from '../../../content/learning/az104-learning-draft.json';
import evidence from '../../../content/learning/source-evidence.json';
import resources from '../../../content/learning-resources.json';
export const teaching=draft;
export const readings=resources;
export const sourceEvidence=evidence.sources;
export interface LabProgress{prerequisites:boolean[];steps:boolean[];cleanup:boolean;observations:string}
export interface ExplorerState{readings:Record<string,string>;bookmarks:string[];labs:Record<string,LabProgress>;resume:string}
const object=(v:unknown):Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
export function normaliseExplorer(value:unknown):ExplorerState{
 const input=object(value),completed=object(input.readings),labs=object(input.labs);
 const result:ExplorerState={readings:{},bookmarks:[],labs:{},resume:''};
 for(const objective of teaching.objectives){const time=completed[objective.id];if(typeof time==='string'&&time.length<=40&&Number.isFinite(Date.parse(time)))result.readings[objective.id]=new Date(time).toISOString()}
 result.bookmarks=Array.isArray(input.bookmarks)?[...new Set(input.bookmarks.filter((v):v is string=>typeof v==='string'&&readings.some(r=>r.url===v)))].slice(0,readings.length):[];
 for(const lab of teaching.walkthroughs){const row=object(labs[lab.id]);if(!Object.keys(row).length)continue;result.labs[lab.id]={prerequisites:lab.prerequisites.map((_,i)=>Array.isArray(row.prerequisites)&&row.prerequisites[i]===true),steps:lab.steps.map((_,i)=>Array.isArray(row.steps)&&row.steps[i]===true),cleanup:row.cleanup===true,observations:typeof row.observations==='string'?row.observations.slice(0,4000):''}}
 if(typeof input.resume==='string'&&teaching.walkthroughs.some(l=>l.id===input.resume))result.resume=input.resume;
 return result;
}
export function searchObjectives(query:string,objectiveId:string){const term=query.trim().toLowerCase().slice(0,500);return teaching.objectives.filter(o=>(!objectiveId||o.id===objectiveId)&&JSON.stringify(o).toLowerCase().includes(term))}
export function blankLab(id:string):LabProgress{const lab=teaching.walkthroughs.find(l=>l.id===id)!;return {prerequisites:lab.prerequisites.map(()=>false),steps:lab.steps.map(()=>false),cleanup:false,observations:''}}
export function labComplete(progress:LabProgress){return progress.prerequisites.every(Boolean)&&progress.steps.every(Boolean)&&progress.cleanup}
