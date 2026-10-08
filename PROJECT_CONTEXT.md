# Project context

Personal AZ-104 study website, mainly used on a phone. Web-first access similar to Showtime. No current exam date: the earlier 16 October 2026 target was cancelled. Study at the user's pace.

Design: [AZ-104 Revision](docs/superpowers/specs/2026-10-08-az104-revision-design.md).

Implemented stack: React, TypeScript, Vite, IndexedDB/Dexie, PWA; Cloudflare web hosting. Separate project from Showtime. No account/backend initially. Local progress is browser-specific; backup/restore is required.

Repository selected by the user: https://github.com/philh0001/Studyapp. Planning documents are on main. Implementation is on `feature/az104-revision`; development checkout: `/workspace/az104-revision/.worktrees/az104`.

Initial scope: original reviewed questions, Learn mode, Quick 5/10/20, timed practice, explanations for all options, confidence before feedback, spaced review, progress/coverage, bookmarks, notes, offline support, backup/restore, accessibility.

Source content: the supplied ZIP contains a plan, not questions. AI-assisted questions require human review before normal study. The original fifty drafts are retained unchanged. The approved expansion adds 250 drafts and maps all 82 subskills, without claiming comprehensive exam coverage or human factual approval.

Official-source requirement: all supplied question answers, option explanations, and revision information must be grounded in official Microsoft documentation, preferably Microsoft Learn. Author original scenarios rather than copying Microsoft assessments. Record claim-level citations and source-check dates, expose them in feedback, recheck before pack releases, and exclude unsupported content. Personal notes remain annotations rather than verified content.

Current stage: first application build implemented on 8 October 2026, with parallel build assistance explicitly requested by the user. [Implementation plan](docs/superpowers/plans/2026-10-08-az104-revision.md) tracks the approved scope. Fifty original AI-assisted drafts cite retrieved official Microsoft Learn pages; zero are represented as human-reviewed in the shipped pack. Local manual approval enables scored study. Whole-app verification and independent review are recorded in the release notes. No changes to Showtime or remote Cloudflare resources.

Release constraints from the supplied plan: no production deployment or paid services without approval. Maintain documentation and verification evidence throughout work.

Hosting preference confirmed: Cloudflare like Showtime, with a separate Static Assets Worker and initially a workers.dev URL. Production release approval remains the final publication gate; no custom domain, private Access layer or account backend has been requested.

Public draft-preview release approved and deployed on 2026-10-08: https://az104-revision-web.showtime-workers.workers.dev. Verified live phone-sized navigation, durable answers and offline continuation with zero browser errors. Strict CSP compatibility was fixed through build-time standalone schema validators. See docs/verification/2026-10-08-cloudflare-release.md. Factual content approval and physical-device acceptance remain pending; PR #1 remains open.

The owner authorised all twenty exam-alignment improvements without further permission gates. Implemented expansion: 300 questions, detailed subskill coverage, balanced assessment allocation, advanced and linked-case practice, safe exhibits, ordering/matching, Learn resources, a flexible study week, source-change quarantine, thumb controls, bounded compressed backups and real-device checklists. Automated acceptance includes phone-sized WebKit; it does not constitute a physical iPhone/screen-reader test. See the improvement release record for exact verification and deployment evidence.

Expanded draft release deployed and live-verified at the same public URL. Application source e673883, Cloudflare deployment ecb6cdca664547828585dad573b80106. Final 173 unit tests and 54 complete browser checks passed; all 150 source records rechecked unchanged. PR #1 remains open on the feature branch. Human factual review and actual-device acceptance remain distinct outstanding evidence.

The owner authorised all next 100 changes without another permission gate. The live bank has 315 original drafts, including 15 new reserved questions. Every current revision has an AI-assisted semantic review; 11 prior versions are preserved and nine exact option-excerpt gaps remain flagged. Shipped human approval remains zero. The programme adds library organisation/presets, cited learning and practical exercises, separate reviewed flashcards, personal reasoning/journal, learning insights, self-paced cases, source maintenance, comfort and recovery tools. All 153 source records across 138 official Learn URLs rechecked unchanged. The authenticated existing Worker deployment was verified with 318 unit checks, 82 browser checks, deployed byte hashes and live phone-sized/offline smoke. PR #1 remains open; scheduled workflows need default-branch activation and unattended deployment needs authentic CI credentials. See the next-100 delivery/release records for exact evidence and identities.

The owner authorised the subsequent 100 improvements (101–200) without further permission. Implementation adds a personal journey planner, cited reading/manual practical tracking, autosaved reasoning workpads, historical reports, local diagnostics and exact option quotation bindings. Heavy routes are deferred and fully precached. Source integrity remains distinct from factual review: 315 questions stay draft, 1050 options have exact bound quotations, and nine semantic concerns remain for human review. See docs/superpowers/plans/2026-10-08-second-100.md and the corresponding release/traceability records for measured verification and deployment state.

Improvements 101–200 are deployed and live-verified at the existing public draft URL. Product source `2e44ae8`; 394 unit checks and 106 browser checks passed. Exact option quotation gaps are now zero; nine semantic concerns and human factual/physical-device review remain pending. See docs/verification/2026-10-08-second-100-release.md.
