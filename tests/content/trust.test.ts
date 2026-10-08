import {it,expect} from 'vitest';
import {classifyQuestion,isSourceCheckDue} from '../../src/content/trust';
import {question} from '../fixtures';
const trust={questionId:'q1',revision:1,sourceCheckedAt:'2026-10-08T00:00:00Z',humanReviewedAt:'2026-10-08T01:00:00Z',reviewer:'Reviewer',invalidatedAt:null};
it('draft_cannot_self_certify',()=>expect(classifyQuestion(question(),trust)).toBe('draft'));
it('imported_review_metadata_does_not_grant_trust',()=>expect(classifyQuestion(question({status:'reviewed',review:{reviewer:'Claimed',reviewedAt:trust.sourceCheckedAt,method:'claim'}}),null)).toBe('draft'));
it('invalidated_revision_cannot_start_session',()=>expect(classifyQuestion(question({status:'reviewed'}),{...trust,invalidatedAt:trust.sourceCheckedAt})).toBe('invalidated'));
it('trusted reviewed revision is eligible',()=>expect(classifyQuestion(question({status:'reviewed'}),trust)).toBe('eligible'));
it('freshness_at_30_days',()=>{expect(isSourceCheckDue('2026-09-08T12:00:00Z',new Date('2026-10-08T12:00:00Z'))).toBe(true);expect(isSourceCheckDue('2026-09-09T12:00:00Z',new Date('2026-10-08T12:00:00Z'))).toBe(false)});
