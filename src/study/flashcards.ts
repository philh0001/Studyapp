import type {ContentTrust,Question,Reference} from '../content/types';
import {classifyQuestion} from '../content/trust';

export interface Flashcard {
 id:string; questionId:string; revision:number; objectiveId:string;
 kind:'answer'|'wrong-option'; front:string; back:string;
 referenceIds:string[]; references:Reference[];
}
export interface FlashcardSchedule {
 cardId:string; questionId:string; revision:number; stage:0|1|2|3|4;
 dueAt:string; lastReviewedAt:string; grade:'again'|'remembered';
}
export interface FlashcardIdentity {cardId:string;questionId:string;revision:number}

/** Teaching drafts never become cards, and reserved content requires explicit release. */
export function buildFlashcards(questions:Question[],trust:ContentTrust[],releasedIds:string[]=[]):Flashcard[] {
 return questions.flatMap(q=>{
  const approval=trust.find(t=>t.questionId===q.id&&t.revision===q.revision)??null;
  if(!['reviewed','verified'].includes(q.status)||classifyQuestion(q,approval)!=='eligible'||q.assessmentReserved&&!releasedIds.includes(q.id))return [];
  const answer:Flashcard={id:`${q.id}:${q.revision}:answer`,questionId:q.id,revision:q.revision,objectiveId:q.objectiveId,kind:'answer',front:`${q.scenario}\n${q.prompt}`,back:`${q.correctOptionIds.map(id=>q.options.find(o=>o.id===id)?.text??'').join('\n')}\n${q.summaryExplanation}`,referenceIds:[...q.summaryReferenceIds],references:q.references.filter(r=>q.summaryReferenceIds.includes(r.id))};
  const wrong=q.options.filter(o=>!q.correctOptionIds.includes(o.id)).map(o=>({...answer,id:`${q.id}:${q.revision}:wrong:${o.id}`,kind:'wrong-option' as const,front:`${q.scenario}\n${q.prompt}\nWhy is this option unsuitable? ${o.text}`,back:o.explanation,referenceIds:[...o.referenceIds],references:q.references.filter(r=>o.referenceIds.includes(r.id))}));
  return [answer,...wrong];
 });
}

/** Independent schedule: never writes the question review/proficiency schedule. */
export function scheduleFlashcard(previous:FlashcardSchedule|null,identity:FlashcardIdentity,grade:'again'|'remembered',now:Date):FlashcardSchedule {
 if(!Number.isFinite(now.getTime()))throw Error('A valid review date is required');
 if(!identity.cardId||!identity.questionId||!Number.isInteger(identity.revision)||identity.revision<1)throw Error('A valid card identity is required');
 const prior=previous?.cardId===identity.cardId&&previous.questionId===identity.questionId&&previous.revision===identity.revision?previous:null;
 if(prior&&grade==='remembered'&&Date.parse(prior.dueAt)>now.getTime())return {...prior};
 const stage=(grade==='again'?0:Math.min((prior?.stage??0)+1,4)) as FlashcardSchedule['stage'];
 const days=grade==='again'?1:[1,1,3,7,30][stage];
 return {...identity,stage,dueAt:new Date(now.getTime()+days*86400000).toISOString(),lastReviewedAt:now.toISOString(),grade};
}
