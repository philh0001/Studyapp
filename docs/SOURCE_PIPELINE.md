# Official evidence pipeline

The Source evidence page shows canonical Microsoft Learn URLs, retrieval dates, SHA-256 observations, 30-day check reminders, missing baselines, outages, changed evidence, linked question revisions, answer/explanation impact and local resolution reasoning. No retrieval, imported report or resolution note grants factual approval. Questions and assessment snapshots remain immutable.

`evidence:source-resolutions` stores personal finding state and reasoning keyed by reference ID and observed content hash. A new hash gets a separate finding. These notes travel with workspace backups; imported notes cannot become `contentTrust`. Section citations that do not match a heading remain explicitly broad or ambiguous. Human factual approval continues individually in Content review.

## Preserved evidence

`content/blueprints/history/az104-2026-04-17.baseline.json` is an unchanged copy of the existing blueprint. Its originally retrieved official guide is preserved separately as `az104-2026-04-17.retrieved-baseline.html`. The current guide was actually retrieved on 2026-10-08 through the configured environment HTTP proxy. `az104-2026-10-08.observation.json` and `az104-2026-10-08.retrieved-current.html` record that observation. The measured blueprint remains effective April 17, 2026, with no measured-skill or weight differences. Whole-page HTML may still vary because of chrome.

`official-sections-baseline.json` preserves semantic heading/text evidence from 150 actually retrieved source references (135 distinct URLs), using the earlier `/tmp/studyapp-*-sources` and `/tmp/studyapp-source-pages` files. Every preserved source hash matches its original ledger hash. The licensing article uses the ledger's official URL including `preserve-view=true`; Microsoft's HTML canonical tag omits that parameter, and the evidence mapping records the full ledger URL. These observations are AI-assisted evidence preparation, not human technical approval. The original source pipeline and ledgers remain unchanged.

## Report commands

Run these from the repository root with Node 24 and installed dependencies:

```bash
node --experimental-strip-types scripts/check-sources.mjs --output /tmp/official/source-report.json
node --experimental-strip-types scripts/check-blueprint.mjs --output /tmp/official/blueprint-report.json
node --experimental-strip-types scripts/check-sections.mjs --output /tmp/official/section-report.json
```

The existing whole-page checker remains intact. The blueprint checker retrieves the official guide, validates each redirect stays on Microsoft Learn, extracts the actual published effective date, domain weights, objective titles and subskills, and emits a candidate/diff without changing the baseline. New or renamed titles get proposed IDs and require a mapping decision. Outages and unparseable guides preserve the baseline and emit `unavailable`, rather than mass deletions.

The section checker retrieves and hashes official articles, compares normalized heading/text evidence independently of navigation, and reports added/removed/modified sections with before/after text. Failed retrieval or incomplete extracted content is an outage observation, not factual change. Missing semantic baselines remain explicit. Its separate `*.observed-sections.json` artifact contains retrieved section snapshots; the script never promotes them to baseline automatically. A successful unchanged observation still proves only that the extracted text matches.

All network scripts use `undici.EnvHttpProxyAgent`, keep TLS validation, enforce HTTPS and the official Microsoft Learn host on each retrieval/redirect, and have timeouts. Reports are nonauthoritative. A human can review a future candidate and preserve it under a new history filename; existing baselines must not be overwritten. A changed explanation or objective needs a new question revision and separate factual approval.

Import blueprint/section reports on Source evidence to inspect diffs and impact offline. Import the original source-check report to review whole-page observations. Applying that original report requires an explicit acknowledgement, then uses the existing transactional quarantine behavior: changed evidence pauses affected approved revisions, outages preserve factual review, and no question is approved automatically. Section and blueprint imports never apply changes.

## Scheduled reports and CI

`.github/workflows/official-sources.yml` retrieves official evidence weekly on Monday at 05:17 UTC and on manual dispatch. It has read-only repository permissions, preserves reports/guide artifacts for 90 days, reports retrieval outcomes in the job summary, and never updates content, baselines, approval, PRs or deployments. GitHub scheduled workflows execute only from the default branch; until this workflow is merged there, use manual dispatch when available. Unavailability and whole-page changes remain visible in artifacts even when a retrieval step returns nonzero.

`.github/workflows/checks.yml` runs dependency installation, the complete `npm run check` (types, lint, unit, content, production build), Chromium/WebKit desktop/mobile Playwright suites, safe rollback-plan generation and artifact retention on push, PR and manual dispatch. CI execution and configured repository secrets cannot be claimed merely from these files.

Manual dispatch with `deploy=true` requires successful checks and the existing `studyapp-production` environment's real `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Missing credentials stop deployment with an explanatory failure. No secrets are fabricated or written. The job downloads the exact checked `dist` artifact, deploys only `production/web/wrangler.jsonc` (`az104-revision-web`), records deployment version identity, verifies the live release, and retains release evidence and assets. Environment protection rules, if configured by the repository owner, still apply.

## Actual deployment verification

```bash
node scripts/verify-deployment.mjs --dist dist --output /tmp/deployment-verification.json
```

The verifier only contacts `https://az104-revision-web.showtime-workers.workers.dev`. It retrieves every build file except source maps and Cloudflare control files, checks byte hashes against the exact supplied build, requires the shell/service worker/application JavaScript, and checks restrictive default/script/object CSP plus `nosniff`. Missing, stale or redirected responses fail. This catches stale chunks and wrong releases but is separate from browser installation/offline/smoke testing; a passing byte report alone is not a complete device acceptance test.

## Reviewed rollback plan

The rollback script never invokes Cloudflare, executes a shell, or performs rollback:

```bash
node scripts/rollback-plan.mjs --output /tmp/rollback-plan.json
node scripts/rollback-plan.mjs --history /tmp/verified-versions.json --current ACTUAL_CURRENT_VERSION_UUID --output /tmp/rollback-plan.json
```

Without authenticated version identity and a retained verified prior build, the report is explicitly `ready:false`. The history JSON is a newest-first array of `{ "id": "actual UUID", "verified": true|false }`. Include the current version. Mark a prior version verified only when its retained deployment report passed and its build artifact is available. Cloudflare listing alone cannot establish verification. Newer versions, current versions, malformed IDs, missing current identity and unverified targets cannot be selected.

A ready report contains an inspectable `npx wrangler rollback <target UUID> --name az104-revision-web` command and pre/post checks. Before manually executing it, inspect bindings/version details, confirm the actual failed release and matching retained prior artifact, and record the reason. The planner leaves Wrangler's interactive confirmation enabled. After execution, re-run deployment verification against the target build and browser install/offline/learn/assessment/backup smoke checks, record the resulting version and preserve failed-release evidence. Static asset rollback does not erase browser-local study history.

No live rollback was performed during implementation. Runtime readiness reported no configured Cloudflare credentials or outbound identity. Rollback selection and deployment verification failure/success behavior are tested with local response fixtures; live deployment verification belongs to the actual release step.
