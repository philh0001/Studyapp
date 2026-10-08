# Concise course reader release

Scope authorised by the owner: in-app reading and listening for the linked Microsoft Learn AZ-104T00 course, unnecessary introductions/promotional repetition removed, personal note editors collapsed, spoken text highlighted and direct Learn access in the main navigation. Existing draft publication/improvement authorisation remains applicable; no new approval gate was requested.

## Delivered behaviour

- Six official learning paths, 28 modules and 231 unit links in published order; 847 independently authored concise points, with supporting original lesson links. Teaching, exercises and short overviews remain available offline after installation. The 24 official assessment units remain external interactive links, without copied question banks.
- Lazy `/course` reader from Learn in the six-item bottom navigation, Home and Learning Center. Lesson selection, manual completion and previous/next navigation retain saved progress. Manual lesson changes bring the new heading into view.
- Explicit module/course playback, short mobile speech passages, pause/resume/stop, voice/speed choice and saved listening cursor. Cancellation rejects stale/duplicate speech callbacks. Pause resumes the current short passage.
- Exact passage highlighting, word highlighting when a voice supplies word boundaries, optional text following and compact controls above the bottom navigation. Word highlighting is transient and never generates per-word database writes. At unusually large phone text sizes, controls use a two-column grid and short arrow labels to preserve room for the spoken text.
- Personal notes and reasoning workpads use closed native details elements. Existing data/autosaves/bookmarks remain available; nothing requires the owner to use those editors.

## Source evidence and review

All 231 official unit pages retrieved successfully; URLs, individual check times, order and source HTML SHA-256 hashes recorded in `content/course/source-evidence.json`. Raw Microsoft source text is not redistributed. Some source wording is dated/inconsistent; the omissions and limits are described in `content/course/README.md`. Condensed course coverage does not assert exhaustive exam coverage or human factual approval.

Fresh independent review covered reader/state/speech, collapsed notes, representative substantive facts across all six paths and actual Chromium geometry at 320×568, 320×640, 390×844 and 430×932. No important unsupported assertion or remaining defect was found in that sampled review; it was not exhaustive factual approval.

## Verification record

Focused regression cycles exercised missing reader state/content, pause/stale callbacks, original-text highlight offsets, word fallback/clearing, serialized cursor-plus-selection writes, failed-save retry/navigation guard and backup/restore. A phone navigation test first reproduced the next-lesson heading outside the viewport; manual selection now focuses/scrolls to it. A large-text browser test reproduced playback controls covering the spoken word; compact grid controls and geometry-based following correct this. The keyboard acceptance test was corrected to target an enabled control: ordering questions intentionally disable their first Move up button.

Final complete check, browser acceptance, deployed identities and live verification are recorded below when those operations finish. Desktop/phone browser emulation and mock speech events validate UI/state, not real audio, actual voice timing, physical iPhone installation or locked-screen playback. Voice availability/offline speech depend on the device; no backend or paid speech service is configured.

## Exhaustive content accuracy audit

Independent AI-assisted semantic source reviews covered all 847 course points (231 units), all 315 practice questions (1,050 options), and all 212 study-aid claims/instructions/excerpts/reading links. The audit corrected 67 course points and 14 study-aid fields. One question now explicitly specifies default Provider what-if validation, with ProviderNoRbac distinguished in its explanation; its old revision remains preserved. Each shipped teaching point and question is hash-bound to its accuracy record. Exact retained option citations bind to current revisions, text and claims; regeneration retains fresh semantic reviews only for unchanged question hashes. Additional current official product sources appear in the reader. These are AI-assisted technical source checks, not Microsoft endorsement or human approval. All installed items were covered; future Microsoft changes can still require updates.

The official blueprint recheck found no differences: effective 17 April 2026, 82 subskills. The independent integration review also verified coverage/hash bindings and caught the stale revision citations and regeneration loss; both were repaired before release.

## Final local verification

`npm run check` passed TypeScript, ESLint, all **452 tests across 91 files**, all seven question-pack validations and the production/PWA build. The actual audit-regeneration CLI separately retained 315 current semantic reviews, zero semantic concerns and zero exact-citation gaps. Complete browser results and live deployment checks follow below.

The final production build passed the complete desktop Chromium, phone Chromium and phone WebKit acceptance suite: **121 passed, 2 intentional duplicate-engine skips**, 2.1 minutes. All course checks passed in each engine, including 320px phone navigation, offline reopening and large-text highlighting/control geometry.
