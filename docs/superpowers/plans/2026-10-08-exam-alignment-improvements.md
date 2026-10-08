# AZ-104 Exam-alignment Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans; the owner requested native execution and parallel build help. User approval of all twenty improvements and no further approval gates is explicit.

**Goal:** Expand original Learn-grounded exam-style content and ship all twenty approved improvements to the existing draft-preview app.

**Architecture:** Five agents author disjoint domain packs/source ledgers/audits. Root owns shared schema/storage/contracts, coverage and UI integration. A sixth independent task implements assessment selection/coverage/resource mappings. Native session transactions, generated validators and existing Cloudflare static hosting remain.

**Tech Stack:** Existing pinned React/TypeScript/Vite/Dexie/Ajv standalone/Playwright; no new runtime service.

**Spec:** docs/superpowers/specs/2026-10-08-exam-alignment-improvements-design.md

## Global Constraints

- Official Microsoft Learn evidence for all supplied factual content; original scenarios; no real exam questions.
- 300 proposed questions, all generated content draft with review null until real human factual review.
- Optional fields preserve existing backup/snapshot compatibility; changed wording/answers require revision increments.
- Draft modes never gain proficiency/review scores, including timed/case previews.
- Deployment updates existing az104-revision-web; no Showtime or paid-resource changes.
- Real physical-device acceptance cannot be fabricated; implement and automate everything accessible.

## Review Focus

- Old backups and existing sessions survive new optional formats/settings fields without silent loss.
- Ordering/matching exact sequence scoring and incomplete draft persistence never mis-score sets as ordered answers.
- Case studies and assessment reserves cannot leak through normal selectors or split shared-context groups.
- Source URL outage does not become factual invalidation; verified changed hashes quarantine only affected trust.
- Larger bank source/data work under strict CSP, offline caching and constrained phone layout without forged human approval.

### Task 1: Shared contracts and evidence research

**Files:** src/content/types.ts, content/schemas/question-pack.schema.json, src/content/validate.ts, src/backup/schema.ts; tests/content/formats.test.ts.
**Interfaces:** Question optional subObjectiveIds/exhibits/caseStudy/matchPrompts; ordering/matching correctOptionIds exact order.
- [x] Write malformed-format, wrong-subskill and old-question compatibility tests and observe failure.
- [x] Implement the optional schemas/types/semantic rules; regenerate standalone validators.
- [x] Run content/type/backup focused checks and commit.

### Task 2: Domain expansion and original-bank audits (parallel)

**Files per domain:** content/packs/az104-<domain>-expanded-draft.json; content/sources/<domain>-expanded.json; content/audits/<domain>-starter-audit.json; tests/content/<domain>-expanded.test.ts.
**Interfaces:** 50 new uniquely named draft questions per domain plus source ledgers. Stable subskills follow `<objectiveId>.<index>` and case groups contain three questions. No shared-file edits.
- [x] Fetch relevant official Learn pages through supported proxy and record actual checked timestamps/hashes.
- [x] Write bank structural/coverage/source/provenance/format tests, observe missing pack failure.
- [x] Author fifty distinct scenarios grounded directly in retrieved sections with per-option citations and required diversity.
- [x] Audit existing ten questions and map subskills without altering their immutable IDs/revisions; report defects for root correction.
- [x] Validate bank and focused tests; independent evidence review before release.

### Task 3: Scoring, persistence and answer UI

**Files:** src/study/scoring.ts; src/sessions/service.ts; src/features/practice/Question.tsx, Feedback.tsx, Exam.tsx, Summary.tsx; new Exhibits.tsx; tests/study/scoring.test.ts, tests/sessions/service.test.ts, tests/ui/formats.test.tsx.
**Interfaces:** exact ordered answers for order/match; isTimedSession(s) derives from deadline; createSession accepts draft-preview deadlines; save/submission remain transactional.
- [x] Write ordering reversal/matching misassignment/incomplete restore/draft-timed expiry tests; observe failure.
- [x] Implement scoring and timed-preview compatibility; conceal feedback until finalisation.
- [x] Implement semantic ordered/matched answer controls, exhibits and shared case context.
- [x] Verify failed writes/old backup/idempotent deadlines and commit.

### Task 4: Coverage, resources, balanced selection and case groups

**Files:** src/study/coverage.ts, assessment.ts; content/learning-resources.json, content/coverage/legacy-subskills.json; src/features/progress/Coverage.tsx; tests/study/coverage.test.ts, assessment.test.ts.
**Interfaces:** coverage rows for all blueprint subskills with installed/approved/studied counts; objective resources official canonical URLs; balanced assessment selector; selectCaseStudy(groupId).
- [x] Test absent subskills, historical revision exclusion, reserved opt-in, objective balancing and indivisible case selection.
- [x] Implement pure functions and retrieved official reading catalogue; preserve current selector behaviour where unchanged.
- [x] Root integrates topic links and honest availability metrics; verify and commit.

### Task 5: Study catalogue, advanced practice and comfortable phone controls

**Files:** src/app/App.tsx, bootstrap.ts; src/features/practice/Practice.tsx; new Cases.tsx, StudyPlan.tsx; src/features/settings/Settings.tsx; src/app/app.css.
**Interfaces:** bundled pack/source installer preserves local approvals by exact version; practice selects difficulty/objective and draft-timed/case mode; optional Settings.thumbControls boolean defaults false.
- [x] Test enlarged packs do not overwrite saved lifecycle decisions; draft timed/case cannot count towards progress.
- [x] Implement all-bank installation, coverage route, case catalogue and flexible weekly plan; larger thumb controls.
- [x] Update browser helpers for all answer formats; verify phone/keyboard/reduced-motion and commit.

### Task 6: Freshness pipeline and device support

**Files:** scripts/check-sources.mjs; src/content/freshness.ts; src/features/review/ContentReview.tsx; new DeviceChecklist.tsx; tests/content/freshness.test.ts; tests/e2e/webkit.spec.ts, formats.spec.ts.
**Interfaces:** classify changed/unavailable/unchanged source evidence; quarantine affected trust without altering immutable attempts; local device checklist saved browser-locally.
- [x] Test unchanged pages, verified content changes, outages, historical warnings and revision-specific re-review.
- [x] Implement reviewable reports and local content-health UI; no automatic human approval.
- [x] Add physical-device checklist and WebKit automation; preserve manifest/offline/backup semantics.
- [x] Verify and commit, recording real-device limitations honestly.

### Task 7: Whole-release validation, review and deployment

**Files:** README.md, ROADMAP.md, PROJECT_CONTEXT.md, docs/CONTENT_REVIEW.md, docs/verification/*; existing PR.
- [x] Run npm run check, complete browser suite, source audits and runtime audit; fix genuine failures.
- [x] Obtain fresh independent review of content evidence and data/format/source-update compatibility.
- [ ] Build and deploy approved draft improvements via existing Cloudflare direct assets workflow; verify literal live URL, strict CSP, phone flow and offline persistence.
- [ ] Record exact counts/coverage/remaining factual and physical-device gates; push PR updates and report concise results.
