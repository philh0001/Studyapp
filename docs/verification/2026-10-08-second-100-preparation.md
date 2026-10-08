# Second 100 Release Preparation

The authorised items 101–200 are implemented and traced in the delivery ledger. The build remains a public personal-study draft with 315 original questions and zero supplied human factual approvals. All 1050 answer options have exact revision-specific Learn quotation bindings; nine recorded semantic concerns remain explicit.

Fresh coordinator verification on 2026-10-08:

- `npm run check`: typecheck, lint, 394 unit tests across 79 files, all content schemas and production build passed.
- Full Playwright run: 106 passed, two intentional duplicate cross-engine transfer skips, zero failures. Desktop Chromium, phone-sized Chromium and actual WebKit automation include offline lazy routes, 320/430px at largest text, workpad autosave/reopen, matching-answer durability and fresh recovery safeguards.
- All 154 source ledger records across 138 distinct official Learn URLs rechecked unchanged.
- Runtime dependency audit: zero vulnerabilities.
- Fresh independent review: no remaining Critical/Important findings; all 154 retained HTML hashes and 1107 quote records checked independently. Human semantic approval is not inferred.
- Built initial-route JavaScript: 1719707 bytes versus reconstructed baseline 4907298 bytes, a 65.0% reduction. Estimated gzip is 313512 bytes versus 580895. Thirteen feature/data files are deferred; full offline installation still downloads every asset.
- Actual local browser Resource Timing: 313904 encoded JavaScript bytes in Chromium and mobile Chromium, 314188 in mobile WebKit; six initial files. These are local observations, not physical-device speed measurements.
- Prior live deployment reconstructed and byte-verified against all 16 baseline assets. Matching artifact retained at `/tmp/studyapp-second100-baseline/dist` and `/tmp/studyapp-second100-baseline-dist.tar.gz`; source baseline is reproducible from `86670424886ac1242f6f1a592b101eb3cf432963`.

Deployment and live verification follow this preparation record. Existing PR #1 stays open. Physical-phone/VoiceOver acceptance and independent human factual review remain pending. Authenticated CI deployment secrets are not fabricated, and scheduled workflows require the feature branch to reach the default branch.
