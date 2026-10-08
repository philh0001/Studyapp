# Fuller course teaching — 8 October 2026 (Europe/London)

The reader previously supplied 847 short key points (~14,311 words). It now retains those points and adds 35,064 words across 413 independently authored teaching sections in every one of the 151 teaching/exercise units: ~49,375 study words overall (3.45× the former body). All six paths, 28 modules and 231 units remain ordered as in the retrieved official AZ-104T00 course. Introductions, summaries and check pages remain short.

Expanded sections are visible immediately after key points. They explain prerequisites, service choices, constraints, worked scenarios and practical checks; five illustrative command examples are included. The app executes no commands or Azure operations. Original-unit links remain near the lesson heading; supporting Microsoft documentation remains available in its disclosure. Existing six-question module assessments, collapsed personal notes, completion and scores are preserved.

The shared lessonReading helper builds the visible and spoken blocks in one order, with exact offsets for paragraphs, headings, steps and code. The original title/key-point prefix remains intact so previously saved speech chunk indices still refer to their original text. Expanded content is included in module/whole-course reading, compatible voice highlighting, and the offline PWA bundle.

## Actual source comparison

Author comparisons and independent reviewers checked every added section against retained official teaching text and current Microsoft product documentation. The three independent records cover 151 units/413 sections and bind each final section with SHA-256 in content/course/expanded/accuracy-review.json. Five resolved corrections cover three NSG/security-admin qualifications, snapshot retention and App Service linked-database backup configuration changes. No unresolved findings remain. These checks are AI-assisted semantic comparisons, not human approval or Microsoft endorsement. Raw source prose is not bundled; source coverage does not claim literal reproduction of all source text, diagrams or labs.

## Verification and release

Final measured check results and deployment identities are appended after verification. Browser speech tests simulate event delivery; they prove queue/highlight behavior, not real voice quality or physical iPhone playback.

TypeScript and ESLint passed; all 475 unit/integration tests in 96 files passed and all eight practice packs passed content validation. Production build passed. Full browser acceptance on desktop Chromium, phone Chromium and phone WebKit: 127 passed, two intentional skips. Expanded lesson tests cover visible teaching/steps/code, exact Unicode and code offsets, unchanged saved speech prefixes, spoken paragraph/command highlighting, offline expanded text, 320px layout and accessible playback controls. The first red content audit check was rerun after independent review records were completed and passed.

After final source corrections and coverage-copy updates, the rebuilt artifact passed all nine focused course browser flows across the three engines. Its PWA precache contains 44 entries (~8.38 MiB), including 42 public files; larger teaching content increases the initial offline download while course code/data remain lazy on the Home route.

Published and verified at https://az104-revision-web.showtime-workers.workers.dev/#/course. Product source: `81d73da40dcdd28e968a74a38137222a9999cae7`. Cloudflare Worker version: `8f22b828-c3d3-484b-94f5-a7ec69bc0d19`; actual deployment: `6f01519c-df24-4433-b7c7-3d330336aa30`, created 8 October 2026 12:59:21 Europe/London (11:59:21 UTC), serving 100%.

All 42 public files matched local build SHA-256 hashes; strict CSP and nosniff checks passed. Live phone-sized Chromium verified all six paths/28 modules/231 units and every expanded paragraph across all 151 units/413 sections, saved completion, service-worker-controlled offline reopening, expanded passage/word highlighting with simulated speech events, pause/stop, closed workpad and immediate practice. Zero browser errors. Companion deployment/live JSON records contain measured evidence. Main remains unmerged; PR #1 contains the feature branch.
