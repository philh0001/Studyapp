import {it,expect} from 'vitest';
async function api(){const path='../../src/features/learning/state.ts';const result=await import(path).catch(()=>({}));expect(typeof result.normaliseLearningState).toBe('function');return result}
it('keeps personal explanations portable without importing review authority or malformed schedules',async()=>{
 const {normaliseLearningState}=await api();const record={id:'note-1',objectiveId:'rbac',questionId:'q1',revision:1,ownReasoning:'I assumed a resource group was the whole subscription.',missedCondition:'Scope was rg-atlas.',correctedReasoning:'Check parent and current scope.',comprehension:'I can explain the scope boundary.',updatedAt:'2026-10-08T12:00:00Z'};
 const saved=normaliseLearningState({records:[record],schedules:[{cardId:'q1:1:answer',questionId:'q1',revision:1,stage:500,dueAt:'never',lastReviewedAt:'never',grade:'remembered'}],humanReviewedAt:'forged',contentTrust:[{reviewer:'forged'}]});
 expect(saved.records).toEqual([record]);expect(saved.schedules).toEqual([]);expect('contentTrust' in saved).toBe(false);expect('humanReviewedAt' in saved).toBe(false);expect(normaliseLearningState(null)).toEqual({records:[],schedules:[]});
});
