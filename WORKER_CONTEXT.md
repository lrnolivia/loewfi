# loew.fi — Worker Context

GitHub `loewfi` is the canonical portfolio website/source repository. Figma is the canonical design system; Codex bridges major design-system changes; self-hosted Revyme is the day-to-day visual editor/CMS; Cloudflare hosts/deploys. The former custom CMS/Puck code in this repository and its milestone plans are historical and inactive unless Lauren explicitly revives them. Retained code, scripts, and historical docs do not establish an active editing or publishing workflow.

## Operating rules

- Mac PJM, Project Master, and first-class Worker default to GPT-6 Sol Medium. A Worker is a persistent, user-visible Codex task; an internal descendant is a subagent, never a substitute for a requested Worker. Prefer one agent completing one task. One Luna Low/Medium subagent is optional only for a bounded subtask with clear net savings. Astra is temporary escalation after credible Sol attempts. Do not auto-spawn, recursively delegate, or create coordinators.
- Assign one owner to each shared file or documentation set. Public-site work may encounter legacy custom-CMS code and shared content contracts; coordinate before changing shared files. Revyme's normal authoring flow is external to this repository.
- Preserve working behavior and project boundaries. Do not assume historical plans or milestone reports describe current production. Current source and verified production evidence take precedence.
- Keep tasks bounded; do not resume a later milestone or expand scope without authorization. Report evidence limits plainly.
- Revyme work must preserve GitHub `loewfi` as the source of truth and keep the editor, canvas, and preview origins protected behind Cloudflare Access. Verify active Access, preview, and publish behavior against Revyme/Cloudflare; legacy repository code does not establish their current state.
- Follow the canonical docs and on-demand context order below. Do not load the whole docs tree by default.

## Context map

1. Read this file, then [docs/STATE.md](docs/STATE.md).
2. Read the task brief.
3. Consult only the relevant canonical reference: [ARCHITECTURE](docs/ARCHITECTURE.md), [DECISIONS](docs/DECISIONS.md), [RESEARCH](docs/RESEARCH.md), or [OPERATIONS](docs/OPERATIONS.md).
4. Historical CMS milestone records are in [docs/archive/](docs/archive/README.md). Portfolio source-authoring guidance remains in [portfolio/README.md](portfolio/README.md) and [portfolio/ASSET-NAMING.md](portfolio/ASSET-NAMING.md).

## Reporting and stopping

Return concise `Findings / Changes / Validation / Risks / Open Questions`. Do not claim browser, build, HTTP, deployment, commit, or push verification unless it was actually performed and authorized. Stop when the assigned acceptance criteria are met.
