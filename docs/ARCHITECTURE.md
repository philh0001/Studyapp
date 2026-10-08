# Architecture

React/TypeScript components call a transactional local session service. Pure modules own scoring, spaced repetition, selection, and progress. IndexedDB/Dexie stores schema version 1, with immutable session question snapshots and unique session/question attempt keys. Failed writes do not advance the UI. Timed sessions use wall-clock deadlines; learning response time counts visible activity.

Content packs and the official blueprint are versioned JSON, validated with Ajv. Microsoft Learn sources are retrieved separately, and technical evidence checks never substitute for human review. Normal study requires local reviewed trust for the exact revision. Corrections preserve historical attempts and invalidate current eligibility.

React 19, Vite 8, TypeScript 6 and current compatible packages are pinned in package.json/package-lock.json. Node 24.19.0 is the implementation environment. No runtime AI, account API, analytics, or external font dependency exists. Progress is browser-local; backup and PWA layers extend the same storage service.

Schema validation is precompiled with Ajv standalone during builds. Runtime validation imports generated functions and format helpers rather than dynamically compiling JavaScript, preserving a CSP without unsafe-eval. The schemas stay the authority; generated validators are tracked and regenerated using `npm run validators:generate`.

The public Cloudflare Static Assets Worker is `az104-revision-web`, served at https://az104-revision-web.showtime-workers.workers.dev. No backend or server-side personal progress store is introduced.
