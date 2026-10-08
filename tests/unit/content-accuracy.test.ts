import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const digest=(text:string)=>createHash('sha256').update(text).digest('hex');
describe('complete source accuracy audit binds the shipped material',()=>{
 it('has a point-by-point source audit of every course lesson and final teaching point',()=>{
  const course=read('content/course/az104-course.json');
  const audits=['01-02','03-04','05-06'].map(id=>read(`content/course/audits/${id}-accuracy.json`));
  const rows=audits.flatMap(a=>a.lessons);const lessons=course.paths.flatMap((p:any)=>p.modules.flatMap((m:any)=>m.lessons));
  expect(rows).toHaveLength(231);expect(new Set(rows.map(row=>row.id)).size).toBe(231);
  for(const audit of audits){expect(audit.humanApproval).toBe(false);expect(Number.isFinite(Date.parse(audit.checkedAt))).toBe(true);expect(audit.findings).toEqual([])}
  for(const lesson of lessons){const row=rows.find(row=>row.id===lesson.id);expect(row).toBeDefined();expect(row.pointHashes).toEqual(lesson.points.map(digest));expect(row.sourceUrls).toContain(lesson.url);expect(['supported','corrected']).toContain(row.result)}
 });
 it('has current scenario/answer/explanation checks bound to all 315 question revisions',()=>{
  const audits=['identity-storage-monitoring','compute-networking'].map(id=>read(`content/audits/2026-10-08-accuracy-${id}.json`));
  const rows=audits.flatMap(a=>a.questions),questions=readdirSync('content/packs').filter(f=>f.endsWith('.json')).flatMap(file=>read(`content/packs/${file}`).questions);
  expect(rows).toHaveLength(315);expect(new Set(rows.map(row=>row.questionId)).size).toBe(315);
  for(const audit of audits)expect(audit.humanApproval).toBe(false);
  for(const q of questions){const row=rows.find(row=>row.questionId===q.id);expect(row.revision).toBe(q.revision);expect(row.questionHash).toBe(digest(JSON.stringify(q)));expect(['supported','corrected']).toContain(row.result);expect(row.evidenceUrls.length).toBeGreaterThan(0)}
 });
 it('binds all installed study-aid claims, instructions, excerpts and reading links to their source checks',()=>{
  const audit=read('content/audits/2026-10-08-study-aids-accuracy.json'),learning=read('content/learning/az104-learning-draft.json'),evidence=read('content/learning/source-evidence.json'),resources=read('content/learning-resources.json');
  expect(audit.entries).toHaveLength(212);expect(audit.summary.unresolvedItems).toBe(0);expect(audit.humanApproval).toBe(false);
  for(const row of audit.entries){
   let value:any;
   if(row.kind==='official-reading-resource')value=resources[row.index];
   else if(row.kind==='retained-evidence-excerpt')value=evidence.sources.find((source:any)=>source.id===row.id||source.referenceId===row.id).evidenceExcerpt;
   else if(row.kind==='glossary-expansion'){const item=learning.glossary.find((item:any)=>item.term===row.id);value={term:item.term,expanded:item.expanded}}
   else {value=learning;for(const token of row.path.split('/'))value=Array.isArray(value)?/^\d+$/.test(token)?value[Number(token)]:value.find(item=>item.id===token||item.term===token):value[token]}
   expect(value).toEqual(row.reviewedValue);expect(digest(JSON.stringify(value))).toBe(row.sha256);expect(row.evidenceUrls.length).toBeGreaterThan(0);
  }
 });
 it('qualifies what-if resource permission checks by validation mode and preserves its previous revision',()=>{
  const q=read('content/packs/az104-compute-expanded-draft.json').questions.find((q:any)=>q.id==='az104-compute-plus-04');
  expect(q.scenario).toContain('default Provider validation');expect(q.options.find((o:any)=>o.id==='c').explanation).toContain('ProviderNoRbac');
  const previous=read('content/audits/full-bank-review.json').historicalRevisions.find((row:any)=>row.questionId===q.id&&row.revision===q.revision-1);
  expect(previous).toBeDefined();expect(previous.questionSnapshot.scenario).not.toBe(q.scenario);
 });
});
