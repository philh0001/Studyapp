import {existsSync,readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import {validatePack} from '../../src/content/validate';
import type {Blueprint,ContentPack,SourceCheck} from '../../src/content/types';
const path='content/packs/az104-identity-expanded-draft.json';
const blueprint=JSON.parse(readFileSync('content/blueprints/az104-2026-04-17.json','utf8')) as Blueprint;
const read=()=>JSON.parse(readFileSync(path,'utf8')) as ContentPack;
describe('identity expansion evidence and coverage',()=>{
 it('provides the fifty-question expansion',()=>expect(existsSync(path)).toBe(true));
 it('validates exact draft identities, every identity subskill, and all required formats',()=>{
  const pack=read();expect(validatePack(pack,blueprint).issues).toEqual([]);expect(pack.questions).toHaveLength(50);
  expect(pack.id).toBe('az104-identity-expanded-draft');expect(pack.version).toBe(1);
  const covered=new Set(pack.questions.flatMap(q=>q.subObjectiveIds??[]));
  for(const objective of blueprint.domains.find(d=>d.id==='identity')!.objectives)for(let i=1;i<=objective.subObjectives.length;i++)expect(covered.has(`${objective.id}.${i}`)).toBe(true);
  for(const [i,q] of pack.questions.entries()){expect(q.id).toBe(`az104-identity-plus-${String(i+1).padStart(2,'0')}`);expect(q.domainId).toBe('identity');expect(q.status).toBe('draft');expect(q.review).toBeNull();expect(q.provenance).toBe('ai-assisted');expect(q.subObjectiveIds?.length).toBeGreaterThan(0)}
  expect(pack.questions.filter(q=>q.difficulty==='advanced').length).toBeGreaterThanOrEqual(10);
  expect(pack.questions.filter(q=>q.type==='multiple').length).toBeGreaterThanOrEqual(10);
  for(const format of ['ordering','matching'])expect(pack.questions.filter(q=>q.type===format).length).toBeGreaterThanOrEqual(2);
  expect(pack.questions.filter(q=>q.assessmentReserved).length).toBeGreaterThanOrEqual(10);
  expect(pack.questions.filter(q=>q.exhibits?.length).length).toBeGreaterThanOrEqual(8);
  const cases=new Map<string,number>();for(const q of pack.questions)if(q.caseStudy)cases.set(q.caseStudy.id,(cases.get(q.caseStudy.id)??0)+1);
  expect(cases.size).toBeGreaterThanOrEqual(2);for(const size of cases.values())expect(size).toBe(3);
 });
 it('connects every claim to a retrieved official page and audits all ten originals',()=>{
  const pack=read(),checks=JSON.parse(readFileSync('content/sources/identity-expanded.json','utf8')) as SourceCheck[];
  for(const q of pack.questions){for(const r of q.references){const c=checks.find(c=>c.referenceId===r.id);expect(c?.result).toBe('checked');expect(r.url).toBe(c?.canonicalUrl);expect(r.checkedAt).toBe(c?.checkedAt);expect(c?.contentHash).toMatch(/^[a-f0-9]{64}$/);expect(r.evidenceSummary.length).toBeGreaterThan(80)}for(const o of q.options){expect(o.explanation.length).toBeGreaterThan(45);expect(o.referenceIds.length).toBeGreaterThan(0);expect(o.referenceIds.every(id=>q.references.some(r=>r.id===id))).toBe(true)}}
  const audit=JSON.parse(readFileSync('content/audits/identity-starter-audit.json','utf8')) as {humanReviewed:boolean;questions:{questionId:string;revision:number;subObjectiveIds:string[];findings:string[];evidence:string[]}[]};
  expect(audit.humanReviewed).toBe(false);expect(audit.questions).toHaveLength(10);
  for(let i=1;i<=10;i++){const item=audit.questions.find(q=>q.questionId===`az104-identity-${String(i).padStart(2,'0')}`);expect(item?.revision).toBe(1);expect(item?.subObjectiveIds.length).toBeGreaterThan(0);expect(item?.evidence.length).toBeGreaterThan(0)}
 });
});
