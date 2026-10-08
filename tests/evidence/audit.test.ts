import {it,expect} from 'vitest';
import {readFileSync,readdirSync} from 'node:fs';
it('audits every immutable bank option, sequence, matching pair and case with honest evidence gaps',()=>{
 const report=JSON.parse(readFileSync('content/audits/full-bank-review.json','utf8'));
 const bank=readdirSync('content/packs').filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(readFileSync(`content/packs/${f}`,'utf8')).questions);
 expect(report.humanReviewCompleted).toBe(false);expect(report.questions).toHaveLength(bank.length);
 for(const q of bank){const audit=report.questions.find((a:any)=>a.questionId===q.id&&a.revision===q.revision);
  expect(audit.optionAudits.map((o:any)=>o.optionId)).toEqual(q.options.map((o:any)=>o.id));
  expect(audit.uncertainties.length).toBeGreaterThan(0);expect(audit.disposition).not.toBe('human-approved');
  if(q.type==='ordering')expect(audit.sequenceAudit.steps).toHaveLength(q.correctOptionIds.length);
  if(q.type==='matching')expect(audit.matchingAudit.pairs).toHaveLength(q.matchPrompts.length);
  if(q.caseStudy)expect(audit.caseAudit.caseId).toBe(q.caseStudy.id);
 }
 const evidence=report.questions.flatMap((q:any)=>q.optionAudits.flatMap((o:any)=>o.evidence));
 expect(evidence.length).toBeGreaterThan(0);expect(evidence.every((e:any)=>e.excerpt.length>20&&e.htmlHashVerified&&e.url.startsWith('https://learn.microsoft.com/'))).toBe(true);
 expect(report.questions.some((q:any)=>q.flags.length>0)).toBe(true);
},30000);
it('provides concrete evidence-backed ambiguity corrections without rewriting installed drafts',()=>{
 const report=JSON.parse(readFileSync('content/audits/full-bank-review.json','utf8'));
 const tiers=report.questions.find((q:any)=>q.questionId==='az104-storage-plus-36');
 expect(tiers.proposedCorrections).toEqual(expect.arrayContaining([expect.objectContaining({field:'match:p2',newText:expect.stringContaining('documented minimum'),evidence:expect.arrayContaining([expect.objectContaining({excerpt:expect.stringContaining('minimum of 30 days')})])})]));
 const pipeline=report.questions.find((q:any)=>q.questionId==='az104-monitoring-plus-08');
 expect(pipeline.proposedCorrections[0].newText).toContain('delivery');expect(pipeline.proposedCorrections[0].humanApproved).toBe(false);
});
it('installs source-backed corrections as new drafts and preserves the prior question snapshots',()=>{
 const storage=JSON.parse(readFileSync('content/packs/az104-storage-expanded-draft.json','utf8')),monitoring=JSON.parse(readFileSync('content/packs/az104-monitoring-expanded-draft.json','utf8'));
 const tiers=storage.questions.find((q:any)=>q.id==='az104-storage-plus-36'),pipeline=monitoring.questions.find((q:any)=>q.id==='az104-monitoring-plus-08');
 expect(tiers.revision).toBe(2);expect(pipeline.revision).toBe(2);expect(storage.version).toBeGreaterThan(1);expect(monitoring.version).toBeGreaterThan(1);
 expect(tiers.matchPrompts[1].text).toContain('documented minimum');expect(pipeline.prompt).toContain('delivery');
 for(const q of [tiers,pipeline]){expect(q.status).toBe('draft');expect(q.review).toBeNull();}
 const report=JSON.parse(readFileSync('content/audits/full-bank-review.json','utf8'));
 const original=report.historicalRevisions.find((r:any)=>r.questionId===tiers.id&&r.revision===1);
 expect(original.questionSnapshot.matchPrompts[1].text).toBe('Online infrequently accessed data retained at least 30 days.');
});
it('records an actual per-question semantic review with every option separately and honest concerns',()=>{
 const report=JSON.parse(readFileSync('content/audits/full-bank-review.json','utf8'));
 expect(report.summary.aiSemanticReviewed).toBe(report.questions.length);
 for(const q of report.questions){expect(q.semanticReview.conclusion.length).toBeGreaterThan(50);expect(q.semanticReview.optionReviews.map((o:any)=>o.optionId)).toEqual(q.optionAudits.map((o:any)=>o.optionId));expect(q.semanticReview.humanApprovalGranted).toBe(false);}
 expect(report.questions.find((q:any)=>q.questionId==='az104-compute-plus-38').semanticReview.conclusion).toMatch(/HTTP/);expect(report.questions.find((q:any)=>q.questionId==='az104-monitoring-plus-08').semanticReview.uncertainties).toEqual([]);expect(report.evidenceHealth.resolvedPriorSemanticConcerns).toBe(9);
});
it('closes DNS and routing section gaps with retrieved references on new draft revisions',()=>{
 const pack=JSON.parse(readFileSync('content/packs/az104-networking-expanded-draft.json','utf8'));
 const ledger=JSON.parse(readFileSync('content/sources/networking-expanded.json','utf8'));
 for(const id of ['az104-networking-plus-03','az104-networking-plus-19','az104-networking-plus-36']){const q=pack.questions.find((q:any)=>q.id===id);expect(q.revision).toBe(2);expect(q.references.some((r:any)=>r.id.startsWith('netx-extra-'))).toBe(true);for(const r of q.references.filter((r:any)=>r.id.startsWith('netx-extra-')))expect(ledger.find((s:any)=>s.referenceId===r.id)).toEqual(expect.objectContaining({canonicalUrl:r.url,result:'checked',contentHash:expect.stringMatching(/^[a-f0-9]{64}$/)}));}
});
it('qualifies newest-time ordering and comparable Perf counters as new drafts',()=>{
 const pack=JSON.parse(readFileSync('content/packs/az104-monitoring-expanded-draft.json','utf8'));
 const newest=pack.questions.find((q:any)=>q.id==='az104-monitoring-plus-11'),average=pack.questions.find((q:any)=>q.id==='az104-monitoring-plus-12');
 expect(newest.revision).toBe(2);expect(newest.scenario).not.toContain('deterministic');expect(average.revision).toBe(2);expect(average.scenario).toContain('comparable units');
});
