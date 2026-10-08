export type Confidence='confident'|'unsure'|'guessed'|'unknown';
export interface ReviewItem{questionId:string;revision:number;stage:0|1|2|3|4;dueAt:string;misconception:boolean}
export interface ReviewOutcome{questionId:string;revision:number;correct:boolean;confidence:Confidence;occurredAt:string;isDueAttempt:boolean}
export function scheduleReview(previous:ReviewItem|null,o:ReviewOutcome,now:Date):ReviewItem{
 const p=previous?.revision===o.revision?previous:null;
 if(p&&o.correct&&o.confidence==='confident'&&!o.isDueAttempt)return {...p};
 const stage=(!o.correct?0:o.confidence==='confident'?Math.min((p?.stage??0)+1,4):p?.stage??0) as ReviewItem['stage'];
 const days=(!o.correct||['unsure','guessed'].includes(o.confidence))?1:[1,3,7,14,30][stage];
 return {questionId:o.questionId,revision:o.revision,stage,dueAt:new Date(now.getTime()+days*86400000).toISOString(),misconception:!o.correct&&o.confidence==='confident'};
}
