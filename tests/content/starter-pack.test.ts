import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validatePack } from '../../src/content/validate';
import type { Blueprint, ContentPack, SourceCheck } from '../../src/content/types';
const path = 'content/packs/az104-starter-draft.json';
const blueprint = JSON.parse(readFileSync('content/blueprints/az104-2026-04-17.json', 'utf8')) as Blueprint;
const checks = JSON.parse(readFileSync('content/sources/microsoft-source-checks.json', 'utf8')) as SourceCheck[];
const readPack = () => JSON.parse(readFileSync(path, 'utf8')) as ContentPack;
describe('starter draft content acceptance', () => {
 it('supplies the proposed question bank', () => expect(existsSync(path)).toBe(true));
 it('validates all 50 original draft revisions against the current blueprint', () => {
  const pack = readPack();
  expect(validatePack(pack, blueprint).issues).toEqual([]);
  expect(pack.questions).toHaveLength(50);
  expect(new Set(pack.questions.map(q => q.scenario + q.prompt)).size).toBe(50);
  for (const q of pack.questions) {
   expect(q.status).toBe('draft'); expect(q.review).toBeNull(); expect(q.provenance).toBe('ai-assisted');
  }
 });
 it('balances domains, holds back two per domain, and includes multiple-select practice', () => {
  const questions = readPack().questions;
  for (const domain of blueprint.domains) {
   const qs = questions.filter(q => q.domainId === domain.id);
   expect(qs).toHaveLength(10); expect(qs.filter(q => q.assessmentReserved)).toHaveLength(2);
   expect(new Set(qs.map(q => q.objectiveId)).size).toBeGreaterThanOrEqual(2);
   expect(qs.some(q => q.type === 'multiple')).toBe(true);
  }
 });
 it('ties every option and summary to claim evidence and actual source retrieval records', () => {
  for (const q of readPack().questions) {
   for (const ref of q.references) {
    const check = checks.find(c => c.referenceId === ref.id);
    expect(check, ref.id).toBeDefined(); expect(check?.result).toBe('checked');
    expect(ref.url).toBe(check?.canonicalUrl); expect(ref.checkedAt).toBe(check?.checkedAt);
    expect(ref.evidenceSummary.length).toBeGreaterThan(70); expect(ref.microsoftOwnershipVerified).toBe(true);
   }
   for (const option of q.options) {
    expect(option.explanation.length).toBeGreaterThan(35);
    expect(option.referenceIds.length).toBeGreaterThan(0);
    expect(option.referenceIds.every(id => q.references.some(r => r.id === id))).toBe(true);
   }
   expect(q.summaryReferenceIds.every(id => q.references.some(r => r.id === id))).toBe(true);
  }
 });
});
