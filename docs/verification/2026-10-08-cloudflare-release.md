# Cloudflare draft-preview release — 2026-10-08

Live URL: https://az104-revision-web.showtime-workers.workers.dev

The owner approved publication on a public Cloudflare workers.dev address, citing Showtime UAT as the example. Only the separate `az104-revision-web` service was deployed. No custom domain, paid resource, API, database, private Access policy or Showtime service was changed.

## Release identity

- Application commit: `f9c731a` on `feature/az104-revision` (PR #1).
- Current Cloudflare deployment ID: `23a4758707c942b4b2230d6362bbcfeb`.
- Current upload completed: 2026-10-08 01:24:55 UTC.
- Served application bundle: `/assets/index-CqNPdPcp.js`.
- Public workers.dev exposure explicitly enabled; version preview URLs disabled.

Wrangler's local CLI was not authenticated, while the connected Cloudflare API was authenticated. Deployment therefore used the documented direct static-assets upload flow: Blake3 content/extension hashes matching Wrangler, manifest upload, scoped one-hour asset upload session, multipart base64 file upload, completion token, assets-only Worker upload with the verified routing/security-header configuration, and public-subdomain enablement. Scoped upload credentials stayed in temporary files and were removed. They were never committed or printed. This deploys native Cloudflare static assets, not a Worker serving embedded asset strings.

Current reference: https://developers.cloudflare.com/workers/static-assets/direct-upload/

## Hosting issue found and fixed

The initial upload returned correct HTML and security headers, but the first real browser check revealed runtime Ajv schema compilation violating `script-src 'self'`. Local Vite preview had not applied Cloudflare's `_headers` file. No successful app claim was made for that initial rendering.

A browser regression using the literal deployed Content Security Policy failed before the fix. Pack, blueprint and backup schema compilation now happens at build time via `npm run validators:generate`. Runtime imports standalone validators; the policy still prohibits unsafe-eval. The generated source is tracked, regenerated before builds and type-declared. Backup schema definitions are unchanged, extracted for generation. A fresh independent review compared standalone and runtime Ajv over 179 cases, including error arrays, and found no blocking difference. The corrected build was redeployed to the same separate Worker.

## Actual checks

- `npm run check`: typecheck, lint, 96 unit/integration tests, content validation and production build pass.
- Complete production-preview browser suite: **24/24 pass**, including new strict-CSP startup and backup validation checks on desktop and mobile profiles.
- Live homepage: HTTP 200, expected application bundle and CSP, nosniff, frame denial, referrer and permission headers.
- Live manifest and service-worker script: HTTP 200; service-worker cache policy is no-cache.
- A navigation request to `/practice` returns the SPA fallback (200). Non-navigation unknown paths may return 404 by Cloudflare design. Application navigation uses hash routes.
- Live Chromium156 smoke at 390×844: Home, Practice, Review, Progress and Settings load; 50 drafts are installed; answer and feedback survive reload; the service worker controls the page; offline reload and next-question continuation pass; **zero browser console/page errors**.
- The managed environment's outbound proxy certificate was trusted in the browser using the specific proxy CA public-key pin, without a blanket certificate-error override. Curl used the environment CA trust normally.

The final compiled bundle is about 758 kB minified /157 kB gzip; precache about 769 KiB. Vite's chunk-size advisory remains recorded; no performance certification is claimed.

## Remaining acceptance

All fifty shipped questions remain original AI-assisted drafts until real human review against Microsoft Learn. Automated approval clicks in disposable test profiles do not approve published content. Scored study is enabled per locally reviewed revision. Physical iPhone/Safari installation and screen-reader acceptance still need the owner's actual device. Browser-local progress is not synced; export a backup before changing browser profiles or clearing storage.

The implementation source and this record remain in PR #1; deployment does not imply that the pull request has been merged.
