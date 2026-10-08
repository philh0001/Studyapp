# Expanded AZ-104 study guide

`az104-course.json` combines the six ordered authoring files in `paths/`. It contains original key points and expanded teaching covering the actual course linked from [Microsoft Learn AZ-104T00](https://learn.microsoft.com/en-us/training/courses/az-104t00): 6 learning paths, 28 modules, 231 units and 847 points. All 151 teaching/exercise units include visible explanations, scenarios and practical steps; introductions/summaries remain short. Assessment units link to the official interactive check; no assessment question bank is reproduced.

`source-evidence.json` records the course/path/module/unit order, official unit URLs, individual retrieval dates, successful HTTP status and SHA-256 hashes of retrieved source HTML. All 231 unit pages were retrieved on 8 October 2026. Raw source text is not bundled or redistributed. Notes are independently authored adaptations of factual teaching, with a direct original-unit link per lesson. No blanket licence is inferred for Microsoft Learn pages from another repository's licence.

This is independently authored course coverage, not a claim to reproduce every sentence, interactive experience, diagram or Azure exercise. Coverage of this course is also distinct from exhaustive coverage of every current AZ-104 exam objective. Every installed teaching point was compared with official sources in an AI-assisted semantic audit; this does not constitute human factual approval.

Some retrieved lessons contain dated or inconsistent wording. Notes omit questionable assertions about legacy Automation Update Management, SSD v2 preview status, automatic region-pair failover, Entra Domain Services licence bundling, peering deletion requirements, DNSSEC availability, Table Storage/Cosmos features, File Sync system volumes, individual-file soft-delete recovery and several numeric/pricing limits. Use the original sources and current product documentation when an exact feature, limit or price matters.

The pack is bundled in the lazy course reader and precached by the existing PWA. Course completion and listening preferences are personal workspace state, separate from practice scores and Microsoft Learn completion. Browser voices/offline speech depend on the device; no server speech service is configured.

## Complete accuracy check — 8 October 2026

All 847 points across 231 units were checked against the retrieved lessons and current official product documentation. The three records in `audits/` bind each final point by SHA-256 and identify its supporting sources. Sixty-seven points were corrected, including current authentication policy, IP allocation, storage and SAS support, container constraints, backup and monitoring changes. Supplementary official sources appear with the relevant lesson. Audit records explicitly report no human approval. Separately, all 315 practice questions and 1,050 options, plus 212 study-aid items, were checked; one question was qualified to default Provider what-if validation and 14 study-aid fields corrected. The official exam blueprint check found no change.

## Fuller teaching — 8 October 2026

The overlays in `expanded/` add more than 35,000 words across 413 sections to the original 847 quick points. Every substantive unit has two or three teaching sections with official unit and product-documentation citations. Original prose adds the reason behind choices, prerequisites, contrasts, worked scenarios and practical checks. Command examples are illustrative and are never executed by the app.

`node scripts/build-course.mjs` reproducibly combines the ordered path files and overlays, checking unchanged quick-point hashes and authored source-review coverage before writing the bundle. Independent semantic reviews bind every final added section by SHA-256 in `expanded/accuracy-review.json`; the three component reviews retain corrections and sources. These are AI-assisted comparisons, with no human approval claimed.

The same ordered reading blocks drive visible text, browser speech and highlight offsets, including steps and code. Existing key-point speech positions stay valid because their prefix is preserved. Expanded teaching is visible without another disclosure, available offline through the PWA, and linked directly to its original lesson.
