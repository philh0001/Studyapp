import {existsSync,readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {validatePack} from '../../src/content/validate';
import type {Blueprint,ContentPack,SourceCheck} from '../../src/content/types';
const path='content/packs/az104-compute-expanded-draft.json';
const blueprint=JSON.parse(readFileSync('content/blueprints/az104-2026-04-17.json','utf8')) as Blueprint;
const pack=()=>JSON.parse(readFileSync(path,'utf8')) as ContentPack;
describe('compute expanded original draft bank',()=>{
 it('supplies the separate fifty-question compute pack',()=>expect(existsSync(path)).toBe(true));
 it('keeps unique new identities, draft provenance and all compute subskill coverage',()=>{
  const p=pack();expect(p.id).toBe('az104-compute-expanded-draft');expect(p.version).toBe(1);expect(p.questions).toHaveLength(50);
  expect(validatePack(p,blueprint).issues).toEqual([]);
  const covered=new Set(p.questions.flatMap(q=>q.subObjectiveIds??[]));
  for(const o of blueprint.domains.find(d=>d.id==='compute')!.objectives)for(let i=1;i<=o.subObjectives.length;i++)expect(covered.has(`${o.id}.${i}`),`${o.id}.${i}`).toBe(true);
  expect(new Set(p.questions.map(q=>q.scenario+q.prompt)).size).toBe(50);
  for(const [i,q] of p.questions.entries()){
   expect(q.id).toBe(`az104-compute-plus-${String(i+1).padStart(2,'0')}`);expect(q.revision).toBe(1);expect(q.domainId).toBe('compute');
   expect(q.status).toBe('draft');expect(q.provenance).toBe('ai-assisted');expect(q.review).toBeNull();
  }
 });
 it('includes advanced, reserved, multiple, ordered, matching, exhibited and linked case practice',()=>{
  const q=pack().questions;
  expect(q.filter(q=>q.difficulty==='advanced').length).toBeGreaterThanOrEqual(10);
  expect(q.filter(q=>q.assessmentReserved).length).toBeGreaterThanOrEqual(10);
  expect(q.filter(q=>q.type==='multiple').length).toBeGreaterThanOrEqual(10);
  expect(q.filter(q=>q.type==='ordering').length).toBeGreaterThanOrEqual(2);
  expect(q.filter(q=>q.type==='matching').length).toBeGreaterThanOrEqual(2);
  expect(q.filter(q=>q.exhibits?.length).length).toBeGreaterThanOrEqual(8);
  const cases=new Set(q.flatMap(q=>q.caseStudy?[q.caseStudy.id]:[]));expect(cases.size).toBeGreaterThanOrEqual(2);
  for(const id of cases)expect(q.filter(q=>q.caseStudy?.id===id)).toHaveLength(3);
 });
 it('grounds every answer and summary in actually retrieved canonical Learn evidence',()=>{
  const checks=JSON.parse(readFileSync('content/sources/compute-expanded.json','utf8')) as SourceCheck[];
  for(const q of pack().questions){
   for(const r of q.references){
    const c=checks.find(c=>c.referenceId===r.id);expect(c).toBeDefined();expect(c?.result).toBe('checked');
    expect(r.url).toBe(c?.canonicalUrl);expect(r.checkedAt).toBe(c?.checkedAt);expect(c?.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(new URL(r.url).hostname).toBe('learn.microsoft.com');expect(r.microsoftOwnershipVerified).toBe(true);expect(r.evidenceSummary.length).toBeGreaterThan(80);
   }
   for(const o of q.options){expect(o.explanation.length).toBeGreaterThan(45);expect(o.referenceIds.length).toBeGreaterThan(0);expect(o.referenceIds.every(id=>q.references.some(r=>r.id===id))).toBe(true)}
   expect(q.summaryReferenceIds.length).toBeGreaterThan(0);expect(q.summaryReferenceIds.every(id=>q.references.some(r=>r.id===id))).toBe(true);
  }
 });
 it('audits the ten starter revisions and provides separate immutable legacy subskill mappings',()=>{
  const audit=JSON.parse(readFileSync('content/audits/compute-starter-audit.json','utf8'));
  expect(audit.domainId).toBe('compute');expect(audit.questions).toHaveLength(10);expect(audit.legacySubskills).toHaveLength(10);
  for(const row of audit.questions){expect(row.questionId).toMatch(/^az104-compute-\d{2}$/);expect(row.revision).toBe(1);expect(row.summary.length).toBeGreaterThan(50);expect(row.referenceIds.length).toBeGreaterThan(0)}
 });
});
