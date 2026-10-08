import {describe,expect,it} from 'vitest';
import course from '../../content/course/az104-course.json';
import evidence from '../../content/course/source-evidence.json';
describe('concise official course coverage',()=>{
 it('covers the retrieved syllabus in its published path/module/unit order',()=>{
  expect(course.paths).toHaveLength(6);expect(course.paths.flatMap(p=>p.modules)).toHaveLength(28);
  expect(course.paths.flatMap(p=>p.modules.flatMap(m=>m.lessons))).toHaveLength(231);
  expect(course.paths.map(p=>p.url)).toEqual(evidence.paths.map(p=>p.url));
  for(const path of course.paths){const source=evidence.paths.find(p=>p.url===path.url)!;expect(path.modules.map(m=>m.url)).toEqual(source.modules.map(m=>m.url));for(const module of path.modules)expect(module.lessons.map(l=>l.url)).toEqual(source.modules.find(m=>m.url===module.url)!.units.map(u=>u.url))}
 });
 it('contains substantive plain text and official dated evidence without copied assessments',()=>{
  const ids=new Set<string>();
  for(const lesson of course.paths.flatMap(p=>p.modules.flatMap(m=>m.lessons))){expect(ids.has(lesson.id)).toBe(false);ids.add(lesson.id);expect(new URL(lesson.url).hostname).toBe('learn.microsoft.com');expect(lesson.points.length).toBeGreaterThan(0);expect(lesson.points.join(' ')).not.toMatch(/<\/?(?:script|iframe|div|p|a|span|img|svg|style|button)(?:\s[^>]*|\s*\/?)>/i);if(lesson.kind==='knowledge-check')expect(lesson.points).toEqual(['Complete the interactive check on Microsoft Learn.']);if(lesson.kind==='teaching')expect(lesson.points.join(' ').length).toBeGreaterThan(150)}
  expect(Number.isFinite(Date.parse(course.checkedAt))).toBe(true);
  expect(evidence.units).toHaveLength(231);expect(evidence.units.every(u=>u.sha256.length===64&&u.status===200)).toBe(true);
 });
});
