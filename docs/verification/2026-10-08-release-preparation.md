# Release preparation — 2026-10-08

First local-first build for `philh0001/Studyapp`, branch `feature/az104-revision`. This is a draft-preview release package, not a deployed website or human-approved question bank.

## Implemented

Phone-first React/TypeScript app with Learn and unscored draft preview, exact multi-select scoring, confidence, per-option Microsoft Learn explanations, durable resumable sessions, UTC spaced review, latest-distinct coverage, separate Learn/timed metrics, notes/bookmarks, optional exam date/theme/text scale, timed navigation/flags/deadlines/concealed feedback, full validated local backup/recovery/restore/deletion, and offline PWA with guarded updates.

Fifty original AI-assisted questions: ten per domain, two assessment-reserved per domain, five multi-select. All shipped statuses are draft, reviews are null, and no approval is fabricated. The app requires explicit local human source review for each revision before scored study. The [initial five-question review batch](../reference/first-five-draft-questions.md) is ready for factual review. [Content review notes](../CONTENT_REVIEW.md) list objective gaps and uncertain claims deliberately excluded.

The Microsoft Learn guide and fifteen supporting pages were actually retrieved on 2026-10-08. The blueprint effective 2026-04-17 maps five domains, fifteen objectives and eighty-two subskills. Claim-level citations and dates are in the pack; URL retrieval is distinct from technical human approval. Section labels are displayed beside canonical page links rather than guessed URL fragments. External documentation requires internet.

## Verification evidence

- `npm run check`: typecheck, ESLint, **96 unit/integration tests across 19 files**, schema/semantic content validation and production build pass.
- `PLAYWRIGHT_BROWSERS_PATH=/tmp/studyapp-playwright npm run test:e2e -- --output /tmp/studyapp-final-e2e`: **22/22 pass**, Chromium 156.0.8078.4, desktop and 390px touch viewport profiles.
- Browser journeys: ten locally approved Learn questions; notes/bookmarks and saved feedback after reload; five local approvals and shortened timed practice with hidden explanations until confirmed final submission; export/recovery download/restore with immediate settings refresh; ten-question draft practice offline, offline reload and completion; keyboard focus; reduced motion; 320/390/430px with 1.4 text scale; explicit/system dark and light text contrast.
- Test approval clicks occur only in disposable browser databases. They test the workflow and do **not** approve the released question bank factually.
- Measured system-dark component text contrast ranges 5.70:1–9.11:1. This is targeted computed-color evidence, not a complete accessibility certification.
- `npm audit --omit=dev`: zero reported runtime vulnerabilities.
- Worker packaging: `XDG_CONFIG_HOME=/tmp/studyapp-wrangler-config WRANGLER_LOG_PATH=/tmp/studyapp-wrangler.log npx wrangler deploy --config production/web/wrangler.jsonc --dry-run --outdir /tmp/studyapp-worker-dry-run` passes without bindings or remote deployment.
- Read-only Cloudflare check: proposed `az104-revision-web` has no name collision in the connected account on this date. Recheck before a later deploy.
- `git diff --check` passes. Personal backup files, environment secrets, dependency folders and build outputs are excluded.

A fresh independent agent reviewed the whole app and verified fixes. No Critical issue was found. All Important findings are resolved: internal backup history consistency; stale post-submit answer writes; pending/failed-write navigation; crashed-tab update veto; system-dark contrast. Follow-up ran 45 focused tests across six files with no remaining blocking reproduction. Minor review findings (source correction action, timed coverage warnings and question/feedback focus) were implemented.

## Limitations and release gates

- All fifty questions still require real human factual review; this is not full objective coverage, an official exam bank or a pass prediction. Normal study becomes available only for locally reviewed revisions.
- Physical phone/iPhone installation, Safari storage behaviour and actual screen-reader use remain owner-device acceptance checks. Chromium emulation does not prove these.
- Actual service-worker version replacement across live tabs has unit gating tests; a deployed upgrade and offline behaviour behind private access still need hosting acceptance.
- Clearing browser data removes local progress; backup is explicit and there is no cross-device sync. Imported installed approvals are quarantined, while immutable historical attempts survive.
- Vite reports a single app/content chunk over 500 kB (about 637 kB minified/178 kB gzip, whole precache about 651 KiB). Retained for the small initial offline bank; no performance claim is made. Dependency development tooling has not been included in the zero-runtime-vulnerability assertion.
- Production headers have been packaged, but their literal remote responses cannot be verified before deployment. No production URL is claimed.
- No Cloudflare service, paid resource, Azure resource or Showtime resource was changed.

## Execution rulings

The cloud skill helper scripts were unavailable locally, so task evidence was maintained manually. Dependencies were installed in one pinned setup pass. The user explicitly requested parallel build help, so agents owned disjoint content, backup, timed and PWA tasks while the root agent integrated them. Browser servers were run sequentially after a concurrent preview collision; contaminated runs were discarded and the final complete suite passed alone. Browser tests use actual approval UI in disposable profiles rather than introducing synthetic approval fixtures into a release build. None of these rulings relaxes human-content or production-release approval.

Production approval remains required by AGENTS.md and the supplied plan: “Do not add paid resources, deploy Azure resources, or deploy production without the user's release approval.” The package is ready to review. Choose public hosting or a verified owner-private access layer before deployment.
