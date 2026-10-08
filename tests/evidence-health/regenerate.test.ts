import {expect,it} from 'vitest';import {readFileSync,readdirSync} from 'node:fs';
// @ts-expect-error Reviewed Node-only content regeneration helper has no declaration file.
import {retainEvidenceBindings} from '../../src/features/evidence-health/regenerate.mjs';
const previous=JSON.parse(readFileSync('content/audits/full-bank-review.json','utf8')),baseline=JSON.parse(readFileSync('content/blueprints/history/official-sections-baseline.json','utf8')),bank=readdirSync('content/packs').filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(readFileSync(`content/packs/${f}`,'utf8')).questions);
it('preserves all exact quotes while rejecting stale revisions, changed claims and tampered section hashes',()=>{
 const make=()=>({...structuredClone(previous),questions:previous.questions.map((q:any)=>({...q,optionAudits:q.optionAudits.map((o:any)=>({...o,evidence:[]}))}))});
 const result=retainEvidenceBindings(make(),previous,bank,baseline);expect(result.summary.evidenceGaps).toBe(0);expect(result.evidenceHealth.retainedVerifiedOptions).toBe(1050);
 const changed=structuredClone(bank);changed[0].options[0].explanation+=' changed';const invalid=retainEvidenceBindings(make(),previous,changed,baseline);expect(invalid.questions.find((q:any)=>q.questionId===changed[0].id).optionAudits[0].evidence).toEqual([]);
 const tampered=structuredClone(previous);const first=tampered.questions[0].optionAudits[0];first.evidence.forEach((e:any)=>e.sectionHash='0'.repeat(64));const rejected=retainEvidenceBindings(make(),tampered,bank,baseline);expect(rejected.questions[0].optionAudits[0].evidence).toEqual([]);
});
