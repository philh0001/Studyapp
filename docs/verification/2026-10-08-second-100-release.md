# Improvements 101–200: deployed draft release

Published at https://az104-revision-web.showtime-workers.workers.dev on 8 October 2026. All 100 changes are mapped in [the delivery ledger](2026-10-08-second-100-traceability.md). PR #1 remains open; main was not merged.

## Release identity

- Product source: `2e44ae8449246553aefc585218271684202b0370`. Subsequent documentation commits do not alter the deployed product.
- Worker: `az104-revision-web`.
- Version: `a37d4b9a-960e-4569-84e0-91b22ca230f7`.
- Deployment: `1fd69758-8f34-4cba-8326-64419e264077`, created `2026-10-08T05:06:44.098169Z`, 100% traffic.

## Delivered and verified

Personal weekly planning and activity, cited reading/manual practical tracking, durable reasoning workpads, filtered historical reports and exports, evidence health, local diagnostics, deferred routes and offline access. Answer/settings/recovery write races were repaired and regression-tested.

`npm run check` passed type checking, lint, 394 unit tests across 79 files, content validation and production build. Playwright passed 106 browser checks; two duplicate cross-engine cases were intentionally skipped. Engines included Chromium and actual WebKit in phone-sized viewports. Runtime dependency audit reported zero vulnerabilities. Independent review found no remaining critical or important issues.

All 154 retained source records covering 138 distinct official Microsoft Learn URLs rechecked unchanged. Independent verification checked 1,107 quote records, including exact quotation bindings for all 1,050 options. The 315 original questions remain drafts: shipped human approval is zero and nine semantic concerns still require human review. Exact quotations establish provenance, not factual approval.

Live verification byte-matched 39 build assets and checked strict CSP. Live phone-sized smoke passed 15 routes, answer/workpad reload and offline reload with no console errors; see the deployment and live-smoke JSON files.

Initial built JavaScript decreased from 4,907,298 to 1,719,707 bytes (65.0%). This measures initial route code, not download time. Cold live Resource Timing measured 314,759 encoded JavaScript bytes across six files with service workers blocked. Full offline installation still precaches 41 entries totaling approximately 7,533 KiB. Separate static, local browser and live transfer reports retain the measurement scope.

## Remaining evidence and operations

Human factual review and physical phone/VoiceOver acceptance remain pending. Browser-local progress needs backup for transfer between devices. Scheduled workflows require default-branch activation; unattended authenticated deployment requires real CI credentials. New GitHub CI results must be checked separately after push; local results above are already verified.

The prior Worker version has a passing 16-file byte-verification report and matching reconstructed build/archive in the temporary workspace. The read-only rollback plan targets that verified version; no rollback was executed. Temporary artifacts are not permanent storage: recover/rebuild and verify them before any future rollback. No Showtime or Azure resources were changed.
