# AZ-104 exam-alignment improvement design

The owner approved all twenty proposed improvements and explicitly requested execution without further approval. Continue native implementation with parallel agents and deploy verified updates to the existing public Studyapp Worker. No new paid services, account backend, runtime AI or Azure resource deployment is required.

## Outcome and content

Expand the current 50-question starter bank with 250 original Microsoft Learn-grounded questions (50 in each domain), for 300 proposed questions total. Audit the original ten questions per domain against retrieved official documentation, record any factual caveats, and correct only evidenced defects with revision changes. AI-assisted questions remain drafts; neither this authorisation nor an automated audit is represented as human factual review. Normal scored sessions require exact local revision approval. Draft learning, timed and case-study previews are available without repeated approval requests.

Each new question names exact official subskills using stable IDs `<objectiveId>.<1-based subskill index>` from the current blueprint. The new bank fills every objective and prioritises previously empty Entra, ARM/Bicep and DNS/load-balancing areas, with deeper VM, storage, monitoring and recovery tasks. It contains foundation/intermediate/advanced reasoning, explicit configuration assumptions, plausible distractors, and cited explanations for each option. Each domain contributes at least ten advanced questions, ten multiple-select, two ordering, two matching, ten assessment-reserved questions and two three-question linked case studies. Exhibits use accessible tables, code/plain-text topology rather than runtime executable snippets or inaccessible image-only diagrams. Case studies are original invented organisations/configurations.

## Shared contracts

Extend Question.type to `single | multiple | ordering | matching`. Ordering uses options as steps, correctOptionIds as the exact sequence and requiredSelections equal to options.length. Matching uses `matchPrompts: {id,text}[]` and correctOptionIds in prompt order; assignments use every option once. Exhibits are optional `{type: 'table'|'code'|'diagram',title,columns?:string[],rows?:string[][],text?:string,language?:string}`. Optional caseStudy is `{id,title,overview}`. Optional subObjectiveIds contains blueprint subskill IDs. Existing questions and their stored snapshots remain valid unchanged. A separate legacy mapping supplies subskills for old revisions without rewriting historical wording.

Scoring compares exact sets for single/multiple and exact ordered arrays for ordering/matching; save validation permits incomplete drafts but rejects unknown/duplicate IDs and invalid assignment counts. Native radio/checkbox/select/button controls support keyboard and touch. Answer explanations remain concealed throughout timed/case-study practice and appear only after durable finalisation.

Use existing SessionMode values. A non-null deadline denotes any timed assessment, including draft-preview timed/case sessions; draft-preview always remains excluded from proficiency/review regardless of deadline. Learn sessions retain null deadlines. SessionService updates preserve v1 backup compatibility and idempotent scoring. Linked case-study selections take an entire group and never silently split its shared context; normal case sessions use timed mode, draft cases use draft-preview with a chosen deadline.

## Learning and assessments

A detailed coverage view separates installed drafts, approved content and studied distinct questions for all 82 subskills. Official-resource links are mapped by objective from actually retrieved Learn pages/modules. No absence is disguised as mastery. Timed selection uses published domain weight ranges as an explicit practice allocation, balances objectives within domains, excludes unreleased reserve unless opted in, and displays shortages. Fresh-question reserve grows without pretending to mirror the proprietary exam bank. Feedback adds citations and supported conditions, not claims that uncertain distractors are technically correct elsewhere.

Provide an advanced filter, exhibit rendering, case-study catalogue, draft assessment preview, topic-specific official reading links and a flexible short weekly study plan based on due/weak/uncovered topics. Planning is a recommendation, not an exam pass prediction or fixed deadline. Add larger thumb-friendly controls and optional fixed action placement, with semantic inputs and reduced-motion support retained.

## Freshness and device acceptance

Implement reviewable source-change reports using canonical official pages and content hashes. A new URL check never becomes human correctness approval. Source changes quarantine affected local reviewed revisions while preserving historical sessions; temporary outages are shown separately and do not automatically invalidate technically correct content. Explicit local re-review can re-enable content after actual human review.

Expand automated acceptance across Chromium and WebKit phone-sized profiles: installation metadata, offline caching, persistence, backup restoration and text/keyboard accessibility. Add an in-app device checklist for real-phone installation and storage/offline/backup tests, because this environment cannot interact with the owner's physical iPhone or screen reader. Record that limitation explicitly; never claim device checks were performed remotely.

## Release

Keep the existing public Cloudflare worker/URL, strict CSP with build-time validators, immutable historical snapshots and no personal data in deployments. Verify schemas, scoring, backups, browser flows, source status and independent review before redeployment. Development code uses the existing feature branch/PR; no unrelated Showtime resource changes.
