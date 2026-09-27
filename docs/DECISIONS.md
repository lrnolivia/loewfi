# Decisions

Durable cross-cutting choices only. Detailed implementation reports are preserved under `docs/archive/`.

## Website source and external authoring system

- **Decision:** Keep GitHub `loewfi` as the canonical portfolio website/source repository and self-hosted Revyme as the day-to-day visual editor/CMS.
- **Rationale:** The custom CMS/Puck path in this repository is retired; Revyme handles ongoing visual editing.
- **Consequence:** Treat legacy admin/API code and CMS milestones here as historical unless Lauren explicitly revives them. Coordinate changes to website content, renderer, build outputs, and docs with affected owners.
- **Status:** Current project direction, recorded 2026-09-24 in worker context.

## Historical CMS records are not capability claims

- **Decision:** Treat custom-CMS draft/media staging and publishing rules as historical design intent, not current product contract.
- **Rationale:** The active editing system is Revyme; retained code and milestone records do not prove what Revyme or production Cloudflare currently does.
- **Consequence:** Verify Access, preview, publish, Git mutation, and deployment behavior from the active systems before making claims or changes.
- **Status:** Current documentation rule; capabilities remain unverified.

## Preserve public visual direction and legacy source material

- **Decision:** Treat the mockup as visual/interaction reference and the portfolio archive/assets as valuable source evidence; preserve the established design language when changing public implementation.
- **Rationale:** The historic handoff designated the mockup as approved visual foundation and the archive as the complete source/assets record.
- **Consequence:** Avoid replacing intentional styling or deleting source media based on apparent non-use alone. Current production intent remains subject to current owner direction and source evidence.
- **Status:** Inherited project constraint; re-evaluate only with new evidence or authorization.
