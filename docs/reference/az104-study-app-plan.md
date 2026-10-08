# AZ-104 Study App — Product and Implementation Plan

## Project summary

Build a mobile-first study application focused initially on Microsoft AZ-104, with an architecture that can later support additional certifications.

The application should help users prepare through:

- Original scenario-based questions
- Detailed option-by-option explanations
- Adaptive weak-area revision
- Confidence tracking
- Progress analytics
- Exam countdown and study planning
- Hands-on lab tracking
- Offline-first study
- Optional audio review

The app is initially for personal study.

**Current certification target:** Microsoft AZ-104  
**Exam date:** 16 October 2026  
**Preferred learning style:** scenario-led, visual, hands-on, short explanations followed by practical application

Official study-guide reference:

- [Microsoft AZ-104 Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104)

---

# 1. Product purpose

## Problem to solve

The app should help users prepare for AZ-104 through original, realistic questions, adaptive revision, practical lab reminders, progress tracking, and clear explanations.

The application should not behave like a generic quiz bank. It should help the user understand:

- Why the correct answer is correct
- Why every incorrect option is wrong
- Which Azure services are being confused
- Which exam objectives need further work
- Which practical labs would reinforce the topic
- Whether the user answered confidently, guessed, or misunderstood the concept

## Core product statement

> Help me prepare for AZ-104 through original scenario-based questions, adaptive revision, progress tracking, hands-on lab reminders, and clear explanations of every answer.

## MVP success criteria

The MVP should allow a user to:

- Complete a short study session on mobile or desktop
- Receive clear feedback after every answer
- Understand why every option is right or wrong
- Automatically continue to the next question
- Identify weak objectives
- Review previously incorrect answers
- See progress towards an exam date
- Continue studying offline
- Retain progress between sessions
- Export and restore study data

---

# 2. Scope: AZ-104 first, reusable later

The app should be designed around this hierarchy:

```text
Study application
    ↓
Certification
    ↓
Exam blueprint version
    ↓
Domain
    ↓
Objective
    ↓
Questions, labs, notes and progress
```

AZ-104 should be the first certification, but the architecture should allow future additions such as:

- SC-200
- Network+
- Security+
- Other Microsoft certifications

Do not hard-code the app so tightly to AZ-104 that adding another certification requires rebuilding the product.

The certification blueprint should be editable and versioned because exam objectives change over time.

---

# 3. AZ-104 domain structure

The app should support the current major AZ-104 skill areas:

- Manage Azure identities and governance
- Implement and manage storage
- Deploy and manage Azure compute resources
- Implement and manage virtual networking
- Monitor and maintain Azure resources

The content structure should allow domains to contain individual objectives and sub-objectives.

Each question, note, lab, and flashcard should be tagged to the most specific objective possible.

---

# 4. Core study modes

| Mode | Purpose |
|---|---|
| Today’s Study | Automatically creates a session from weak, overdue, unseen, and recently missed topics |
| Quick 10 | A short ten-question session |
| Topic Practice | Study one selected domain or objective |
| Weak Areas | Focus on the lowest-performing objectives |
| Wrong Answers | Retest previously missed questions |
| Exam Mode | Timed assessment with feedback only after submission |
| Hands-on Review | Review practical labs, commands, and troubleshooting steps |
| Audio Review | Read questions, options, explanations, and flashcards aloud |
| Bookmarks | Revisit saved questions, notes, and concepts |

## Default home-screen priorities

```text
Today’s recommended session
Exam countdown
Weakest three areas
Current progress and recent trend
Resume last session
Quick 10
Upcoming reviews
```

---

# 5. Question engine

The question engine is one of the most important parts of the product.

## Question data fields

Each question should support:

```text
Question ID
Certification
Blueprint version
Domain
Objective
Sub-objective
Difficulty
Question type
Scenario
Question text
Answer options
Correct answer or answers
Explanation of correct answer
Explanation of every incorrect option
Source/reference
Verification status
Provenance
Last reviewed date
Tags
Estimated time
```

## Question types

Start with:

- Single-choice
- Multiple-select
- Scenario-based troubleshooting
- “What should you configure?”
- “What should you do first?”
- Architecture/service selection
- Command interpretation
- Configuration interpretation

Possible later additions:

- Ordering steps
- Matching items
- Case studies
- Command completion
- Drag-and-drop style relationships
- Multi-stage scenarios

## Behaviour requirements

- Do not highlight clue words before the answer is submitted.
- Use realistic Azure scenarios and plausible distractors.
- Do not reuse Microsoft Learn practice questions verbatim.
- Do not copy paid question banks.
- After submission, explain why the correct answer is correct.
- Explain why every incorrect option is wrong.
- If the user was wrong, compare their selected answer directly with the correct one.
- Automatically move to the next question after feedback, unless auto-advance is disabled.
- Randomise answer order where appropriate.
- Avoid repeating the same question too frequently.
- Support “choose two” and “choose three”.
- Enforce the correct number of selected options before submission.
- Preserve attempt history even if question content is edited later.

---

# 6. Original content and copyright rules

The app may use:

- Official exam objectives
- Microsoft documentation links
- Original questions
- User-created questions
- AI-assisted questions that have been reviewed
- Personal AZ-104 lab notes
- Personal explanations
- Domain-level practice scores
- Hands-on project evidence

The app must not copy:

- Microsoft Learn assessment questions
- Paid practice-test questions
- Course question banks
- Copyrighted explanations
- Dumps or leaked exam content

## Question provenance

Every question should include a provenance value such as:

```text
Original
User-created
AI-assisted, human reviewed
Imported note
Official objective reference
```

## Verification status

```text
Draft
Reviewed
Verified
Retired
```

AI-generated questions should not enter normal study sessions until they are reviewed or verified.

---

# 7. Adaptive learning

The app should not simply choose random questions.

Each objective should track:

- Total attempts
- Correct answers
- Recent accuracy
- Lifetime accuracy
- Average response time
- Confidence
- Last studied date
- Next review date
- Consecutive correct answers
- Consecutive incorrect answers
- Questions repeatedly missed
- Confused service pairs
- Number of unseen questions remaining

## Suggested question-selection mix

```text
40% weak topics
25% overdue questions
20% unseen questions
15% mixed reinforcement
```

These percentages should be configurable.

## Priority logic

A study session should prioritise:

1. Overdue spaced-repetition items
2. Weak objectives
3. Recently incorrect questions
4. Correct answers marked “guessed”
5. Wrong answers marked “confident”
6. Unseen questions
7. A small number of strong-topic questions for reinforcement

---

# 8. Confidence tracking

After answering, allow the user to record:

```text
Confident
Unsure
Guessed
```

Interpretation:

```text
Correct + confident = likely understood
Correct + guessed = needs review
Wrong + confident = misconception
Wrong + unsure = knowledge gap
```

The app should prioritise wrong-but-confident answers because they may represent a false understanding rather than missing knowledge.

---

# 9. Error categorisation

Allow the user to classify why an answer was wrong:

- Did not know the concept
- Confused two Azure services
- Misread the requirement
- Missed “choose two”
- Changed from the correct answer
- Did not understand the terminology
- Guessed
- Calculation mistake
- Command/syntax confusion
- Overthought the question

This should feed the analytics dashboard and study recommendations.

---

# 10. Study planner

The planner should consider:

- Exam date
- Available study days
- Preferred study days
- Preferred session duration
- Domain weight
- Current proficiency
- Overdue revision
- Planned mock exams
- Hands-on lab requirements
- Missed study days

## Initial personal settings

```text
Certification: AZ-104
Exam date: 16 October 2026
Daily target: 30–60 minutes
Preferred learning: realistic scenarios, visual explanations, practical labs
```

The app should create a flexible study plan.

If a day is missed, it should redistribute the work rather than punish the user or break the plan.

---

# 11. Progress dashboard

The dashboard should show useful learning information rather than vanity statistics.

Include:

- Overall accuracy
- Accuracy by domain
- Accuracy by objective
- Recent performance trend
- Weakest objectives
- Strongest objectives
- Questions due for review
- Time studied
- Average response time
- Exam-mode results
- Confidence versus accuracy
- Mistake categories
- Labs completed
- Questions reviewed
- Flashcards due
- Study consistency

## Readiness indicator

Use a cautious readiness status such as:

```text
Not enough data
Foundation building
Improving
Assessment-ready
Consistently strong
```

Do not present the readiness score as a guarantee of passing.

---

# 12. Hands-on lab integration

The lab tracker should distinguish the app from a generic quiz application.

Possible AZ-104 labs:

```text
Create an NSG
Configure a route table
Use Network Watcher Next Hop
Review Effective Routes
Create a private DNS zone
Configure VNet peering
Create a Private Endpoint
Deploy Bicep with what-if
Query AzureActivity with KQL
Create a backup policy
Configure an Action Group
Test managed identity access
```

## Lab fields

Each lab should support:

```text
Lab ID
Certification
Domain
Objective
Title
Scenario
Purpose
Instructions
Prerequisites
Estimated time
Estimated cost
Cleanup required
Status
Date started
Date completed
Notes
Evidence screenshot
GitHub link
Reflection
What I learned
Verification result
Limitations
```

The app may link to the existing AZ-104 GitHub repository as supporting evidence.

The app must not automatically deploy Azure resources.

---

# 13. Notes and flashcards

Users should be able to:

- Add a note to a question
- Add a note to an objective
- Create a flashcard from an explanation
- Bookmark difficult concepts
- Save commands and examples
- Tag notes by objective
- Search all notes
- Export notes
- Link a note to a lab
- Link a flashcard to a question

## Flashcard fields

```text
Front
Back
Certification
Domain
Objective
Difficulty
Source
Created date
Last reviewed
Next review
Review history
```

---

# 14. Audio and walking mode

This is particularly useful for mobile study.

Include:

- Text-to-speech
- Play/pause
- Repeat question
- Read answer options aloud
- Read explanation after answering
- Large answer controls
- Minimal visual clutter
- Optional automatic next question
- Playback speed
- Skip explanation
- Repeat incorrect option explanation
- Screen-lock-friendly audio where technically possible

Describe this as audio review mode rather than an interaction-heavy driving mode.

---

# 15. Accessibility and dyslexia-friendly design

Accessibility should be a first-class requirement.

Include:

- Adjustable font size
- Generous line spacing
- Short paragraphs
- High contrast
- Dark mode
- Reduced visual clutter
- No unnecessary animations
- Text-to-speech
- Keyboard navigation
- Visible focus states
- Large mobile tap targets
- Reduced-motion mode
- No colour-only indicators
- Clear separation between question and answer choices
- Optional readable font choices
- Consistent button placement
- Progress without visual overload

Do not bold or colour keywords in a way that accidentally reveals the correct answer.

---

# 16. Main screens

## Home

Include:

- Exam countdown
- Today’s recommended study
- Resume session
- Weak areas
- Recent performance
- Study streak
- Quick 10
- Upcoming reviews
- Recent lab progress

## Study session

Include:

- Session progress
- Question
- Answer choices
- Confidence selector
- Submit
- Correct/incorrect result
- Explanation for every option
- Bookmark
- Add note
- Create flashcard
- Next question
- Auto-advance toggle

## Exam mode

Include:

- Timer
- Question navigation
- Flag for review
- No immediate feedback
- Unanswered-question warning
- Submit confirmation
- Results by domain
- Results by objective
- Review of incorrect answers
- Time-per-question analysis

## Weak areas

Include:

- Ranked objectives
- Accuracy
- Confidence
- Last studied
- Number due for review
- Start focused session

## Topic explorer

Include:

- Domains
- Objectives
- Notes
- Questions
- Labs
- Completion
- Proficiency

## Planner

Include:

- Calendar
- Daily target
- Planned sessions
- Mock-exam dates
- Lab sessions
- Missed-day adjustment

## Progress

Include:

- Domain performance
- Objective performance
- Trend
- Confidence versus accuracy
- Error categories
- Question history
- Exam results
- Lab completion
- Study time

## Content editor

Include:

- Create question
- Edit question
- Retire question
- Import/export
- Review AI-assisted questions
- Source/reference tracking
- Duplicate detection
- Verification workflow

## Settings

Include:

- Exam date
- Session length
- Accessibility
- Audio
- Auto-advance
- Sync
- Export/delete data
- Notification preferences
- Theme

---

# 17. Data model

Design the schema before building the UI.

## Core entities

```text
User
Certification
BlueprintVersion
Domain
Objective
Question
AnswerOption
QuestionAttempt
StudySession
StudyPlan
Flashcard
FlashcardReview
Note
Bookmark
Lab
LabProgress
ExamAttempt
ContentSource
UserSettings
```

## Relationships

```text
Certification
  -> BlueprintVersion
     -> Domain
        -> Objective
           -> Questions
           -> Labs
           -> Notes
           -> Flashcards
```

Store question-attempt history separately from the current question content.

Editing a question must not corrupt older result history.

---

# 18. Offline and synchronisation

## MVP

- No account required
- Local-first
- Works offline
- IndexedDB or equivalent local database
- Export/import backup file
- Progress retained after closing the browser
- Installable PWA

## Later phase

- Optional account
- Multi-device sync
- Merge local progress on first sign-in
- Conflict handling
- Account export
- Account deletion
- Sync status
- Offline queue

---

# 19. Recommended technical architecture

## Frontend

```text
React
TypeScript
Vite
```

## PWA

```text
Service worker
Offline caching
Installable web app
```

## Local data

```text
IndexedDB
Typed database wrapper
```

## Later backend

```text
Cloudflare Worker
Cloudflare D1
```

## Testing

```text
Vitest
React Testing Library
Playwright
```

## Architectural rule

Keep the following as framework-independent TypeScript modules:

- Scoring
- Spaced repetition
- Question selection
- Progress calculation
- Readiness calculation
- Study planning
- Import/export validation
- Analytics

This makes them easier to test and potentially reuse in a future native application.

---

# 20. AI features

Do not make runtime AI essential to the MVP.

## Possible later AI features

- Generate an original practice question from an objective
- Simplify an explanation
- Create flashcards from notes
- Produce a daily study summary
- Generate similar-but-not-identical scenarios
- Answer follow-up questions
- Analyse repeated misconceptions
- Suggest a practical lab
- Rewrite explanations for different reading levels

## AI requirements

- API calls must be server-side
- Never expose API keys in the browser
- Set usage limits
- Clearly label AI-generated content
- Require review before adding AI questions to the main bank
- Store source references
- Allow users to report incorrect explanations
- Never silently overwrite verified content
- Log content-generation history
- Prevent copyrighted-question imports

---

# 21. Content import and export

Support:

- JSON question-bank import
- CSV import for simple questions
- Markdown notes
- Full progress export
- Full data backup
- Restore
- Question-bank versioning
- Duplicate detection
- Validation errors with record/line numbers
- Safe migration between schema versions

Do not import Microsoft Learn assessment text into a public question bank.

---

# 22. Security and privacy

Include:

- No secrets in frontend code
- Input validation
- Safe Markdown rendering
- No raw imported HTML
- Rate limiting for AI endpoints
- HTTPS
- Minimal personal data
- Export/delete account data
- Private study notes by default
- Server-side authorisation
- Dependency scanning
- Secret scanning
- Audit logging for content changes
- Secure session handling
- Safe file import limits
- Backup and recovery plan

---

# 23. Testing plan

## Unit tests

Test:

- Scoring
- Multi-select validation
- Spaced repetition
- Adaptive selection
- Objective proficiency
- Readiness calculation
- Study-plan redistribution
- Import validation
- Data migrations
- Confidence weighting
- Error categorisation

## Integration tests

Test:

- Create a session
- Answer a question
- Save feedback
- Update progress
- Queue the next review
- Resume after refresh
- Export data
- Restore data
- Create a note
- Create a flashcard
- Link a lab to an objective

## End-to-end tests

Test:

- Onboarding
- Quick 10
- Topic practice
- Exam mode
- Wrong-answer review
- Bookmark/note creation
- Offline session
- Export and restore
- PWA installation
- Optional first sign-in and progress merge later

## Accessibility tests

Test:

- Keyboard-only navigation
- Screen-reader labels
- Contrast
- Focus order
- Reduced motion
- Responsive mobile layout
- Large tap targets
- No colour-only communication

---

# 24. Deployment and cost controls

Include:

- Separate development and production environments
- Environment variables
- No production deployment without approval
- Preview deployments
- Error logging
- Database migrations
- Backup/export strategy
- Uptime checks
- Cost alerts
- API usage limits
- No Azure resources required for the study app
- No paid service added without approval

---

# 25. MVP versus later phases

## MVP

- Onboarding
- Exam date
- AZ-104 blueprint
- Original question bank
- Learn mode
- Quick 10
- Exam mode
- Full option-by-option explanations
- Automatic next question
- Wrong-answer review
- Progress by objective
- Confidence tracking
- Bookmarks
- Notes
- Offline storage
- Import/export
- Responsive PWA

## Phase 2

- Spaced repetition
- Adaptive daily sessions
- Study calendar
- Flashcards
- Hands-on lab tracker
- Audio mode
- Deeper analytics
- Error categorisation

## Phase 3

- Accounts
- Cross-device sync
- Content editor
- Review workflow
- Optional AI tutor
- Multiple certifications
- Shared question packs

## Out of scope for the first release

- Public leaderboards
- Payments
- Social feed
- Live Azure deployment
- Multiplayer features
- Complex gamification
- Native App Store release
- Unlimited AI chat
- Community marketplace

---

# 26. Definition of done

The MVP is complete when:

```text
A user can create an AZ-104 profile with an exam date.

A user can complete a ten-question session on an iPhone-sized display.

Single-choice and multi-select questions are supported.

No clue words are highlighted before submission.

After submission, the app explains the correct option and every incorrect option.

If the answer is wrong, the app compares the chosen answer with the correct one.

The next question follows automatically unless auto-advance is disabled.

Progress is retained after closing and reopening the browser.

The dashboard shows accuracy by domain and objective.

Wrong and guessed-correct questions enter the review queue.

Exam mode provides no feedback until submission.

The app works offline after its first successful load.

Users can export and restore their local data.

No API keys or secrets appear in frontend code.

Automated tests cover scoring, question selection, and progress persistence.

The layout works on mobile and desktop.

Accessibility checks pass for keyboard navigation, focus visibility, and readable contrast.
```

---

# 27. Instructions for Codex

Codex should:

1. Inspect the existing repository before changing anything.
2. Read all project instructions and context files.
3. Write a product/design specification first.
4. Create the data model and question schema before implementing UI.
5. Divide implementation into small phases.
6. Use tests for the study engine before building screens around it.
7. Keep commits small and clearly named.
8. Preserve existing changes.
9. Avoid unnecessary dependencies.
10. Run lint, type checking, unit tests, and end-to-end tests.
11. Never deploy production without approval.
12. Never create paid resources without approval.
13. Stop and report when source content is missing rather than inventing it.
14. Maintain:
    - `PROJECT_CONTEXT.md`
    - `ROADMAP.md`
    - verification notes
    - architecture documentation
15. Keep question content separate from application code.
16. Make blueprint and question data versioned.
17. Ensure the app remains usable without AI.
18. Keep local-first functionality working throughout development.

---

# 28. Recommended product direction

The strongest version of this product is:

> A mobile-first AZ-104 PWA with original scenario questions, detailed option-by-option feedback, adaptive weak-area revision, confidence tracking, audio review, and a hands-on lab tracker linked to GitHub evidence.

This should be useful for personal AZ-104 study while remaining flexible enough to become a broader certification-learning platform later.

---

# 29. First Codex planning task

Before implementation, Codex should produce:

1. Product requirements document
2. Screen map
3. Data model
4. Question JSON schema
5. Study-engine rules
6. MVP scope
7. Phase plan
8. Testing strategy
9. Security/privacy plan
10. Deployment plan
11. Risks and assumptions
12. Open questions

Codex should not begin full implementation until the plan has been reviewed and approved.
