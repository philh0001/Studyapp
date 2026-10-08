import type {FlashcardSchedule} from '../../study/flashcards';
export interface ReasoningRecord {
 id:string;objectiveId:string;questionId:string;revision:number;
 ownReasoning:string;missedCondition:string;correctedReasoning:string;comprehension:string;updatedAt:string;
}
export interface LearningState {schedules:FlashcardSchedule[];records:ReasoningRecord[]}
const record=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const text=(x:unknown):x is string=>typeof x==='string'&&x.length<=2000;
const date=(x:unknown):x is string=>typeof x==='string'&&Number.isFinite(Date.parse(x));
/** Workspace imports are personal JSON, never content-review authority. */
export function normaliseLearningState(value:unknown):LearningState {
 if(!record(value))return {schedules:[],records:[]};
 const schedules:FlashcardSchedule[]=Array.isArray(value.schedules)?value.schedules.filter(record).filter(s=>text(s.cardId)&&text(s.questionId)&&Number.isInteger(s.revision)&&Number(s.revision)>0&&[0,1,2,3,4].includes(Number(s.stage))&&date(s.dueAt)&&date(s.lastReviewedAt)&&['again','remembered'].includes(String(s.grade))).slice(0,2000).map(s=>({cardId:String(s.cardId),questionId:String(s.questionId),revision:Number(s.revision),stage:Number(s.stage) as FlashcardSchedule['stage'],dueAt:String(s.dueAt),lastReviewedAt:String(s.lastReviewedAt),grade:s.grade as FlashcardSchedule['grade']})):[];
 const records:ReasoningRecord[]=Array.isArray(value.records)?value.records.filter(record).filter(r=>[r.id,r.objectiveId,r.questionId,r.ownReasoning,r.missedCondition,r.correctedReasoning,r.comprehension].every(text)&&Number.isInteger(r.revision)&&Number(r.revision)>=1&&date(r.updatedAt)).slice(0,100).map(r=>({id:String(r.id),objectiveId:String(r.objectiveId),questionId:String(r.questionId),revision:Number(r.revision),ownReasoning:String(r.ownReasoning),missedCondition:String(r.missedCondition),correctedReasoning:String(r.correctedReasoning),comprehension:String(r.comprehension),updatedAt:String(r.updatedAt)})):[];
 return {schedules,records};
}
