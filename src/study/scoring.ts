import type {Question} from '../content/types';
export function canSubmit(q:Question,ids:readonly string[]):boolean{return ids.length===q.requiredSelections&&new Set(ids).size===ids.length&&ids.every(id=>q.options.some(o=>o.id===id))}
export function scoreAnswer(q:Question,ids:readonly string[]):boolean{return canSubmit(q,ids)&&ids.length===q.correctOptionIds.length&&ids.every(id=>q.correctOptionIds.includes(id))}
