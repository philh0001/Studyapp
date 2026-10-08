# Architecture

React/TypeScript components call a transactional local session service. Pure modules own scoring, spaced repetition, selection, and progress. IndexedDB/Dexie stores database schema version 2, with immutable session question snapshots and unique session/question attempt keys. Failed writes do not advance the UI. Timed sessions use wall-clock deadlines; learning response time counts visible activity.

Content packs and the official blueprint are versioned JSON, validated with Ajv. Microsoft Learn sources are retrieved separately, and technical evidence checks never substitute for human review. Normal study requires local reviewed trust for the exact revision. Corrections preserve historical attempts and invalidate current eligibility.

React 19, Vite 8, TypeScript 6 and current compatible packages are pinned in package.json/package-lock.json. Node 24.19.0 is the implementation environment. No runtime AI, account API, external analytics service or external font dependency exists. Browser-local analytics derive insights from saved practice. Progress is browser-local; backup and PWA layers extend the same storage service.

Schema validation is precompiled with Ajv standalone during builds. Runtime validation imports generated functions and format helpers rather than dynamically compiling JavaScript, preserving a CSP without unsafe-eval. The schemas stay the authority; generated validators are tracked and regenerated using `npm run validators:generate`.

The public Cloudflare Static Assets Worker is `az104-revision-web`, served at https://az104-revision-web.showtime-workers.workers.dev. No backend or server-side personal progress store is introduced.

The `workspace` table stores bounded, plain JSON personal sections (folders, presets, flashcard schedules, review findings, journal, comfort and device reports). Consumers normalize their individual data contracts before rendering. Compatible schema-1 backups optionally carry workspace; legacy imports clear new preferences without discarding prior history. Backup inspection precedes recovery download and explicit replacement; imported approvals never grant fresh local eligibility.

Assessment sessions include absolute-deadline timed practice and self-paced end-feedback cases. `isAssessmentSession` controls submission and feedback; only timed sessions have deadlines. Active assessment answers are withheld from library, flashcards, evidence and review routes. Reserve reveal is explicit and records release metadata without pretending it is an answered attempt.

Separate vendor, validators, question-bank, study-data and app bundles remain eager dependencies. Full offline installation caches every emitted JS/CSS plus shell, manifest and icons; `offline-assets.json` is the exact build inventory. Splitting makes app code smaller but does not claim a measured first-load speed improvement. CI includes full checks/browser evidence, source retrieval reports and authenticated deployment byte verification. Rollback planning is read-only and tested; deployment secrets are not fabricated.
