# Concise course reader implementation plan

> **For agentic workers:** Use superpowers:executing-plans; independent source collection and speech implementation run in parallel as requested by the owner.

**Goal:** Read and listen to concise notes covering the official AZ-104T00 course inside Studyapp.

**Architecture:** Bundle ordered course paths, modules and cited lessons separately from React. Persist reader state through the existing workspace store; a standalone speech queue handles browser playback and cancellation. The root integrates a lazy reader route into Home and Learning Center.

**Tech Stack:** Existing React 19, TypeScript 6, Vite 8, Dexie 4, Vitest and Playwright; browser SpeechSynthesis; existing Cloudflare Static Assets Worker.

**Spec:** `docs/superpowers/specs/2026-10-08-course-reader.md`

## Global constraints

- Official Microsoft sources only; original concise notes, not copied assessment questions.
- No accounts, runtime AI, paid resources or backend.
- Phone-first, offline after installation, progress included in backup/restore.
- No autoplay; cancel speech when leaving/changing the queue.
- Existing feature branch and authorised Studyapp Worker only; preserve practice data.

## Review focus

- Malformed/restored positions must resolve to a real lesson and bounded chunk.
- Speech cancellation must reject old callbacks and never continue a replaced queue.
- Unsupported speech must leave the full text reader usable.
- Module/course navigation must persist the actual reading/listening lesson without racing writes.
- Source collection must cover the actual published syllabus without fabricated lessons or assessment copying.

### Task 1: Ordered, concise official course pack

**Files:** `content/course/az104-course.json`, `content/course/source-evidence.json`, `src/features/course/types.ts`, `tests/unit/course-content.test.ts`.

**Interfaces:** Course `{id,title,url,checkedAt,paths:[{id,title,url,modules:[{id,title,url,lessons:[{id,title,url,kind,points:string[]}]}]}]}`. Lesson kind is `teaching|exercise|knowledge-check|summary`; points contain concise original teaching prose grounded in the corresponding retrieved unit.

- [x] Retrieve the current six official paths, module order and unit links with bounded requests; record source hashes/check dates.
- [x] Write coverage/source validation tests and observe failure before the pack exists.
- [x] Author concise notes from the retrieved teaching units; keep interactive assessments as official links without their questions.
- [x] Run `npx vitest run tests/unit/course-content.test.ts`; expect every path/module and source validation assertion to pass.

### Task 2: Safe read-aloud queue

**Files:** `src/features/course/speech.ts`, `CourseSpeech.tsx`, `tests/unit/course-speech.test.tsx`.

**Interfaces:** `CourseSpeech({sections:[{id,title,text}],initialPosition?:{sectionId,chunk},rate,voiceURI,onPreferences,onPosition,onSection?})`. Parent owns persistence; child owns speech lifecycle.

- [x] Write failing tests for bounded chunks, pause/resume/stop, stale callbacks after queue replacement and unsupported speech.
- [x] Implement browser voice/rate selection, explicit start, section navigation and chunk queue; cancel on unmount.
- [x] Run the focused speech tests; expect all to pass without real audio claims.

### Task 3: Phone reader and persistent progress

**Files:** `src/features/course/state.ts`, `CourseReader.tsx`, `course.css`, `src/app/App.tsx`, `src/features/learning/LearningCenter.tsx`, `tests/unit/course-state.test.ts`, `tests/e2e/course.spec.ts`.

**Interfaces:** `CourseReader({repository:StudyRepository,snapshot:DatabaseSnapshot,onSaveQueued:(write:Promise<void>)=>Promise<void>})`; workspace key `course:reader`. Normalise IDs against the pack, deduplicate completion, bound rate/chunk/voice. Serialize optimistic writes so speech cursor updates cannot overwrite reading/completion changes.

- [x] Write failing state tests for malformed and restored positions/preferences, then implement normalisation.
- [x] Build the `/course` route, path/module/lesson selection, concise notes and secondary source links, completion and previous/next navigation, module/course listening.
- [x] Add Home/Learning Center entry and wire the write tracker to block navigation after failed saves.
- [x] Incorporate owner steering: closed-by-default personal editors; exact text ranges for spoken passage/word highlighting, optional following and fixed active controls. Verify stale boundaries, range clipping, pause retention and stop clearing with focused tests and mocked browser speech events.
- [x] Run focused unit/browser checks for navigation, persisted completion, unsupported speech and offline reload; expect pass.

### Task 4: Review and release

**Files:** project context, roadmap, architecture and dated release records.

- [x] Owner's additional accuracy requirement: point-by-point audit all 847 course points, 315 questions/1,050 options and existing study aids. Correct stale or overbroad wording, preserve prior question revisions, bind final content to audit hashes, attach current corroborating official course sources, and recheck the official blueprint.

- [x] Fresh independent review; fix important findings with regression tests.
- [x] Run `npm run check` and full browser acceptance; record actual results.
- [x] Deploy to the existing authorised Worker, verify deployed hashes/CSP and live phone-sized course navigation.
- [x] Push feature branch/update PR #1; report concise feature benefits and truthful playback/device limitations.
