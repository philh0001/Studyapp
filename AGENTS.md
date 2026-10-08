# Studyapp development instructions

Read README.md, PROJECT_CONTEXT.md, ROADMAP.md, the product design, and the implementation plan before starting work. The implementation feature branch contains a running local-first application; see dated release verification for current evidence and limitations.

## Product and content requirements

- Phone-first website for personal AZ-104 revision; no preset exam date.
- All supplied learning facts and question explanations require official Microsoft evidence, primarily Microsoft Learn. Record per-option references and source-check dates.
- Author original practice scenarios. Do not copy Microsoft assessments, paid banks, or exam dumps, or call practice questions actual Microsoft exam questions.
- Keep AI-assisted questions draft until explicit human review. URL validation alone does not prove technical correctness.
- Keep question packs separate from application code. Preserve question snapshots and attempt history across content corrections.
- No accounts/backend/runtime AI in the first release. Maintain local-first progress, offline use, and backup/restore.
- Use large phone controls, readable layouts, semantic inputs, and manual advancement by default.

## Change and release discipline

- Work in an isolated feature branch; do not push product feature work directly to main.
- Preserve existing changes. Make focused commits with relevant verification.
- Do not modify Showtime repositories, Workers, routes, domains, bindings, secrets, or databases.
- Do not add paid resources, deploy Azure resources, or deploy production without the user's release approval.
- Prepare a concrete build and verification package before requesting release approval.
- Never commit personal backups, credentials, environment secrets, generated build output, or dependency folders.
- Update project context, roadmap, architecture documentation, and dated verification notes as work progresses.

## Verification

Follow each implementation task's focused checks. Once the scripts exist, use `npm run check` for typecheck, lint, unit/integration tests, content validation, and build; use `npm run test:e2e` for browser acceptance. Record unsupported checks honestly. A dry-run bundle is not proof of deployment, and desktop emulation is not proof of physical iPhone installation.
