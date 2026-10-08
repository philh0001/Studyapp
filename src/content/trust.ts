import type {Question,ContentTrust} from './types';
export function classifyQuestion(q:Question,t:ContentTrust|null):'eligible'|'draft'|'retired'|'invalidated'{
 if(t?.invalidatedAt)return 'invalidated';if(q.status==='retired')return 'retired';
 if(q.status==='draft'||!t?.humanReviewedAt||!t.reviewer||!t.sourceCheckedAt||t.questionId!==q.id||t.revision!==q.revision)return 'draft';
 return 'eligible';
}
export function isSourceCheckDue(checkedAt:string,now:Date):boolean{return !Number.isFinite(Date.parse(checkedAt))||now.getTime()-Date.parse(checkedAt)>=30*86400000}
