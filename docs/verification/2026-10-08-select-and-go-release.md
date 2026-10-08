# Select-and-go practice: deployed fix

The owner requested choosing study options and starting immediately, without content approval or a separate Draft preview mode.

Learn and Timed practice now select installed questions directly. Ordinary answers update revision queues, coverage, analytics and history. Draft provenance remains truthful and human approval is not fabricated. Retired and source-invalidated revisions stay unavailable. The setup screen has two modes; advanced mix/reserve/source controls sit under More options. Legacy preview links/presets open ordinary practice; historical preview sessions remain readable with their original unscored meaning. Question wording and official Microsoft Learn citations are unchanged.

The saved-session resume path also loads its saved attempt before display, preventing heading focus from resetting restored reading position. Device report autosave retains pending latest values until normalized storage acknowledgement and accepts later restored snapshots.

## Verification

- Fresh typecheck, lint, all 405 unit tests across 82 files, and blueprint/seven-pack validation passed.
- Production build passed. 112 browser checks passed across desktop Chromium, phone-sized Chromium and actual WebKit; two duplicate-engine cases intentionally skipped, zero failures.
- Independent review found no outstanding critical or important findings after copy and autosave follow-ups.
- Live verification matched all 39 build assets and checked strict CSP.
- Live phone-sized Chromium smoke passed 15 routes, direct Learn/Timed starts with zero human approvals, collapsed optional controls, updated progress, saved answer/workpad reload, and offline reopening. Zero console errors.
- Physical-phone/VoiceOver acceptance has not been performed by automation. Factual review metadata remains separate from personal practice scores; scores do not predict exam readiness.

## Release identity

URL: https://az104-revision-web.showtime-workers.workers.dev

Product source: `0d219628480bf8fbd57c2ed2a3a24d23a96294b7`.

Worker: `az104-revision-web`.

Worker version: `4aa557e5-2638-4db2-8360-1690d9f5e2b3`.

Deployment: `834c51d2-851b-41c0-9ad8-458a5f0d94d0`, created `2026-10-08T07:34:32.973832Z`, 100% traffic.

Prior version: `a37d4b9a-960e-4569-84e0-91b22ca230f7` (retained verification in second-100 deployment record). No rollback executed. No Showtime or Azure resources changed. Product work remains on the feature branch and open PR #1; no merge to main. Subsequent documentation commits do not alter deployed assets.

Existing PWA installations may show Update app; finish active sessions before applying their pending update. Never clear browser data to update—the browser-local study history should be preserved.
