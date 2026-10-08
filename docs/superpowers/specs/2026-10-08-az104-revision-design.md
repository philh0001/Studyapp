# AZ-104 Revision — product design

Date: 8 October 2026
Status: accepted for implementation planning on 8 October 2026, including the official Microsoft source requirement. Implementation plan review remains separate.

## Purpose and agreed constraints

Build a personal AZ-104 revision website for Philip, used mainly on a phone. The website and browser experience are primary, as with Showtime. Preparation is self-paced; the previously supplied 16 October exam date is cancelled. Start with no exam date and permit adding or clearing one later.

Success means completing short sessions, understanding mistakes, returning to saved work, and seeing what still needs study. Support comfortable one-handed interaction, large controls, and generous reading space. No missed-day penalties or compulsory streaks.

The uploaded product plan is the starting reference. This design narrows it to a first release and brings simple spaced repetition forward. Future certifications, accounts, AI tutoring, audio, flashcards, and lab tracking remain later work.

User requirement added during design review: all supplied exam facts, question answers, explanations, and learning material must be grounded in official Microsoft sources, preferably Microsoft Learn. Source traceability is a release requirement, not an optional enhancement.

## Architecture and alternatives

Recommended: React, TypeScript, Vite, IndexedDB through Dexie, and a PWA service worker. Separate deterministic study-engine functions from UI and persistence. Bundle versioned content independently of application components. Use Vitest for engine/storage tests and Playwright for critical browser journeys when the environment supports it.

Showtime was inspected read-only through GitHub and Cloudflare. Its web client uses Expo/React Native Web; its production website is served through a Cloudflare Static Assets Worker, with a separate API Worker and D1 for accounts. Reuse its web-first delivery approach, not its movie-specific code or account system. React DOM is recommended here because native distribution is outside the current scope.

Alternatives considered: Expo/React Native Web for closer implementation parity with Showtime adds native tooling this product does not currently need; a full-stack account-based app provides device sync but adds authentication, conflict handling, and server operations. Both can be reconsidered if requirements change.

Project location: `/workspace/az104-revision`. Use a separate repository and deployment identity. No Showtime resources are modified. First release needs no API, D1 database, Azure subscription, or runtime AI.

## First-release scope and screen map

Bottom navigation: Home, Practice, Review, Progress, Settings. Hide navigation distractions while answering. Notes and bookmarks are reached through Review and question feedback.

| Screen | Responsibilities |
| --- | --- |
| Home | Resume a session, recommended revision, Quick 10, weak areas; optional exam countdown only when configured |
| Practice | Choose Learn or Timed Practice, mixed or domain scope, and supported session size |
| Question | One question, answer options, confidence input, submit, progress; no highlighted clues |
| Feedback | Result, short explanation, detailed option explanations, source link, bookmark, note, explicit Next |
| Session summary | Correct count, review items, covered topics, and a suggested next session |
| Review | Due, incorrect, guessed/unsure, and bookmarked items; notes attached to questions |
| Progress | Domain/objective coverage and recent accuracy with sample sizes; confidence misconceptions |
| Settings | Optional exam date, theme, text size, advancement preference, backup/restore, delete local data |

Learn sessions offer 5, 10, or 20 unique questions. Topic selection initially supports domains; objective-specific filtering is supported when content exists. If fewer questions are available, show the available count before starting and offer that shorter session. Never duplicate questions to reach a requested size.

Timed Practice offers 20 or 40 questions when sufficient eligible content exists, plus a shorter available-bank option. Proposed defaults are 30 and 60 minutes respectively, editable before starting. These are app practice settings, not a replica of Microsoft's exam format or duration. Allow navigation, unanswered items, flags, resume, and submission confirmation. Reveal results only after submission. Score unanswered items as incorrect. At expiry, finalise and save once. Resuming after expiry shows saved results.

## Study experience and accessibility

1. Start or resume a session without account creation.
2. Answer a single-choice or explicit choose-N question. Selection uses stable option IDs, not shuffled positions.
3. Optionally record confident, unsure, or guessed before feedback. Store an omitted confidence value as unknown.
4. Submit; save the attempt and review update before enabling the next action.
5. Learn mode shows immediate feedback. Timed Practice hides correctness until final submission.
6. Read a short explanation, expand deeper detail, bookmark, or add a plain-text note.
7. Advance manually by default. Optional auto-advance waits a visible 20 seconds after feedback with Cancel and pauses when reading expanded detail or editing a note. Never auto-advance with a screen reader announcement in progress; if this cannot be detected reliably, use manual advancement with assistive technology.

Use at least 48 CSS pixel interactive targets, safe-area padding, visible focus, keyboard operation, semantic form controls, and readable contrast. Offer light/dark/system themes and text scaling. Do not rely on colour for correctness. No required animation, drag-and-drop, or hover. Test 320–430px layouts without horizontal scrolling and desktop layouts without excessively wide text.

## Content and blueprint policy

The official guide inspected on 8 October 2026 identifies the blueprint effective 17 April 2026. Store its source, effective date, last-checked date, domain weighting ranges, and stable objective identifiers. Treat this as a snapshot and check again before publishing a content pack or changing the user's target blueprint.

Reference: https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104

Each question must map to a specific objective. Author original scenarios and plausible distractors; include a concise explanation and an explanation for every option. Do not copy assessment questions, paid banks, or exam dumps. Do not imply Microsoft endorsement.

### Official Microsoft sources only

Use Microsoft Learn as the primary source for the syllabus, Azure behaviour, commands, limitations, and worked learning material. Another Microsoft-owned documentation page is permitted only where Learn lacks the required information; record why it is needed and verify its ownership. Exclude third-party banks, blogs, forum answers, and unsupported model memory as evidence for supplied learning content. User notes remain personal annotations and do not become verified learning material automatically.

Practice scenarios and their wording are original. Microsoft documentation supplies their technical basis. Every correct answer, explanation of an incorrect option, and supplied revision fact must cite evidence for the relevant claim; the objective tag or a generic Azure homepage is not sufficient. Explicitly state assumptions, licensing/SKU prerequisites, configuration conditions, and feature availability when they affect the answer. If official sources do not establish one unambiguous answer under those assumptions, revise or exclude the question.

Each answer option links to reference IDs, and the overall explanation has its own reference IDs. Source records include a canonical HTTPS URL, page title, relevant section anchor where available, date checked, document update date if available, and a short reviewer-authored evidence summary. Verify redirects end on approved Microsoft documentation hosts. A Microsoft-looking hostname or a link in an imported file alone does not establish source validity.

The content review sequence is: map the objective; retrieve official documentation; draft the original question; check the correct answer and every distractor against the documented assumptions; record citations and source-check dates; then complete the human review required for AI-assisted content. Never label an original practice question as an official Microsoft exam question.

Question feedback displays Sources with document titles, section links, and last-checked dates. When offline, explanations and recorded citations remain available, while opening Microsoft pages requires connectivity. A citation is evidence of the last review, not a guarantee that documentation can never change.

Check official sources again before releasing or replacing a pack. Display a freshness reminder when a pack has not been checked for 30 days; a reminder does not itself perform a source review. Confirmed changes that undermine an answer remove that revision from new normal sessions until corrected and reviewed. Preserve its attempt history and flag affected saved-session feedback. A temporary source outage marks the check as unavailable rather than proving the answer is wrong. Do not silently rewrite content or deploy automatic updates.

The ZIP contains a plan, not a question bank. Existing reviewed questions have not been supplied. Content is therefore a separate delivery dependency. Target a first pack of 50 original questions, 10 per domain, with visible objective gaps. This supports revision and short practice, not comprehensive syllabus coverage. Reserve 10 of those questions, two per domain, from normal learning for optional fresh assessment; explain that using them releases that holdout.

Use draft, reviewed, verified, and retired content states. Record original/user-created/AI-assisted provenance separately. AI-assisted questions remain draft until human review and cannot silently enter ordinary study. A draft preview is explicitly labelled and excluded from proficiency statistics. Technical checks against official sources are required before proposing draft questions for human review. Verified means the stated review process was completed, not proof of exam equivalence. Record the reviewer and review date.

If reviewed content is unavailable, show a clear empty state and a content-review preview. Never seed the normal question bank with fabricated verification metadata. Every question needs an official documentation reference supporting its answer; the blueprint link alone is insufficient.

## Content data contract

The implementation will use a JSON Schema with closed objects, bounded strings, unique identifiers, and semantic validation. Required question fields:

```text
id: stable string
revision: positive integer
certificationId: AZ-104
blueprintId: versioned blueprint identifier
domainId, objectiveId: existing blueprint identifiers
type: single | multiple
requiredSelections: integer, 1 for single; 2+ for multiple
difficulty: foundation | intermediate | advanced
scenario, prompt: plain text
options: 3–6 records { id, text, explanation, referenceIds }
correctOptionIds: unique list of existing option IDs
summaryExplanation: plain text
summaryReferenceIds: nonempty list of existing reference IDs
references: nonempty list { id, title, url, section, checkedAt,
  documentUpdatedAt, evidenceSummary, microsoftOwnershipVerified,
  fallbackReason }
provenance: original | user-created | ai-assisted
status: draft | reviewed | verified | retired
review: null or { reviewer, reviewedAt, method }
tags: list of strings
assessmentReserved: boolean
```

Correct-option count must equal requiredSelections and leave at least one distractor. Every option needs an explanation. Reviewed/verified content must have a review record. Imported AI-assisted content without a human-review record is forced to draft. URLs must use HTTPS; imported content cannot contain executable markup. Question IDs plus revisions are immutable content identities. Updates increment revision; retire old questions without deleting attempt history.

Every option must have nonempty referenceIds pointing to existing source records. documentUpdatedAt and section may be null when the publisher does not provide them. fallbackReason is null for Learn references and required for other approved official Microsoft documentation. Normal eligibility requires successful source validation and recorded Microsoft ownership verification; validation must not trust an imported ownership boolean without checking it. URL checks and evidence review serve different purposes: an approved hostname alone does not prove an explanation is supported. An unreviewed correction stays draft. Retired or invalidated revisions remain available for historical viewing only.

Core entities: local Profile, Settings, Blueprint, Domain, Objective, QuestionRevision, Session, Attempt, ReviewItem, Bookmark, Note, and ContentPack. A session contains ordered immutable question snapshots, shuffled option IDs, answers, flags, mode, timestamps, and a deadline for timed practice. An attempt stores its question snapshot, submitted option IDs, confidence, correctness, response time, mode, and submission time.

Notes and bookmarks belong to stable question IDs and carry their creation revision. Review state tracks the current revision and resets when a material correction changes the answer; historical attempts remain intact. Changed questions are labelled when revisited.

## Scoring, selection, and review rules

Scoring is exact set equality for selected and correct option IDs. No partial credit. Learn mode requires the stated number of choices to submit. Answer reordering never changes scoring. After submission, preserve the answer; repeat taps cannot create duplicate attempts.

Only reviewed/verified, active questions from the selected blueprint are eligible for normal sessions. Prefer unique items across the session. Recommended sessions aim for 40% weak-topic questions, 25% due review, 20% unseen, and 15% reinforcement. Allocate whole counts deterministically, deduplicate, and refill missing pools from remaining eligible questions. Domain practice applies its filter before selection. Avoid the last session's questions when enough alternatives exist. Wrong-confident items receive highest priority within due/weak pools. Timed sessions use blueprint-weighted sampling when the content bank permits, disclose shortfalls, and do not reveal weakness-based selection clues.

Initial repetition intervals: 1, 3, 7, 14, and 30 days. Incorrect answers reset the stage and become due next day; wrong-confident answers also receive a misconception label. Correct guessed/unsure answers stay at their current stage and are due next day. Correct confident answers advance one stage. Correct answers with unknown confidence stay at their stage and use its interval. New items start at stage zero. A new confident correct answer is due in 3 days. Timed results update review state only after finalisation. Retrying immediately in a manual wrong-answer session is permitted but does not advance spaced-repetition stage unless the scheduled review is due.

Store due timestamps in UTC; group due items by the user's local date. Pause does not create penalties. Recommended sessions include a manageable number of due items instead of requiring clearing a backlog.

## Progress and readiness

Display recent accuracy over the latest 50 scored attempts with the count, alongside coverage of distinct eligible questions and blueprint objectives. Draft previews are excluded. Separate Learn and Timed Practice metrics. Show an objective as insufficient evidence until at least five distinct questions have been attempted. Rank weak objectives by distinct-question accuracy and confidence mistakes; unknown objectives are uncovered, not weak. Show available content gaps separately from user learning gaps.

Do not infer a pass probability or translate app percentages into Microsoft's scaled score. A larger readiness model is deferred. Repeated familiar questions must not count as new coverage. Data from materially superseded question revisions is available in history but excluded from current proficiency.

## Persistence, offline behaviour, and recovery

IndexedDB is the source of truth for personal data. Persist an answer and its review-state change in one transaction, with idempotent attempt IDs. Restore unfinished sessions after refresh or reopening. A failed write keeps the answer visible and offers Retry; never claim it was saved.

Cache the application shell and installed question packs after a successful first load. The app works offline thereafter; external documentation remains online-only. Show offline status without blocking local study. Offer updates between sessions; do not reload a running assessment. Update content atomically after validation.

Local data belongs to one browser profile. It does not automatically sync between phones/computers, and browser data clearing can remove it. Explain this during first use and provide backup access in Settings.

Backup format: versioned JSON containing settings, installed content packs, sessions, attempts, reviews, bookmarks, and notes. Validate the entire file before replacing any data. Initial restore replaces local data after explicit confirmation; do not implement implicit merging. Create a recovery export before replacement. Limit imports to 10 MB and reject unknown future schema versions with an understandable message. Support forward migrations for supported older versions without dropping records. Cancelling restore leaves data unchanged.

## Privacy and security

No account, analytics tracking, public notes, or client secrets in release one. Personal data stays in the browser unless exported. Render notes/content as text; do not execute imported HTML. Provide confirmation before deleting all personal data. Keep host configuration separate from personal backups. Add appropriate HTTPS/security headers and validate imports. Do not request Azure credentials or deploy Azure resources.

A hosted URL is not automatically private. Static hosting can expose bundled question content; progress is still local. The release review must choose owner-private hosting or a public URL with that limitation understood. No purchased domain or paid service is needed to demonstrate the app.

## Delivery phases and acceptance

Phase 1: study engine, content contracts, persistence, mobile learning flow, and clearly labelled draft content review. Phase 2: approved content pack, review queue, progress, notes, timed practice, and backup/restore. Phase 3: offline installation, accessibility verification, and hosted preview. These are scope milestones, not the detailed implementation plan.

The first release is accepted when:

- A reviewed-content 10-question session works at phone width with single and multiple choice.
- Every answer has feedback covering all choices, without pre-answer clues.
- Every supplied question answer and learning explanation is supported by checked official Microsoft documentation, primarily Learn, with claim-level source references and visible dates.
- Unsupported or ambiguous items cannot enter normal study, and confirmed source corrections preserve history while removing affected revisions from new sessions.
- Confidence is collected before revealing results; unknown values are preserved.
- Save/resume works after browser reload, including timed-session deadlines.
- Incorrect and guessed/unsure answers become due according to the stated rules.
- Timed practice withholds all feedback until finalisation and scores once.
- Progress shows counts, content gaps, and coverage, without a pass guarantee.
- Bookmarks and notes persist, and backup/restore round-trips all supported records.
- Offline sessions work after initial caching and handle updates without losing work.
- Keyboard navigation, focus, touch targets, contrast, and phone layouts are checked.
- Type checking, relevant linting, unit/integration tests, and critical end-to-end flows pass.

Tests should exercise exact multi-select scoring, confidence scheduling, duplicate submissions, depleted pools, revision changes, transaction failures, restore rejection, offline reload, assessment expiry, reference integrity, non-Microsoft source rejection, and missing source-review metadata. Human/content review must establish that citations support the claims; automated URL checks cannot establish technical correctness. Document browser/device checks separately; desktop emulation does not prove physical iPhone installation.

## Release and review boundaries

Write and review this design before implementation planning. Detailed implementation planning follows written-design approval. No production deployment or paid resources without the user's release approval, as required by the uploaded plan. Prepare the working build and verification evidence before presenting that release decision.

Retain PROJECT_CONTEXT.md, ROADMAP.md, architecture notes, and verification records. The user subsequently selected the separate remote repository `philh0001/Studyapp`; initialise its empty default branch with planning documentation and do not push product feature work directly to main. Hosting identity and final URL are selected at release preparation rather than invented here.

Source checks completed: uploaded ZIP plan; Showtime README, AGENTS.md, production README, and frontend package metadata; Cloudflare account/Worker inventory; Microsoft AZ-104 study guide. No product code or hosted project has been created at the design stage.
