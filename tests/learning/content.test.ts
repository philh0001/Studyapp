import {readFileSync,existsSync} from 'node:fs';
import {describe,it,expect} from 'vitest';
import blueprint from '../../content/blueprints/az104-2026-04-17.json';
import identity from '../../content/sources/identity-expanded.json';
import storage from '../../content/sources/storage-expanded.json';
import compute from '../../content/sources/compute-expanded.json';
import networking from '../../content/sources/networking-expanded.json';
import monitoring from '../../content/sources/monitoring-expanded.json';
import {validatePack} from '../../src/content/validate';
const ledger=new Map([...identity,...storage,...compute,...networking,...monitoring].map(r=>[r.referenceId,r]));
function read(path:string){return existsSync(path)?JSON.parse(readFileSync(path,'utf8')):null}
describe('cited draft teaching',()=>{
 it('covers every objective with checked official claim references and explicit draft provenance',()=>{
  const data=read('content/learning/az104-learning-draft.json');expect(data).not.toBeNull();
  expect(data.status).toBe('draft');expect(data.provenance).toBe('ai-assisted');expect(data.review).toBeNull();
  expect(data.objectives.map((o:{id:string})=>o.id).sort()).toEqual(blueprint.domains.flatMap(d=>d.objectives.map(o=>o.id)).sort());
  const claims=[...data.objectives.flatMap((o:{claims:unknown[]})=>o.claims),...data.glossary.map((g:{claim:unknown})=>g.claim),...data.comparisons.flatMap((c:{claims:unknown[]})=>c.claims),...data.walkthroughs.flatMap((w:{steps:unknown[]})=>w.steps)];
  expect(data.glossary.length).toBeGreaterThanOrEqual(15);expect(data.comparisons.length).toBeGreaterThanOrEqual(8);
  for(const claim of claims){expect(claim.text.trim().length).toBeGreaterThan(15);expect(claim.referenceIds.length).toBeGreaterThan(0);for(const id of claim.referenceIds){const source=ledger.get(id);expect(source?.result).toBe('checked');expect(source?.canonicalUrl).toMatch(/^https:\/\/learn.microsoft.com\//);expect(claim.checkedAt).toBe(source?.checkedAt)}}
 });
 it('contains ten practical walkthroughs with prerequisites, cost and cleanup warnings',()=>{
  const data=read('content/learning/az104-learning-draft.json');expect(data).not.toBeNull();expect(data.walkthroughs).toHaveLength(10);
  for(const w of data.walkthroughs){expect(w.prerequisites.length).toBeGreaterThan(0);expect(w.cost.length).toBeGreaterThan(20);expect(w.cleanup.length).toBeGreaterThan(20);expect(w.steps.length).toBeGreaterThanOrEqual(3);expect(w.automaticallyDeploys).toBe(false)}
 });
});
it('adds fifteen unique reserved original draft questions, one per objective, with cited options',()=>{
 const pack=read('content/packs/az104-deeper-reserve-draft.json');expect(pack).not.toBeNull();expect(validatePack(pack,blueprint).issues).toEqual([]);expect(pack.questions).toHaveLength(15);expect(pack.version).toBe(1);
 expect(new Set(pack.questions.map((q:{objectiveId:string})=>q.objectiveId)).size).toBe(15);
 for(const [index,q] of pack.questions.entries()){expect(q.id).toBe(`az104-reserve-plus-${String(index+1).padStart(2,'0')}`);expect(q.status).toBe('draft');expect(q.review).toBeNull();expect(q.provenance).toBe('ai-assisted');expect(q.assessmentReserved).toBe(true);for(const r of q.references){expect(r.url).toBe(ledger.get(r.id)?.canonicalUrl);expect(r.checkedAt).toBe(ledger.get(r.id)?.checkedAt)}for(const o of q.options)expect(o.referenceIds.length).toBeGreaterThan(0)}
});
it('records retrieved text excerpts for every teaching source with an honest evidence status',()=>{
 const evidence=read('content/learning/source-evidence.json'),data=read('content/learning/az104-learning-draft.json');expect(evidence.status).toBe('ai-assisted-evidence');expect(evidence.humanReviewed).toBe(false);
 expect(evidence.sources.map((s:{id:string})=>s.id).sort()).toEqual(data.references.map((r:{id:string})=>r.id).sort());
 for(const s of evidence.sources){expect(s.evidenceExcerpt.length).toBeGreaterThan(150);expect(s.retrievedTextSha256).toMatch(/^[a-f0-9]{64}$/);expect(s.checkedAt).toBe(ledger.get(s.id)?.checkedAt);expect(s.url).toBe(ledger.get(s.id)?.canonicalUrl)}
});
it('walkthroughs teach the reviewed missing concepts with retained official citations',()=>{
 const data=read('content/learning/az104-learning-draft.json');
 const requirements:Record<string,string[]>={
  'walkthrough-governance':['identity-rbac','identity-scope'],
  'walkthrough-vm':['compute-vm-attach','compute-vm-sets','compute-vm-zones'],
  'walkthrough-containers':['compute-app-plans','compute-app-slots'],
  'walkthrough-network':['networking-plus-delegate','networking-plus-probe'],
  'walkthrough-recovery':['monx-vault','monx-restore'],
 };
 for(const [id,refs] of Object.entries(requirements)){const w=data.walkthroughs.find((w:{id:string})=>w.id===id);expect(w).toBeDefined();const actual=w.steps.flatMap((s:{referenceIds:string[]})=>s.referenceIds);for(const ref of refs)expect(actual).toContain(ref);expect(w.prerequisites.join(' ').length).toBeGreaterThan(60);expect(w.cost.length).toBeGreaterThan(60);expect(w.cleanup.length).toBeGreaterThan(60)}
 const evidence=read('content/learning/source-evidence.json');for(const id of Object.values(requirements).flat())expect(evidence.sources.find((s:{id:string})=>s.id===id)?.evidenceExcerpt.length).toBeGreaterThan(150);
});
