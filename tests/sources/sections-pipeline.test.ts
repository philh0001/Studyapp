import {describe,it,expect} from 'vitest';
// @ts-expect-error Node script APIs are covered by runtime tests.
import {observeSections} from '../../scripts/check-sections.mjs';
import {extractSections} from '../../src/content/section-diff';
const url='https://learn.microsoft.com/en-us/azure/role-based-access-control/overview',source={referenceId:'rbac',canonicalUrl:url},baseline={contentHash:'a'.repeat(64),sections:extractSections('<main><h2 id="roles">Roles</h2><p>Assign at scopes.</p></main>')};
describe('scheduled section observations',()=>{
 it('returns baseline hashes and actual changed text for review',async()=>{const report=await observeSections(source,baseline,async()=>new Response('<main><h2 id="roles">Roles</h2><p>Assign at new scopes.</p></main>'));expect(report.status).toBe('changed');expect(report.baselineHash).toBe(baseline.contentHash);expect(report.contentHash).toMatch(/^[a-f0-9]{64}$/);expect(report.changes[0].after).toContain('new scopes')});
 it('preserves factual baseline when a successful response is an incomplete error shell',async()=>{const report=await observeSections(source,baseline,async()=>new Response('<h1>Temporarily unavailable</h1>'));expect(report.status).toBe('unavailable');expect(report.changes).toEqual([]);expect(baseline.sections[0].text).toBe('Assign at scopes.')});
});
