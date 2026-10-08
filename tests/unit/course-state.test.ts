import {describe,expect,it} from 'vitest';
import {normaliseCourseState} from '../../src/features/course/state';
const ids=['a','b','c'];
describe('course reader saved state',()=>{
 it('resolves malformed and removed lesson positions without losing valid completion',()=>{
  const state=normaliseCourseState({selectedLessonId:'removed',completedIds:['a','a','removed',null],listening:{sectionId:'removed',chunk:Infinity},rate:9,voiceURI:{bad:true},scope:'unknown'},ids);
  expect(state).toEqual({selectedLessonId:'a',completedIds:['a'],listening:{sectionId:'a',chunk:0},rate:1,voiceURI:'',scope:'module',assessmentOpen:false});
 });
 it('restores reading independently of the listening cursor and bounds chunk indices',()=>{
  const state=normaliseCourseState({selectedLessonId:'c',completedIds:['b'],listening:{sectionId:'b',chunk:3.8},rate:1.25,voiceURI:'device-voice',scope:'course'},ids);
  expect(state.selectedLessonId).toBe('c');expect(state.listening).toEqual({sectionId:'b',chunk:3});expect(state.rate).toBe(1.25);expect(state.scope).toBe('course');
 });
 it.each([null,[],true,'broken',42])('accepts corrupt imported root %s',value=>{expect(normaliseCourseState(value,ids).selectedLessonId).toBe('a')});
});
it('retains explicit module assessment visibility without trusting malformed flags',()=>{
 expect(normaliseCourseState({selectedLessonId:'a',assessmentOpen:true},ids).assessmentOpen).toBe(true);
 expect(normaliseCourseState({assessmentOpen:'true'},ids).assessmentOpen).toBe(false);
});
