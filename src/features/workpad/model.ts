export interface Workpad {
 approach:string;requirements:string;assumptions:string;confidenceReasoning:string;reflection:string;nextReading:string;
 eliminations:{optionId:string;reason:string}[];
 checklist:{text:string;done:boolean}[];checklistDraft:string;
}
export const WORKPAD_TEXT_LIMIT=4000;
function record(value:unknown):Record<string,unknown>{return value!==null&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:{}}
function text(value:unknown,limit=WORKPAD_TEXT_LIMIT){return typeof value==='string'?value.slice(0,limit):''}
export function normaliseWorkpad(input:unknown,optionIds:string[]):Workpad{
 const value=record(input),seen=new Set<string>();
 const eliminations:Workpad['eliminations']=[];
 if(Array.isArray(value.eliminations))for(const item of value.eliminations.slice(0,100)){
  const row=record(item);if(typeof row.optionId!=='string'||!optionIds.includes(row.optionId)||seen.has(row.optionId))continue;
  seen.add(row.optionId);eliminations.push({optionId:row.optionId,reason:text(row.reason,1000)});
 }
 const checklist:Workpad['checklist']=[];
 if(Array.isArray(value.checklist))for(const item of value.checklist.slice(0,20)){
  const row=record(item),label=text(row.text,500);if(!label.trim())continue;checklist.push({text:label,done:row.done===true});
 }
 return {approach:text(value.approach),requirements:text(value.requirements),assumptions:text(value.assumptions),confidenceReasoning:text(value.confidenceReasoning),reflection:text(value.reflection),nextReading:text(value.nextReading),eliminations,checklist,checklistDraft:text(value.checklistDraft,500)};
}
function identityPart(value:string){return Array.from(value,char=>/^[a-zA-Z0-9_-]$/.test(char)?char:`%${char.codePointAt(0)?.toString(16)}%`).join('')}
export function workpadKey(session:string,question:string,revision:number){return `workpad:${identityPart(session)}:${identityPart(question)}:${revision}`}
