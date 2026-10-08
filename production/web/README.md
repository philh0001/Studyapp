# Standalone Cloudflare hosting package

This is a static-assets Worker configuration for a separate proposed `az104-revision-web` service. It has no backend, secrets, bindings or paid-resource provisioning. Showtime is untouched.

From the repository root:

```sh
npm ci
npm run check
npx wrangler deploy --config production/web/wrangler.jsonc --dry-run --outdir /tmp/studyapp-worker-dry-run
```

A dry run does not deploy. Production deployment requires owner release approval and a read-only check that the proposed name does not collide with an existing service. Run the same command without `--dry-run` only after that approval.

Choose access before release: public hosting publishes the bundled practice material, while progress stays in each browser. Owner-private hosting needs a separately verified Cloudflare Access configuration and offline/device acceptance. No account, domain or access policy has been created by this package.

Routing and headers follow current Cloudflare documentation retrieved on 2026-10-08:
- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/static-assets/headers/
- https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/

The shipped bank is draft preview until the owner performs explicit source review in the app. A valid build does not imply Microsoft endorsement, content approval or a pass prediction.


## Hosting choice — 2026-10-08

The owner selected Cloudflare hosting like Showtime. Showtime's production README and current Worker inventory were checked read-only: its public website is served by a Static Assets Worker. Studyapp will use the same website delivery approach through the separate `az104-revision-web` identity, initially at its returned `workers.dev` URL. No custom domain or paid resource is required. Study progress remains browser-local; bundled questions are publicly retrievable. Production publication of the verified draft-preview build remains subject to the separate release approval.


## Published draft preview

Live: https://az104-revision-web.showtime-workers.workers.dev

Publication was approved and completed on 2026-10-08 via the connected Cloudflare direct static-assets API because local Wrangler had no account login. See [release evidence](../../docs/verification/2026-10-08-cloudflare-release.md). Do not run a later CLI deployment against an unauthenticated/temporary account. Build-time standalone validators keep the deployed strict CSP compatible with backup/content validation. Human content approval remains separate from hosting approval.
