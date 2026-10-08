# Next 100: comfort, device reporting and bundle verification

Recorded 2026-10-08. This document describes automated support and a checklist for actual device testing. It does **not** record a physical iPhone installation, OS lock/force-close test, VoiceOver execution, or human factual approval.

The Settings report has ten explicit user-assertion checks: installation, offline completion, lock/resume, storage persistence, backup/recovery, cross-browser restore, screen reader, large text, touch/layout, and performance. Device model, OS/version, browser/version and test date start empty. Each check starts **Not tested**, supports **Passed** and **Failed**, stores its recording date and notes, and labels its author as the user. Failure results do not count as passes. The report is portable in the local progress backup; earlier checklist assertions migrate without inventing device metadata. Malformed imported typed records are discarded safely.

Perform these checks yourself on the intended phone, recording the actual device/version/date and any failure details in Settings. In particular, use actual VoiceOver on iOS for a complete session and backup controls, disable Wi-Fi **and** mobile data, and verify reopened history after actual OS termination. Desktop WebKit and phone viewport automation cannot establish those results.

Automated acceptance is authored in `tests/e2e/next-100.spec.ts`: ten cases scheduled across desktop Chromium, phone-sized Chromium and phone-sized WebKit. The explicit Chromium-to-WebKit backup transfer runs only in the desktop Chromium project, producing two intentional project skips. Root owns the shared preview server and records the final browser execution result. The cases cover exact asset-inventory cache inspection, deleted teaching chunk rejection, new feature routes offline, user-entered device assertions and failure preservation, manual five-question configuration, draft speech exclusion, durable reading position, simulated visibility interruption/page close and reopen, deadline expiry after simulated interruption, full offline completion, enlarged 320/430 px settings controls, and cross-engine backup inspection/recovery/restore. Simulated visibility and page closure are limited substitutes for OS-level behavior.

Focused unit/component verification: `npm test -- tests/comfort tests/ui/backup.test.tsx` passed **32 tests in 3 files** on 2026-10-08 (29 new comfort tests plus 3 existing backup tests). This includes a real IndexedDB v1-to-v2 upgrade, old schema-1 backup without workspace, imported approval quarantine, speech availability/eligibility/controls/cancellation, actual durable answer and edited-note backup reminders, malformed valid-backup comfort/device values, immediate restored-device rendering, and preservation of an existing assessment deadline during manual pause. Owned ESLint checks pass. Whole-app checks and browser results belong to the root release record.

Offline completeness uses `offline-assets.json`, emitted at build time, to check every emitted JavaScript/CSS file plus index, manifest and all three icons. It also checks named app/bank/study-data/validator/vendor/style/manifest/icon categories. Completion requires a controlling service worker. PWA precaches the inventory and all matching emitted assets; the cache limit is 8 MiB per asset. Microsoft Learn pages and device speech availability remain separate connectivity/device capabilities.

Isolated builds of the same then-current source used Vite 8.3.3/Rolldown with and without the configured groups. Raw bytes and Node `gzipSync` default compression were measured from the actual output files:

| Output | Raw bytes | Gzip bytes |
| --- | ---: | ---: |
| Unsplit JavaScript | 3,679,681 | 517,757 |
| Split application | 224,068 | 60,136 |
| Question bank | 893,120 | 141,036 |
| Study/evidence data | 1,909,105 | 190,364 |
| Validators | 332,851 | 21,971 |
| Vendor | 320,039 | 100,038 |
| Rolldown runtime | 716 | 428 |
| All split JavaScript | 3,679,899 | 513,973 |

The split build had 18 precache entries; all 13 generated inventory files were present, with zero missing. App-only JavaScript became smaller, but total raw JavaScript increased by 218 bytes and the imports remain eager. This is separation/caching evidence, **not** a measured first-load speed improvement. Bank and study-data chunks still exceed Vite’s 500 kB advisory threshold. Exact machine-readable output: `.superpowers/sdd/2026-10-08-next-100/task-7-bundle-sizes.json`. Isolated output directories were under `/tmp`; no server, deployment or paid resource was created by this task.
