# Studyapp — AZ-104 Revision

A personal, phone-first revision website for Microsoft AZ-104. Study at your own pace, with an optional exam date, original scenario questions, detailed explanations, spaced revision, and offline saved progress.

## Current status

The first application build is implemented on `feature/az104-revision`: phone-first learning, timed practice, spaced review, progress, notes/bookmarks, validated backups and offline installation. The public draft-preview website is live at [az104-revision-web.showtime-workers.workers.dev](https://az104-revision-web.showtime-workers.workers.dev). The 50-question starter pack remains draft until explicit human source review.

## Start here

- [Implementation plan](docs/superpowers/plans/2026-10-08-az104-revision.md): 12 tasks, interfaces, tests, and release checkpoints.
- [Product design](docs/superpowers/specs/2026-10-08-az104-revision-design.md): agreed scope and behaviour.
- [Project context](PROJECT_CONTEXT.md): decisions and current stage.
- [Roadmap](ROADMAP.md): first release and future work.
- [Plan verification](docs/verification/2026-10-08-plan-review.md): documentation checks actually performed.
- [Original supplied proposal](docs/reference/az104-study-app-plan.md): historical reference with the personal name removed; later design decisions take precedence, including cancellation of its exam date.

## Content accuracy

All supplied question answers, explanations, and revision facts must be grounded in official Microsoft documentation, primarily [Microsoft Learn](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104). Every option explanation has supporting source references and check dates. Questions are original practice scenarios, not copied Microsoft assessments or actual exam questions. AI-assisted content requires explicit human review before normal study.

## Run locally

React, TypeScript, Vite, IndexedDB/Dexie, and PWA support, with separate Cloudflare web hosting. No account, Azure resources, runtime AI, or backend is needed for the first release. Local progress belongs to one browser profile; backup/restore is part of the first release.

Use Node 24 or newer:

```sh
npm ci
npm run dev
```

For verification: `npm run check`. For browser checks: install the Playwright Chromium browser, then `npm run test:e2e`. `npm run build` produces `dist/`; `npx vite preview --host 0.0.0.0` previews that installable build.

Start with **Explore draft questions** for unscored practice. In **Review → Content review**, check each cited Microsoft Learn source and approve individual revisions to enable scored learning and timed practice. A source check is separate from technical approval. There is no bulk approval. Set an exam date only when you want one.

Settings contains local JSON export/restore and explicit data deletion. Restored content requires fresh local review; historical attempts are preserved. Source documents open online, while the installed app and question bank work offline. Updates wait until active sessions are finished.

See [live deployment verification](docs/verification/2026-10-08-cloudflare-release.md), [hosting preparation](production/web/README.md) and [release verification](docs/verification/2026-10-08-release-preparation.md). Production deployment and paid resources require separate release approval. Product work uses a feature branch and pull request.
