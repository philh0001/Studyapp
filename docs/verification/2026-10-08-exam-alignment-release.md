# Exam-alignment improvement release — 8 October 2026

The owner authorised all twenty improvements, parallel building and deployment without another approval gate. This authorisation does not create human factual approval. Work uses the isolated `feature/az104-revision` branch and existing Cloudflare Static Assets Worker. No Showtime, paid resources, Azure resources or account backend changes.

## Delivered programme

| # | Improvement | Concrete result |
| --- | --- | --- |
| 1 | Existing-question evidence audit | Five audit files cover the original fifty questions, with retrieved evidence and conditions; no evidenced answer correction required. |
| 2 | Individual subskills | All 82 official subskills mapped; installed, approved and studied counts remain separate. |
| 3 | Entra administration | Identity expansion covers users, groups, external identities and licensing alongside RBAC/governance. |
| 4 | ARM/Bicep | Compute questions cover parameters, deployment, dependencies, what-if, export and decompilation. |
| 5 | DNS/load balancing | Networking expansion adds public/private DNS, probes, rules and troubleshooting. |
| 6 | VM breadth | Compute expansion adds disks, encryption, sizes, moves, zones and scale sets. |
| 7 | Storage breadth | Storage expansion covers Files/identity, network controls, keys, lifecycle and protection. |
| 8 | Recovery | Backup/restore, vaults, policies, Site Recovery, failover and reporting scenarios. |
| 9 | Monitoring | Metrics, KQL, diagnostic settings, DCRs, guest monitoring and network diagnostics. |
| 10 | Advanced scenarios | 99 advanced questions with explicit assumptions and configuration reasoning. |
| 11 | Exhibits | 66 questions contain safe text/code/topology or accessible tables. |
| 12 | Linked cases | Ten indivisible three-question cases; explanations stay hidden until final submission. Mixed sessions exclude linked-case questions. |
| 13 | Distractors | Per-option explanations and retrieved citations, with licensing/scope/network conditions. Independent review sampled every domain. |
| 14 | New formats | Ten ordering and eleven matching questions, exact ordered scoring, keyboard/touch controls and durable incomplete drafts. |
| 15 | Larger reviewed bank | 300 proposed questions delivered, sixty/domain. All remain AI-assisted drafts; human factual approval of the larger bank is outstanding. |
| 16 | Balanced timed practice | Published domain-weight midpoint allocation and objective round-robin; honest shortages and draft-timed exclusion from proficiency. |
| 17 | Fresh reserve | 63 reserved questions, opt-in release; whole case selection respects every member’s eligibility/reserve. |
| 18 | Learn reading | Fifteen retrieved objective resources, weak/uncovered reading suggestions and a flexible short study week. |
| 19 | Source freshness | Reports distinguish changes/outages; transactional application pauses affected drafts/approved revisions, preserves history and never auto-approves. |
| 20 | Phone acceptance | Automated phone Chromium/WebKit checks and a persistent actual-device checklist; physical installation/VoiceOver acceptance remains outstanding. |

The bank contains 202 single-select, 77 multiple-select, ten ordering and eleven matching questions. The new 250 drafts have per-subskill mappings. The unchanged original fifty use a separate immutable revision-keyed mapping. All 300 ship as `draft`, `review: null`; no generated reviewer activates content.

## Evidence and checks

`npm run check` passed: typecheck, lint, **173 tests across 37 files**, all six packs and the current blueprint, standalone CSP validators, and production/PWA build. Runtime dependency audit: zero vulnerabilities. Final source retrieval report records **150 unchanged entries across 135 distinct official Learn URLs**; see [the actual report](2026-10-08-expanded-source-report.json).

Independent evidence review sampled advanced/matching/ordering/case questions in each domain against saved retrieved sections, and inspected original audits. It found no false keyed answer in those samples; this is not a full human factual acceptance. The reviewer found a real large-history backup issue and missing publication metadata. Both were corrected and re-reviewed: JSON exports enforce their import cap, large histories use local gzip, imports enforce 10 MiB file / 64 MiB expanded limits, and a 100-session/2,000-attempt history successfully restored. The reviewer independently tested an oversized compressed payload rejection. Publisher dates were filled in 287 new references directly from retrieved HTML metadata. Real case-start acceptance subsequently exposed a default reserved-case selection; the selector now disables unavailable cases and chooses a usable whole-case default. A regression was observed failing before the fix, then passed, and independent review found no blocker in this final integration.

The final complete browser release suite passed **54/54 checks** (18 in each of desktop Chromium, phone-sized Chromium and mobile WebKit), after the case-start fix. It covers real start controls, published assessment allocations, whole cases, ordering/matching, hidden feedback, reload/offline persistence, JSON/gzip/recovery backups, keyboard, large text, themes and strict CSP. Live deployment evidence is appended below. Automated approvals exist only in disposable test profiles and are not copied into published data. Browser profiles include desktop Chromium, phone-sized Chromium and iPhone-profile WebKit. WebKit uses private extracted Linux libraries because administrator package installation was unavailable; the browser actually ran. Details are in [the phone checklist](phone-acceptance-checklist.md).

The generated main JavaScript is about 1.61 MB before compression / 288 kB gzip; PWA precache about 1.56 MiB. Vite’s large-chunk advisory remains. The expanded offline question bank is bundled deliberately; it is not a hidden build failure or a physical-device performance measurement.

## Workflow decisions and limits

Native agents built disjoint content, schema/scoring, session/backup, coverage, formats and freshness tasks; the root integrated and independently reviewed release changes. Native tools and a local manual execution ledger substitute for skill helper scripts unavailable in the environment. User authorisation overrides optional skill permission gates; no additional approval was requested. Individual human factual review and actual-device testing cannot be fabricated and are reported as outstanding evidence, not user permission gates.

No real exam questions were copied. Practice scores are not pass predictions. Original scenarios follow the published skills and official Learn documentation, rather than claiming Microsoft endorsement or exact proprietary exam formats. Local progress stays on the device, with old backup compatibility, historical snapshots, strict CSP and update deferral for active sessions preserved.

## Published and live verified

- URL: https://az104-revision-web.showtime-workers.workers.dev
- Worker: `az104-revision-web`; workers.dev enabled, version previews disabled; existing hosting reused.
- Published application source: `e673883`.
- Cloudflare deployment: `ecb6cdca664547828585dad573b80106`, uploaded `2026-10-08T01:58:41.764197Z`.
- Live HTTP 200 and the expected asset ETag verified. Strict `script-src 'self'` remains; no unsafe evaluation was added.
- Actual public-site Chromium 156.0.8078.4 phone-width smoke verified 300 installed drafts, all 82 subskills, five navigation routes, thumb-controls selection, durable answer reload, controlled service worker and offline reload/next-question continuation. Zero console or page errors.
- Final complete browser suite: 54/54; full app check: 173 tests/37 files plus typecheck, lint, six packs, blueprint and build; runtime audit: zero vulnerabilities.

Deployment credentials were temporary, scoped to the asset upload and removed from workspace temporary files after use. No personal progress, test-profile approvals or secrets were included in the public assets. Code and evidence are on the existing feature branch/PR; it was not merged directly into main.

Outstanding factual/physical evidence: human answer-and-option review of all 300 drafts and actual-phone installation/storage/VoiceOver checks. Draft practice is usable now, and those evidence requirements are displayed without another deployment permission request.
