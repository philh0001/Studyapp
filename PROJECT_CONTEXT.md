# Project context

Personal AZ-104 study website for Philip, mainly used on a phone. Web-first access similar to Showtime. No current exam date: the earlier 16 October 2026 target was cancelled. Study at the user's pace.

Design: [AZ-104 Revision](docs/superpowers/specs/2026-10-08-az104-revision-design.md).

Recommended stack: React, TypeScript, Vite, IndexedDB/Dexie, PWA; Cloudflare web hosting. Separate project from Showtime. No account/backend initially. Local progress is browser-specific; backup/restore is required.

Repository selected by the user: https://github.com/philh0001/Studyapp. Initialise the empty repository with planning documents; subsequent product work uses a feature branch. Local checkout: /workspace/az104-revision.

Initial scope: original reviewed questions, Learn mode, Quick 5/10/20, timed practice, explanations for all options, confidence before feedback, spaced review, progress/coverage, bookmarks, notes, offline support, backup/restore, accessibility.

Source content: the supplied ZIP contains a plan, not questions. AI-assisted questions require human review before normal study. A proposed 50-question starter pack must show objective gaps and cannot be advertised as complete exam coverage.

Official-source requirement: all supplied question answers, option explanations, and revision information must be grounded in official Microsoft documentation, preferably Microsoft Learn. Author original scenarios rather than copying Microsoft assessments. Record claim-level citations and source-check dates, expose them in feedback, recheck before pack releases, and exclude unsupported content. Personal notes remain annotations rather than verified content.

Current stage: design accepted for implementation planning on 8 October 2026, including the official Microsoft source requirement. [Implementation plan](docs/superpowers/plans/2026-10-08-az104-revision.md) prepared for user review and execution-method selection. Product code has not started. No changes to Showtime or Cloudflare resources.

Release constraints from the supplied plan: no production deployment or paid services without approval. Maintain documentation and verification evidence throughout work.
