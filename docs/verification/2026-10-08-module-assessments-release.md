# In-app learning module assessments

Owner requested five or six questions on what was just learned at the module assessment. Delivered six original single-answer questions per module, including all five modules without an official check (and one module with two checks, both opening the same module practice).

## Behaviour and sources

All 28 modules receive six questions: 168 questions and 672 explained options. Questions are tied to taught teaching/exercise lessons and official Microsoft documentation. The assessment runs inside Learn with explicit checking, manual advancement, selected/correct reasoning, source links, local saved answers, final scores, retry and default-collapsed answer review. Official Learn checks remain linked separately. These are original AI-assisted practice, not actual exam questions or human-approved content.

Every question/option received author semantic comparison and a separate independent review against actual retained official text. All 156 distinct cited URLs had actual retained text available. The reviewer found no incorrect key or important unresolved ambiguous claim. Its notes explicitly check current qualifications for Cloud Shell, licensing, incremental deployment, NSG overrides, storage, autoscaling, containers and VM insights. Final hashes bind all 168 installed questions to the independent report; no URL/hash auto-approval.

## Persistence and regression evidence

Focused regressions first reproduced missing in-app assessments, missing six-question coverage, assessment visibility lost after restoring a no-check module, stale parent snapshots discarding current progress on remount, and changing modules hiding a failed answer save. Fixes add module packs, persisted visibility, fresh database hydration, serialized writes and independent root write-tracker channels. Interaction stays blocked on loading failures; saving failures preserve the assessment until retry. Module scores derive from validated saved choices and do not alter practice proficiency.

Final checks, browser acceptance and actual deployment identities/results are added below after completion. Browser emulation does not assert physical iPhone/audio validation.

## Final local checks

`npm run check` passed TypeScript, ESLint, **469 tests across 94 files**, all installed question-pack validations and the production/PWA build. New assessment coverage includes 27 focused state/component/content/reader assertions. The independent reviewer separately reran 19 focused integration checks and found no important defect. The browser test JSON loader was adjusted for Node ESM; its typecheck and ESLint then passed. Full browser/deployment results follow below.

The final production build passed complete desktop Chromium, phone Chromium and phone WebKit acceptance: **127 passed, 2 intentional duplicate-engine skips**, 2.3 minutes. Both new module-assessment flows passed in all three engines, including all six answers/explanations, scores/retry, offline restored frozen answers/results, and modules without official checks.

## Published build and live checks

Product source: `46d6bd3b0cbdf7b980f337fe41351f3b06f057a4`.

Public URL: https://az104-revision-web.showtime-workers.workers.dev/#/course

Worker version: `d837237a-f6a3-4f04-9e93-f428f26aa544`.

Deployment: `9fd3d8be-0ce8-4a17-b9c7-1538d1e7518b`, created `2026-10-08T11:11:40.039898Z`, 100% traffic. Previous course-reader version `114d7c5b-6ae4-40b8-ace9-71f10d391d1e` remains available for rollback.

All 42 deployed files match the local checked build SHA-256 hashes; strict CSP and nosniff passed. An initial live probe could not locate the new button immediately after upload; a fresh browser run after deployment settled passed without code changes. The live 390×844 Chromium run opened all 28 modules, verified the correct module's questions and four choices, found no horizontal overflow, answered the complete six-question assessment with sourced feedback and an expected 5/6 score, reloaded that result offline under the installed service worker and restarted the assessment offline. Zero browser console/page errors. Companion deployment and live JSON records retain the evidence. No physical-device validation is claimed.
