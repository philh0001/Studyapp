import {expect,it} from 'vitest';
import {question} from '../fixtures';
import {canSubmit,scoreAnswer} from '../../src/study/scoring';
it('ordering scores the exact sequence',()=>{const q=question({type:'ordering',requiredSelections:3,correctOptionIds:['b','a','c']});expect(scoreAnswer(q,['b','a','c'])).toBe(true);expect(scoreAnswer(q,['a','b','c'])).toBe(false)});
it('matching scores assignments in prompt order and rejects repeated or missing choices',()=>{const q=question({type:'matching',requiredSelections:3,correctOptionIds:['c','b','a'],matchPrompts:[{id:'x',text:'X'},{id:'y',text:'Y'},{id:'z',text:'Z'}]});expect(scoreAnswer(q,['c','b','a'])).toBe(true);expect(scoreAnswer(q,['a','b','c'])).toBe(false);expect(canSubmit(q,['a','a','c'])).toBe(false);expect(canSubmit(q,['a','b'])).toBe(false);expect(canSubmit(q,['a','b','unknown'])).toBe(false)});
it('multiple-select remains order independent',()=>{const q=question({type:'multiple',requiredSelections:2,correctOptionIds:['a','b']});expect(scoreAnswer(q,['b','a'])).toBe(true)});
