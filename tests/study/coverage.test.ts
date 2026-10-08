import {expect,it} from 'vitest';
import {computeCoverage} from '../../src/study/coverage';
import {blueprint,question} from '../fixtures';
import officialBlueprint from '../../content/blueprints/az104-2026-04-17.json';
import type {Attempt} from '../../src/sessions/types';
const q=question({status:'reviewed',subObjectiveIds:['rbac.1','unknown.1']});
const trust=[{questionId:q.id,revision:1,sourceCheckedAt:'2026-10-08',humanReviewedAt:'2026-10-08',reviewer:'Owner',invalidatedAt:null}];
const attempt=(id:string,correct:boolean,date:string,extra:Partial<Attempt>={}):Attempt=>({id,sessionId:'s',questionId:q.id,questionRevision:1,questionSnapshot:q,selectedOptionIds:['a'],confidence:'confident',correct,responseMs:10,submittedAt:date,mode:'learn',...extra});
it('keeps absent subskills and unknown mappings cannot invent coverage',()=>{expect(computeCoverage(blueprint,[],[],[])[0]).toMatchObject({id:'rbac.1',installed:0,approved:0,studied:0,accuracy:null,insufficientEvidence:true});expect(computeCoverage(blueprint,[q],trust,[])).toHaveLength(1)});
it('counts latest distinct eligible answers, ignores drafts and historical revisions',()=>{const rows=computeCoverage(blueprint,[q],trust,[attempt('a',false,'2026-10-01'),attempt('b',true,'2026-10-02'),attempt('c',false,'2026-10-03',{mode:'draft-preview'}),attempt('d',false,'2026-10-04',{questionRevision:0})]);expect(rows[0]).toMatchObject({installed:1,approved:1,studied:1,accuracy:1,insufficientEvidence:true})});
it('equal timestamps deterministically use later supplied answer; invalidation removes proficiency',()=>{const answers=[attempt('a',true,'2026-10-01'),attempt('b',false,'2026-10-01')];expect(computeCoverage(blueprint,[q],trust,answers)[0].accuracy).toBe(0);expect(computeCoverage(blueprint,[q],[{...trust[0],invalidatedAt:'2026-10-08'}],answers)[0]).toMatchObject({approved:0,studied:0,accuracy:null})});
it('legacy mappings only apply to exact revision and installed revisions count once',()=>{const old=question({status:'reviewed'});expect(computeCoverage(blueprint,[old,old],trust,[],{'q1@1':['rbac.1']})[0].installed).toBe(1);expect(computeCoverage(blueprint,[old],trust,[],{'q1@2':['rbac.1']})[0].installed).toBe(0)});

it('the newest installed revision wins regardless of input order',()=>{const next=question({status:'reviewed',revision:2,subObjectiveIds:['rbac.1']});expect(computeCoverage(blueprint,[next,q],trust,[attempt('old',true,'2026-10-08')])[0]).toMatchObject({installed:1,approved:0,studied:0})});

it('shows all 82 official subskills with honest empty evidence',()=>{const rows=computeCoverage(officialBlueprint,[],[],[]);expect(rows).toHaveLength(82);expect(new Set(rows.map(row=>row.id)).size).toBe(82);expect(rows.every(row=>row.accuracy===null&&row.insufficientEvidence)).toBe(true)});
