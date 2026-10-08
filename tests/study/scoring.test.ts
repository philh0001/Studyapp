import {it,expect} from 'vitest';import {scoreAnswer,canSubmit} from '../../src/study/scoring';import {question} from '../fixtures';
it('exact_multi_select',()=>{const q=question({type:'multiple',requiredSelections:2,correctOptionIds:['a','b']});expect(scoreAnswer(q,['b','a'])).toBe(true);for(const ids of [['a'],['a','b','c'],['a','missing']])expect(scoreAnswer(q,ids)).toBe(false)});
it('duplicate_selection_is_invalid',()=>expect(canSubmit(question({type:'multiple',requiredSelections:2,correctOptionIds:['a','b']}),['a','a'])).toBe(false));
it('required_count_gates_submission',()=>{expect(canSubmit(question(),[])).toBe(false);expect(canSubmit(question(),['a'])).toBe(true);expect(canSubmit(question(),['missing'])).toBe(false)});
