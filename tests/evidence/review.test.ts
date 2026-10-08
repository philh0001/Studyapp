import {describe,it,expect} from 'vitest';
import {question} from '../fixtures';
import {filterReviewQueue,createIssue,transitionIssue,proposeWording,exportReviewReport,reviewChecklist,qualitySummary} from '../../src/features/evidence/review';

describe('evidence review workflow',()=>{
 it('filters objective, question format and correction separately from drafts',()=>{
  const draft=question(), ordering=question({id:'q2',type:'ordering',objectiveId:'policy'});
  const issue=createIssue(draft,'ambiguity','Specify scope','2026-10-08T00:00:00Z');
  expect(filterReviewQueue([draft,ordering],[],[issue],{queue:'corrections',format:'single',objective:'rbac',search:'q1'}).map(q=>q.id)).toEqual(['q1']);
  expect(filterReviewQueue([draft,ordering],[],[issue],{queue:'drafts',format:'all',objective:'all',search:''})).toEqual([ordering]);
 });
 it('requires resolution reasoning and retains immutable history',()=>{
  const issue=createIssue(question(),'factual','Check the scope','2026-10-08T00:00:00Z');
  expect(()=>transitionIssue(issue,'resolved','', '2026-10-08T01:00:00Z')).toThrow(/reason/i);
  const resolved=transitionIssue(issue,'resolved','Checked official section: no wording change needed','2026-10-08T01:00:00Z');
  expect(issue.status).toBe('open');expect(resolved.history).toHaveLength(2);
  expect(transitionIssue(resolved,'open','New source update','2026-10-08T02:00:00Z').history).toHaveLength(3);
 });
 it('records proposed revisions without changing bank content or granting human approval',()=>{
  const q=question();const proposal=proposeWording(q,'prompt','Specify the resource-group scope','Clarifies scope','2026-10-08T00:00:00Z');
  expect(q.prompt).toBe('Test prompt');expect(proposal.baseRevision).toBe(1);expect(proposal.proposedRevision).toBe(2);
  const report=JSON.parse(exportReviewReport([q],[createIssue(q,'wording','Scope')],[proposal],{}));
  expect(report.humanApprovalGranted).toBe(false);expect(report.proposals[0].newText).toContain('resource-group');expect(report.questions[0].revision).toBe(1);
 });
 it('requires individual option and sequence/match/case checklist items',()=>{
  const q=question({type:'matching',matchPrompts:[{id:'p1',text:'Read'}],caseStudy:{id:'case',title:'Case',overview:'Facts'}});
  expect(reviewChecklist(q).map(x=>x.id)).toEqual(expect.arrayContaining(['option:a','option:b','option:c','matching','case','assumptions','sources','answer','summary']));
 });
 it('does not count AI audit or imported checklists as human approved quality',()=>{
  const q=question();expect(qualitySummary([q],[],[{questionId:'q1',revision:1,disposition:'needs-review',optionAudits:[]}])).toEqual(expect.objectContaining({total:1,humanApproved:0,aiAudited:1,uncertain:1}));
 });
});
it('reports current eligible approval only and does not reuse trust for a different revision',()=>{
 const current=question({status:'reviewed'}),next=question({id:'q2',revision:2,status:'reviewed'});
 const trust=[{questionId:'q1',revision:1,sourceCheckedAt:'2026-10-08T00:00:00Z',humanReviewedAt:'2026-10-08T01:00:00Z',reviewer:'Local reviewer',invalidatedAt:null},{questionId:'q2',revision:1,sourceCheckedAt:'2026-10-08T00:00:00Z',humanReviewedAt:'2026-10-08T01:00:00Z',reviewer:'Local reviewer',invalidatedAt:null}];
 expect(qualitySummary([current,next],trust,[]).humanApproved).toBe(1);
 expect(filterReviewQueue([current,next],trust,[],{queue:'approved',objective:'all',format:'all',search:''})).toEqual([current]);
});
it('stages a specific ambiguous matching prompt as a new revision proposal',()=>{
 const q=question({type:'matching',matchPrompts:[{id:'p2',text:'Online data retained at least 30 days'}]});
 const proposal=proposeWording(q,'match:p2','Online tier with a documented 30-day minimum','Other tiers also accept longer retention');
 expect(proposal.oldText).toBe('Online data retained at least 30 days');expect(proposal.proposedRevision).toBe(2);
});
it('filters domain, difficulty and source issues independently',()=>{
 const identity=question(),storage=question({id:'q2',domainId:'storage',difficulty:'advanced'}),sourceIssue=createIssue(storage,'source-freshness','Changed reference');
 expect(filterReviewQueue([identity,storage],[],[sourceIssue],{queue:'all',format:'all',objective:'all',search:'',domain:'storage',difficulty:'advanced',issueKind:'source-freshness'})).toEqual([storage]);
 expect(filterReviewQueue([identity,storage],[],[sourceIssue],{queue:'all',format:'all',objective:'all',search:'',domain:'storage',difficulty:'foundation',issueKind:'all'})).toEqual([]);
});
import {assessmentProtectedIds} from '../../src/features/evidence/review';
import type {DatabaseSnapshot,Session} from '../../src/sessions/types';
it('protects active assessment question IDs across revisions including self-paced drafts',()=>{
 const base={id:'s',mode:'draft-preview',questionSnapshots:[question()],optionOrders:{},answers:{},flags:[],currentIndex:0,startedAt:'2026-10-08T00:00:00Z',deadlineAt:null,status:'active',submittedAt:null,correctionWarnings:[],feedbackAtEnd:true} as Session;
 expect([...assessmentProtectedIds({sessions:[base]} as DatabaseSnapshot)]).toEqual(['q1']);
 expect([...assessmentProtectedIds({sessions:[{...base,feedbackAtEnd:false,deadlineAt:'2026-10-08T01:00:00Z'}]} as DatabaseSnapshot)]).toEqual(['q1']);
 expect([...assessmentProtectedIds({sessions:[{...base,status:'submitted'}]} as DatabaseSnapshot)]).toEqual([]);
});
it('portable exports omit withheld question findings, proposals and checklist contents',()=>{
 const hidden=question({id:'hidden'}),shown=question(),issues=[createIssue(hidden,'factual','Answer leak')],proposals=[proposeWording(hidden,'prompt','Leaked answer','Correction')];
 const report=JSON.parse(exportReviewReport([shown],issues,proposals,{'hidden:1':['sources']},[{questionId:'hidden',revision:1,disposition:'needs-review',optionAudits:['secret']}],[{questionId:'hidden',questionSnapshot:hidden}]));
 expect(report.issues).toEqual([]);expect(report.proposals).toEqual([]);expect(report.checklists).toEqual({});expect(report.audits).toEqual([]);expect(report.historicalRevisions).toEqual([]);
});
