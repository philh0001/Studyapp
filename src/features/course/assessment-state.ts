import {validateWorkspaceValue} from '../../storage/workspace';
import type {ModuleAssessmentPack,ModuleAssessmentState} from './assessment-types';
export function assessmentKey(moduleId:string):string{return `module-check:${moduleId}`}
// Retain the exact content identity rather than accepting collisions in a short non-cryptographic hash.
export function assessmentContentIdentity(pack:ModuleAssessmentPack):string{return JSON.stringify({moduleId:pack.moduleId,revision:pack.revision,checkedAt:pack.checkedAt,questions:pack.questions.map(q=>({id:q.id,prompt:q.prompt,lessonIds:q.lessonIds,correctOptionId:q.correctOptionId,options:q.options.map(o=>({id:o.id,text:o.text,explanation:o.explanation,sourceUrls:o.sourceUrls}))}))})}
export function initialAssessmentState(pack:ModuleAssessmentPack):ModuleAssessmentState{return {schemaVersion:1,moduleId:pack.moduleId,packRevision:pack.revision,questionIds:pack.questions.map(q=>q.id),contentIdentity:assessmentContentIdentity(pack),currentIndex:0,answers:{},previousAttempt:null}}
function record(value:unknown):value is Record<string,unknown>{return value!==null&&typeof value==='object'&&!Array.isArray(value)&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null)}
function fields(row:Record<string,unknown>,keys:string[]):boolean{return Object.keys(row).length===keys.length&&Object.keys(row).every(key=>keys.includes(key))}
export function normaliseAssessmentState(value:unknown,pack:ModuleAssessmentPack):ModuleAssessmentState{
 const initial=initialAssessmentState(pack);
 try{validateWorkspaceValue(value)}catch{return initial}
 if(!record(value)||!fields(value,Object.keys(initial))||value.schemaVersion!==1||value.moduleId!==pack.moduleId||value.packRevision!==pack.revision||value.contentIdentity!==initial.contentIdentity||!Array.isArray(value.questionIds)||JSON.stringify(value.questionIds)!==JSON.stringify(initial.questionIds)||typeof value.currentIndex!=='number'||!Number.isInteger(value.currentIndex)||value.currentIndex<0||value.currentIndex>pack.questions.length||!record(value.answers))return initial;
 const answers:ModuleAssessmentState['answers']={};
 for(const [id,saved] of Object.entries(value.answers)){
  const index=initial.questionIds.indexOf(id),question=pack.questions[index];
  if(index<0||index>value.currentIndex||!record(saved)||!fields(saved,['selectedOptionId','submitted'])||typeof saved.selectedOptionId!=='string'||!question.options.some(o=>o.id===saved.selectedOptionId)||typeof saved.submitted!=='boolean'||index<value.currentIndex&&!saved.submitted)return initial;
  answers[id]={selectedOptionId:saved.selectedOptionId,submitted:saved.submitted};
 }
 for(let index=0;index<value.currentIndex;index++)if(!answers[initial.questionIds[index]]?.submitted)return initial;
 let previousAttempt:ModuleAssessmentState['previousAttempt']=null;
 if(value.previousAttempt!==null){
  if(!record(value.previousAttempt)||!fields(value.previousAttempt,['answers'])||!record(value.previousAttempt.answers)||!fields(value.previousAttempt.answers,initial.questionIds))return initial;
  const previous:Record<string,string>={};
  for(const q of pack.questions){const selected=value.previousAttempt.answers[q.id];if(typeof selected!=='string'||!q.options.some(o=>o.id===selected))return initial;previous[q.id]=selected}
  previousAttempt={answers:previous};
 }
 return {...initial,currentIndex:value.currentIndex,answers,previousAttempt};
}
export function assessmentScore(state:ModuleAssessmentState,pack:ModuleAssessmentPack):number{return pack.questions.filter(q=>state.answers[q.id]?.submitted&&state.answers[q.id].selectedOptionId===q.correctOptionId).length}
