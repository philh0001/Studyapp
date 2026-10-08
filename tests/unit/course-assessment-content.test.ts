import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import course from '../../content/course/az104-course.json';
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const files=['01','02','03','04'].map(id=>`content/course/assessments/${id}-modules.json`);
it('provides exactly six original, lesson-linked and officially cited questions for every course module',()=>{
 expect(files.every(existsSync)).toBe(true);
 const packs=files.flatMap(read),modules=course.paths.flatMap(path=>path.modules);
 expect(packs).toHaveLength(28);expect(new Set(packs.map(pack=>pack.moduleId)).size).toBe(28);
 const ids:string[]=[];
 for(const module of modules){
  const pack=packs.find(pack=>pack.moduleId===module.id);expect(pack).toBeDefined();expect(pack.questions).toHaveLength(6);expect(Number.isFinite(Date.parse(pack.checkedAt))).toBe(true);
  for(const q of pack.questions){ids.push(q.id);expect(q.prompt.length).toBeGreaterThan(30);expect(q.lessonIds.length).toBeGreaterThan(0);for(const id of q.lessonIds)expect(module.lessons.some(lesson=>lesson.id===id&&lesson.kind!=='knowledge-check')).toBe(true);
   expect(q.options).toHaveLength(4);expect(new Set(q.options.map((o:any)=>o.id)).size).toBe(4);expect(q.options.some((o:any)=>o.id===q.correctOptionId)).toBe(true);
   for(const option of q.options){expect(option.explanation.length).toBeGreaterThan(35);expect(option.sourceUrls.length).toBeGreaterThan(0);for(const url of option.sourceUrls){const source=new URL(url);expect(source.protocol).toBe('https:');expect(source.hostname).toBe('learn.microsoft.com')}}
  }
 }
 expect(ids).toHaveLength(168);expect(new Set(ids).size).toBe(168);
});
it('binds the independent factual review to every installed question and option',()=>{
 const path='content/course/assessments/accuracy-review.json';expect(existsSync(path)).toBe(true);
 const audit=read(path),packs=files.flatMap(read),questions=packs.flatMap(pack=>pack.questions);
 expect(audit.humanApproval).toBe(false);expect(audit.findings).toEqual([]);expect(audit.questions).toHaveLength(168);expect(new Set(audit.questions.map((row:any)=>row.questionId)).size).toBe(168);
 for(const q of questions){const row=audit.questions.find((row:any)=>row.questionId===q.id);expect(row.questionHash).toBe(createHash('sha256').update(JSON.stringify(q)).digest('hex'));expect(row.optionsReviewed).toBe(4);expect(row.sourceUrls.length).toBeGreaterThan(0)}
});
