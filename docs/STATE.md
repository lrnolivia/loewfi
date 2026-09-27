# Current State

## Repository observation

- **Baseline observed 2026-09-23:** checkout `/Users/lrnolivia/Repos/loewfi`, branch `main`, HEAD `ca1b0db3da19ef017cd185c600d41bc4ef7b31e9`; Git status was clean before the documentation migration began. This is the migration baseline, not a claim about current status.
- **Unknown:** current deployed site behavior, Cloudflare configuration, current runtime/build health, browser behavior, and remote freshness. This migration did not run builds, tests, HTTP checks, browser checks, or deployment inspection. Before committing, the remote main ref was refreshed and checked for intervening commits.
- The repository contains public-site source and retained legacy custom-CMS code. Revyme is the day-to-day visual editor/CMS; the old custom CMS/Puck implementation is inactive unless explicitly revived. See `docs/ARCHITECTURE.md`.

## Last documented product evidence (historical)

The ignored local `REPO-CLEANUP.md` records an audit dated 2026-09-04 at commit `65015095fa6d05fd70529548b93ea9f27081cd72`: it described the root as a landing deployment, sampled portfolio routes redirecting to `/`, and the fuller React portfolio staged under `src/site/`. It reported a passing `pnpm check` and local route/browser observations for that earlier commit. This is **historical, untracked local evidence**, not verified status for current HEAD or production.

Inherited portfolio review dated 2026-09-05 described loew.fi as landing-only and CMS preview/publishing as disabled, with the next CMS milestone dependency-gated. These remain inherited observations until rechecked. Do not infer that CMS publishing is ready or that the public portfolio is launched.

## Work order and blockers

- Establish current production routes, content, behavior, metadata, and integration contracts before making launch or CMS integration claims.
- Treat CMS preview/publishing as unavailable unless current code and deployment evidence establish otherwise. Do not begin a new publishing milestone from historical recommendations alone.
- Preserve the public site/CMS ownership boundary and coordinate shared-file edits.
- This documentation migration does not verify live production, Revyme, or Cloudflare behavior. Record new verified state here when authorized work produces evidence.
