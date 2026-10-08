import {describe,it,expect} from 'vitest';
// @ts-expect-error Node scripts expose tested JavaScript APIs.
import {verifyDeployment} from '../../scripts/verify-deployment.mjs';
// @ts-expect-error Node scripts expose tested JavaScript APIs.
import {buildRollbackPlan} from '../../scripts/rollback-plan.mjs';
// @ts-expect-error Node scripts expose tested JavaScript APIs.
import {observeBlueprint} from '../../scripts/check-blueprint.mjs';
import {blueprint} from '../fixtures';
describe('release verification',()=>{
 it('checks deployed index bytes, referenced chunks, worker and security headers',async()=>{const html='<html><script type="module" src="/assets/app-123.js"></script><link href="/assets/app-456.css" rel="stylesheet"></html>';const bodies:Record<string,string>={'/':html,'/assets/app-123.js':'app','/assets/app-456.css':'css','/sw.js':'self.addEventListener("fetch",()=>{})'};const report=await verifyDeployment('https://az104-revision-web.showtime-workers.workers.dev',new Map(Object.entries(bodies)),async(url:string)=>new Response(bodies[new URL(url).pathname],{headers:{'content-security-policy':"default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'",'x-content-type-options':'nosniff'}}));expect(report.ok).toBe(true);expect(report.files).toHaveLength(4)});
 it('fails when a deployment serves stale shell, missing chunk or weak CSP',async()=>{const report=await verifyDeployment('https://az104-revision-web.showtime-workers.workers.dev',new Map([['/','expected'],['/assets/app.js','app']]),async()=>new Response('stale',{headers:{'content-security-policy':"default-src *"}}));expect(report.ok).toBe(false);expect(report.errors.join(' ')).toContain('bytes');expect(report.errors.join(' ')).toContain('CSP')});
 it('refuses verification of an unrelated deployment host',async()=>{await expect(verifyDeployment('https://example.org',new Map(),async()=>new Response(''))).rejects.toThrow('existing Studyapp Worker')});
});
describe('rollback plan never performs mutation',()=>{
 const latest={id:'11111111-1111-4111-8111-111111111111',verified:false},previous={id:'22222222-2222-4222-8222-222222222222',verified:true};
 it('requires a previous verified target and emits an inspectable command only',()=>{const plan=buildRollbackPlan([latest,previous],latest.id);expect(plan.ready).toBe(true);expect(plan.execute).toBe(false);expect(plan.targetVersionId).toBe(previous.id);expect(plan.command).toContain(previous.id);expect(plan.postChecks).toContain('Re-run deployment verification against the target build artifact.')});
 it('refuses current, unverified, malformed or absent targets',()=>{expect(buildRollbackPlan([latest],latest.id).ready).toBe(false);expect(()=>buildRollbackPlan([{id:'evil; deploy',verified:true}],latest.id)).toThrow('version ID');expect(buildRollbackPlan([latest,{...previous,verified:false}],latest.id).ready).toBe(false)});
});
describe('retrieval observations',()=>{
 it('reports source outage separately and preserves immutable input blueprint',async()=>{const before=JSON.stringify(blueprint);const report=await observeBlueprint(blueprint,async()=>new Response('offline',{status:503}));expect(report.status).toBe('unavailable');expect(report.candidate).toBeNull();expect(JSON.stringify(blueprint)).toBe(before)});
 it('does not treat malformed successful page as mass removal',async()=>{const report=await observeBlueprint(blueprint,async()=>new Response('<h1>Error</h1>'));expect(report.status).toBe('unavailable');expect(report.changes).toEqual([])});
 it('blocks redirection outside Microsoft Learn',async()=>{const report=await observeBlueprint(blueprint,async()=>new Response('',{status:302,headers:{location:'https://example.org'}}));expect(report.status).toBe('unavailable');expect(report.error).toContain('Microsoft Learn')});
});
describe('release guard regressions',()=>{
 it('refuses permissive script CSP even when self is present',async()=>{const report=await verifyDeployment('https://az104-revision-web.showtime-workers.workers.dev',new Map([['/','app'],['/sw.js','sw'],['/assets/app.js','js']]),async(url:string)=>new Response(new URL(url).pathname==='/'?'app':new URL(url).pathname==='/sw.js'?'sw':'js',{headers:{'content-security-policy':"default-src 'self'; script-src 'self' https:; object-src 'none'",'x-content-type-options':'nosniff'}}));expect(report.ok).toBe(false);expect(report.errors.join(' ')).toContain('CSP')});
 it('requires the current version in history and only chooses older verified versions',()=>{const current='11111111-1111-4111-8111-111111111111',newer={id:'33333333-3333-4333-8333-333333333333',verified:true};expect(buildRollbackPlan([newer],current).ready).toBe(false);expect(buildRollbackPlan([newer,{id:current,verified:false}],current).ready).toBe(false)});
});
