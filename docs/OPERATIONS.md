# Operations

Commands below are documented in the current README and `package.json`; this migration did not execute them. Confirm bindings, credentials, and target environment before any API or deployment workflow.

## Repository development scripts

- `pnpm dev` — render legacy fixtures and start Vite.
- `pnpm api:dev` — build and start the retained local Cloudflare Pages runtime with local identity and persisted `CMS_DRAFTS` / `CMS_MEDIA` bindings under `.wrangler/state`; this exercises the inactive legacy CMS code.
- `pnpm render:fixtures` — compile and render legacy fixtures into `generated-preview/`.
- `pnpm typecheck` — TypeScript check.
- `pnpm test` — Vitest suite.
- `pnpm build` — fixture render plus Vite production build into `dist/`.
- `pnpm check` — typecheck, tests, and build.

These commands can write build products, caches, local KV state, or generated files. Run them only within an authorized implementation/verification task, not as read-only observation.

## Build and publishing boundaries

- `dist/`, `.renderer-build/`, `.wrangler/`, and generated preview/media outputs are documented as reproducible local/build outputs; inspect `.gitignore` and current scripts before cleanup.
- Historical CMS milestones explicitly kept draft and media staging separate from Git writes and public deployment. Treat publish/deploy capability as unknown until current routes, bindings, credentials, and deployment state are checked.
- Public site deployment and CMS publishing are distinct concerns. Confirm Cloudflare routing/protection and the current production artifact before release claims.

## Recovery and local-only records

- `REPO-CLEANUP.md` is intentionally ignored and local-only. Preserve it; its last recorded audit is dated 2026-09-04 and is not current verification.
- `cms-reference-clone/`, when present, is read-only and may be replaced by synchronization.
- Portfolio source media are user-authored originals. Do not destructively recompress or remove them without explicit review.
