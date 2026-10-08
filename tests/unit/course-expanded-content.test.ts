import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {expect,it} from 'vitest';
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
it('gives every substantive course unit fuller sourced teaching while keeping original quick points',()=>{
 const course=read('content/course/az104-course.json'),lessons=course.paths.flatMap((p:any)=>p.modules.flatMap((m:any)=>m.lessons)),substantive=lessons.filter((l:any)=>['teaching','exercise'].includes(l.kind));
 expect(substantive).toHaveLength(151);let summaryWords=0,expandedWords=0;
 for(const l of lessons){summaryWords+=l.points.join(' ').split(/\s+/).length;if(['teaching','exercise'].includes(l.kind)){expect(l.sections?.length??0,l.id).toBeGreaterThanOrEqual(2);for(const s of l.sections){expect(s.title.length).toBeGreaterThan(4);expect(s.paragraphs.length).toBeGreaterThan(0);expect(s.sourceUrls.length).toBeGreaterThan(0);for(const url of s.sourceUrls){const source=new URL(url);expect(source.protocol).toBe('https:');expect(source.hostname).toBe('learn.microsoft.com')}expandedWords+=[s.title,...s.paragraphs,...s.steps??[],s.code?.text??''].join(' ').trim().split(/\s+/).length}}
  else expect(l.sections??[]).toEqual([]);
 }
 expect(expandedWords).toBeGreaterThan(summaryWords);expect(lessons.reduce((sum:number,l:any)=>sum+l.points.length,0)).toBe(847);
});
it('has exact independent source-review bindings for every added teaching section',()=>{
 const path='content/course/expanded/accuracy-review.json';expect(existsSync(path)).toBe(true);const audit=read(path),course=read('content/course/az104-course.json');const lessons=course.paths.flatMap((p:any)=>p.modules.flatMap((m:any)=>m.lessons)).filter((l:any)=>['teaching','exercise'].includes(l.kind));
 expect(audit.humanApproval).toBe(false);expect(audit.findings).toEqual([]);expect(audit.lessons).toHaveLength(151);expect(new Set(audit.lessons.map((row:any)=>row.lessonId)).size).toBe(151);
 for(const l of lessons){const row=audit.lessons.find((r:any)=>r.lessonId===l.id);expect(row.sectionHashes).toEqual(l.sections.map((s:any)=>createHash('sha256').update(JSON.stringify(s)).digest('hex')));for(const s of l.sections)for(const url of s.sourceUrls)expect(row.sourceUrls).toContain(url)}
});
