# Shared Repository Agent Rules

> Universal process authority: read `lrnolivia/loew-runner@main/LOEW_CHAT_BIBLE.md` and `contracts/manifest.json` first. This file is a repository-specific overlay and must not fork the universal operating contract.

Read [WORKER_CONTEXT.md](WORKER_CONTEXT.md) and [docs/STATE.md](docs/STATE.md) first. This checkout is the canonical loew.fi website/source and also retains inactive legacy custom-CMS code. Revyme is the day-to-day visual editor/CMS; do not treat old code or milestone docs as current workflows unless Lauren explicitly revives them.

## Ownership and boundaries

- Public-site work owns visitor-facing routes, presentation, accessibility, metadata, responsive behavior, performance, and deployment-facing routing. Revyme owns day-to-day authoring. The retained custom admin/API code is inactive historical implementation unless explicitly revived. Coordinate shared content, renderer, build, and documentation changes with affected owners.
- `cms-reference-clone/`, when present, is synchronized reference material and strictly read-only. Never edit it, make it writable, or commit it.
- Preserve the approved mockup's visual direction when relevant. Inspect real portfolio content/assets before inventing structures. Treat `portfolio/` and `mockup/` according to their documented reference/source roles; neither alone proves current production state.
- Treat Revyme draft/publish behavior and production Access, preview, and deployment state as unknown until verified. Do not infer current behavior from the inactive custom CMS code.
- Preserve original portfolio media and meaningful user-authored material. Do not delete ambiguous assets or cleanup candidates; report them for review.

## Execution

- Project Master default: GPT-6 Sol Medium; Primary Worker: GPT-6 Sol Medium. Use temporary Luna Low/Medium support first for bounded inventory, research, comparison, and straightforward edits. Delegate before higher-cost work where safe; escalate ambiguous architecture or product decisions.
- Inspect Git status and establish ownership before editing this shared checkout. Keep changes scoped, avoid conflicting work, and do not resume later milestones or expand the approved task.
- For repository hygiene, inspect build/deployment configuration and preserve the ignored, local-only `REPO-CLEANUP.md`; do not assume `.gitignore` excludes files from deployment.
- Do not run commands that write build products, caches, generated files, or local services unless the task explicitly authorizes implementation or verification. State exactly what was and was not checked.
- Follow context order in `WORKER_CONTEXT.md`; do not load all documentation by default. Historical docs in `docs/archive/` are evidence for their dates, not current-state authority.
- Report `Findings / Changes / Validation / Risks / Open Questions`; stop once acceptance criteria are satisfied.
