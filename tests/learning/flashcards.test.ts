import {it,expect} from 'vitest';
import {question} from '../fixtures';
import type {ContentTrust} from '../../src/content/types';
async function api(){const path='../../src/study/flashcards.ts';const result=await import(path).catch(()=>({}));expect(typeof result.buildFlashcards).toBe('function');return result}
const trust:ContentTrust={questionId:'q1',revision:1,sourceCheckedAt:'2026-10-08T00:00:00Z',humanReviewedAt:'2026-10-08T01:00:00Z',reviewer:'Personal review',invalidatedAt:null};
it('derives answer and wrong-option cards only from current eligible reviewed revisions',async()=>{
 const {buildFlashcards}=await api();const q=question({status:'reviewed',review:{reviewer:'Personal review',reviewedAt:trust.humanReviewedAt!,method:'Factual review'}});
 expect(buildFlashcards([question()], [trust])).toEqual([]);expect(buildFlashcards([q],[])).toEqual([]);expect(buildFlashcards([q],[{...trust,revision:2}])).toEqual([]);expect(buildFlashcards([q],[{...trust,invalidatedAt:trust.sourceCheckedAt}])).toEqual([]);
 const cards=buildFlashcards([q],[trust]);expect(cards).toHaveLength(3);expect(cards.filter((c:{kind:string})=>c.kind==='wrong-option')).toHaveLength(2);expect(cards[0].referenceIds).toEqual(['s1']);expect(cards.every((c:{revision:number})=>c.revision===1)).toBe(true);
});
it('keeps flashcard grades separate, resets on a changed revision, and does not move a not-yet-due card',async()=>{
 const {scheduleFlashcard}=await api();const now=new Date('2026-10-08T12:00:00Z');
 const first=scheduleFlashcard(null,{cardId:'q1:1:answer',questionId:'q1',revision:1},'remembered',now);expect(first.dueAt).toBe('2026-10-09T12:00:00.000Z');
 expect(scheduleFlashcard(first,{cardId:first.cardId,questionId:'q1',revision:1},'remembered',now)).toEqual(first);
 const forgot=scheduleFlashcard(first,{cardId:first.cardId,questionId:'q1',revision:1},'again',now);expect(forgot.stage).toBe(0);
 const revised=scheduleFlashcard({...first,stage:4},{cardId:'q1:2:answer',questionId:'q1',revision:2},'remembered',now);expect(revised.stage).toBe(1);expect(revised.revision).toBe(2);
 expect(()=>scheduleFlashcard(null,{cardId:'x',questionId:'q',revision:1},'remembered',new Date('invalid'))).toThrow();
});
it('does not reveal reserved reviewed explanations until the question has been explicitly released',async()=>{
 const {buildFlashcards}=await api();const q=question({assessmentReserved:true,status:'reviewed',review:{reviewer:'Personal review',reviewedAt:trust.humanReviewedAt!,method:'Factual review'}});
 expect(buildFlashcards([q],[trust])).toEqual([]);expect(buildFlashcards([q],[trust],['q1'])).toHaveLength(3);
});
