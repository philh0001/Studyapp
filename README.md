# Studyapp — AZ-104 Revision

A personal, phone-first revision website for Microsoft AZ-104. Study at your own pace, with an optional exam date, original scenario questions, detailed explanations, spaced revision, and offline saved progress.

## Current status

Planning documentation is complete and available for review. Application code has not been built, dependencies have not been installed, and no website has been deployed.

## Start here

- [Implementation plan](docs/superpowers/plans/2026-10-08-az104-revision.md): 12 tasks, interfaces, tests, and release checkpoints.
- [Product design](docs/superpowers/specs/2026-10-08-az104-revision-design.md): agreed scope and behaviour.
- [Project context](PROJECT_CONTEXT.md): decisions and current stage.
- [Roadmap](ROADMAP.md): first release and future work.
- [Plan verification](docs/verification/2026-10-08-plan-review.md): documentation checks actually performed.
- [Original supplied proposal](docs/reference/az104-study-app-plan.md): historical reference with the personal name removed; later design decisions take precedence, including cancellation of its exam date.

## Content accuracy

All supplied question answers, explanations, and revision facts must be grounded in official Microsoft documentation, primarily [Microsoft Learn](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104). Every option explanation has supporting source references and check dates. Questions are original practice scenarios, not copied Microsoft assessments or actual exam questions. AI-assisted content requires explicit human review before normal study.

## Planned build

React, TypeScript, Vite, IndexedDB/Dexie, and PWA support, with separate Cloudflare web hosting. No account, Azure resources, runtime AI, or backend is needed for the first release. Local progress belongs to one browser profile; backup/restore is part of the first release.

Review the implementation plan and select the execution workflow before building. Production deployment and paid resources require separate release approval after the working build is ready. Future implementation work uses a feature branch and pull request.
