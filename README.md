# Studyapp — AZ-104 Revision

A personal, phone-first revision website for Microsoft AZ-104. Study at your own pace, with an optional exam date, original scenario questions, detailed explanations, spaced revision, and offline saved progress.

## Current status

The first application build is implemented on `feature/az104-revision`: phone-first learning, timed practice, spaced review, progress, notes/bookmarks, validated backups and offline installation. The public draft-preview website is live at [az104-revision-web.showtime-workers.workers.dev](https://az104-revision-web.showtime-workers.workers.dev). The expanded bank has 315 original drafts covering all 82 published subskills. It includes advanced scenarios, ordering/matching, exhibits, linked cases and timed practice. Question provenance remains draft until explicit human source review; this status does not block practice.

The next100 programme adds a searchable library, personal folders/tags and presets, cited objective summaries and practical exercises, separately scheduled reviewed flashcards, detailed learning insights, self-paced cases, evidence/change dashboards, read-aloud controls, safer backups and complete offline-asset checks. See the [100-item delivery ledger](docs/verification/2026-10-08-next-100-traceability.md) and [source pipeline](docs/SOURCE_PIPELINE.md). Teaching material remains clearly labelled AI-assisted draft.

## Start here

- [Authorised hundred-improvement plan](docs/superpowers/plans/2026-10-08-next-100.md).
- [Approved twenty-improvement plan](docs/superpowers/plans/2026-10-08-exam-alignment-improvements.md).
- [Implementation plan](docs/superpowers/plans/2026-10-08-az104-revision.md): 12 tasks, interfaces, tests, and release checkpoints.
- [Product design](docs/superpowers/specs/2026-10-08-az104-revision-design.md): agreed scope and behaviour.
- [Project context](PROJECT_CONTEXT.md): decisions and current stage.
- [Roadmap](ROADMAP.md): first release and future work.
- [Plan verification](docs/verification/2026-10-08-plan-review.md): documentation checks actually performed.
- [Original supplied proposal](docs/reference/az104-study-app-plan.md): historical reference with the personal name removed; later design decisions take precedence, including cancellation of its exam date.

## Content accuracy

All supplied question answers, explanations, and revision facts must be grounded in official Microsoft documentation, primarily [Microsoft Learn](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104). Every option explanation has supporting source references and check dates. Questions are original practice scenarios, not copied Microsoft assessments or actual exam questions. Human factual review remains optional and is recorded separately from practice availability.

## Run locally

React, TypeScript, Vite, IndexedDB/Dexie, and PWA support, with separate Cloudflare web hosting. No account, Azure resources, runtime AI, or backend is needed for the first release. Local progress belongs to one browser profile; backup/restore is part of the first release.

Use Node 24 or newer:

```sh
npm ci
npm run dev
```

For verification: `npm run check`. For browser checks: install the Playwright Chromium and WebKit browsers with their system dependencies, then `npm run test:e2e`. `npm run build` produces `dist/`; `npx vite preview --host 0.0.0.0` previews that installable build.

Choose **Learn** or **Timed practice**, set your study filters and press **Start session**. Questions are immediately available and your answers count towards personal practice progress without an approval step. **More options** contains optional reserve/mix/source diagnostics. Microsoft Learn citations remain in feedback. Content review is an optional tool; it does not block study or imply human approval. Set an exam date only when you want one.

Settings contains local JSON/gzip export/restore and explicit data deletion. Restored content retains truthful review metadata; historical attempts are preserved and normal practice does not require local approval. Source documents open online, while the installed app and question bank work offline. Updates wait until active sessions are finished.

See [live deployment verification](docs/verification/2026-10-08-cloudflare-release.md), [hosting preparation](production/web/README.md) and [release verification](docs/verification/2026-10-08-release-preparation.md). The owner authorised the draft publication and this improvement deployment. Paid services and unrelated resources remain outside the approved scope. Product work uses a feature branch and pull request.

Detailed coverage separates installed, approved and studied subskills. The home page suggests a flexible study week without a fixed exam date. Source rechecks produce reviewable reports; see [source freshness](docs/SOURCE_FRESHNESS.md). Real-phone installation and screen-reader checks remain to be performed on the actual device; the Settings checklist records only checks you do yourself.

The [twenty-improvement release record](docs/verification/2026-10-08-exam-alignment-release.md) records 173 unit tests, 54 browser checks, official source retrieval, independent review and live deployment evidence.

The [hundred-improvement release](docs/verification/2026-10-08-next-100-release.md) records318unit checks,82passing browser checks,153official source rechecks, independent review and live deployment evidence. Human factual/physical-device acceptance and unattended CI prerequisites remain explicit.
