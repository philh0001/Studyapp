# Independent review of improvements 101–200

Review date: 8 October 2026. Baseline: `86670424886ac1242f6f1a592b101eb3cf432963`. Reviewed the working tree in the isolated `az104` checkout, including untracked feature files, after the evidence implementer reported stability. This review did not merge, deploy, run the full suite, or run browsers.

## Assessment

No remaining Critical or Important code findings were identified in the reviewed state. The review covers the six feature groups, their application integration, backup handling, assessment secrecy, reserve handling, persistence, source provenance, exports, and lazy-route/PWA configuration. Release acceptance still requires the coordinator's full checks, browser runs and deployment verification. This is not human factual approval of learning content or physical-device acceptance.

## Findings resolved during review

1. **Important — history counted skipped questions as answered.** In `src/features/reports/model.ts`, every assessment attempt was initially counted as an answer, although final submission deliberately creates empty-selection attempts for skipped questions. Reproduction: submit a one-question assessment without selecting anything; the initial implementation reported 1/1 answered and one format exposure. The revised implementation uses `canSubmit` for answered/exposure/eligible-attempt counts. Direct execution now reports 0/1 answered and zero exposures; the focused reports regression tests pass.
2. **Important — earlier workpads remained available for an active assessment's question.** A previous session could expose its personal reflection while a newer revision of the same question was in an active assessment. `src/app/App.tsx` now hides the earlier session and its workpad by stable question ID while the assessment remains active. The regression in `tests/ui/second100-session-privacy.test.tsx` verifies both withholding across revisions and reopening after the active assessment is removed.
3. **Requirement 133 — five questions did not provide a five-minute option.** Journey initially offered only a five-question link. It now also offers an explicitly optional five-minute draft-practice link, with the timer and duration wired through Practice. The manual five-question path remains available.
4. **Integration correction — malformed workspace collection.** The evidence component's adversarial test supplied a non-array workspace collection. Shared `workspaceValue` now guards with `Array.isArray`; normal backup validation already rejects that collection shape. The focused evidence tests pass.

## Verification performed by this reviewer

- Initial focused run: 12 files, 58 tests passed across reports, workpads, journey, explorer, maintenance, write tracking, route recovery and asset measurement.
- Intermediate correction run: 5 files, 21 tests passed across reports, prior-session privacy, exam and navigation.
- Final focused run after evidence stability and integration corrections: 13 files, 55 tests passed across evidence health, reports, journey, workpads, prior-session privacy, write tracking, exam and navigation. These runs overlap; the counts are not additive.
- `git diff --check` passed for the tracked diff reviewed.
- At 04:46:13 UTC, independently checked all 154 baseline source records against the retained HTML artifacts: raw SHA-256 hashes matched, saved sections matched sections freshly extracted from those artifacts, and every stored section hash matched its text.
- Independently checked all 1,107 option-quotation records across 315 question revisions and 1,050 options: HTML hashes, section hashes, excerpt hashes, exact excerpt membership in both section text and normalized retrieved HTML, and question/revision/option bindings all matched. Nine previous exact-excerpt gaps are closed. No provenance mismatch was found.

The source checks establish retrieval and quotation integrity. They do not establish semantic entailment, resolve every factual concern, or grant human approval; the shipped content and UI preserve that distinction.

## Coverage and release evidence still owned by the coordinator

Implementation and focused verification exist for evidence health (101–115), self-paced planning (116–135), explorer records and cited printing (136–150), revision-specific workpads (151–170), filtered historical reports (171–185), diagnostics and lazy routes (186–198). CSV formula defusing, active-assessment withholding across revisions, malformed restored feature values, metadata-only diagnostics, and workpad save-failure retention were specifically inspected.

For 199, `scripts/measure-route-assets.mjs` correctly labels its static import graph and local gzip result as estimates rather than measured HTTP transfer. Actual initial-route transfer evidence must be supplied by the coordinator's browser/live checks. For 200, offline lazy-route and small-screen browser tests are implemented, but this reviewer did not execute them. The coordinator must record their actual results in the delivery ledger/release verification. No physical iPhone, VoiceOver, human factual-review or deployment result is asserted here.

## Follow-up review: preference and backup races

At the coordinator's request, independently reviewed the subsequent Settings, BackupPanel, backup replacement and global navigation changes. No remaining Critical or Important finding was identified after the corrections below.

- The preference editor now serializes complete-state writes, keeps the latest optimistic value in a ref, ignores older snapshots while saves are pending, retains failed edits, and registers writes with the application navigation guard. A retry regression initially failed during this review: changing the failure state back to success reapplied an unchanged stale settings prop. The corrected effect observes actual settings-prop changes and uses a failure ref; the regression now passes.
- **Important, resolved — stale recovery copies.** Recovery was initially captured at import inspection, so editing preferences afterward and then downloading that recovery could omit the newest saved state. Recovery is now captured at download time. Replacement compares exact canonical contents of every backup table against the downloaded recovery state, inside the same all-table write transaction and before any clear. A mismatch preserves local data and requires a fresh recovery download. The comparison includes comfort workspace records, packs and source records; it does not reuse the lossy reminder fingerprint.
- Settings and their nested controls are disabled while a local data operation runs, preventing a newly queued preference save from overwriting restored values. Hash navigation and unload protection also account for the data operation. Before backup operations, the application waits for already queued writes and rejects the operation if a write remains failed.

Follow-up verification: 5 focused files / 28 tests passed for Settings, BackupPanel, restore, write tracking and navigation. A further 3 focused files / 10 tests passed, including the new canonical-recovery and atomic stale-recovery rejection tests plus Settings and BackupPanel. Counts overlap. No browser or full-suite result is claimed by this follow-up review.

## Follow-up review: durable answer status before reload

Reviewed the later `QuestionView` persistence-status change and the matching-answer browser test correction. Each edit immediately announces that saving is pending, writes remain serialized, and the per-edit version prevents completion of an older write from announcing that a newer selection is saved. The saved message appears after the current draft's persistence promise resolves. Failure retains the selected values and announces that retry is needed. No Critical finding was identified in this change.

The browser test now waits for this durable-save indication before deliberately reloading and checks every matching selection after reload, rather than only the first selection. This reviewer inspected that test change without running browsers. Focused save-status, exam and navigation verification passed: 3 files / 9 tests. `git diff --check` also passed. The coordinator owns the subsequent complete browser and release results.
