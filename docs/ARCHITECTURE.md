# Architecture

This repository is the canonical website/source for loew.fi. Self-hosted Revyme is the day-to-day visual editor/CMS. Legacy custom-CMS code remains in the checkout as inactive historical implementation unless Lauren explicitly revives it; its presence does not establish a supported authoring, preview, or publishing flow.

## Ownership

- **Public site:** visitor-facing routes, content presentation, React site under `src/site/`, mockup/reference surfaces, public metadata, responsive behavior, accessibility, performance, and deployment-facing routing.
- **Legacy custom CMS:** `src/admin/` and `functions/admin/` contain the former admin/API implementation. Treat it as inactive historical code unless explicitly revived.
- **Website content and rendering:** `src/shared/content/` and `src/renderer/` contain content and rendering code. Verify current use in source before changing contracts or generated artifacts; do not assume Revyme consumes these legacy CMS interfaces.
- **Portfolio source/reference:** `portfolio/` holds the legacy static-site archive and original organized assets; `mockup/` is visual/interaction reference. These are not automatically the current deployed site or canonical CMS output.
- **CMS reference clone:** `cms-reference-clone/`, when present, is a synchronized read-only reference. Never edit it or treat local edits there as authoritative.

## CMS data flow and boundaries

The historical custom-CMS flow was `React admin → CMS API → canonical validated content → renderer/build → publisher → public site`. Its draft, media staging, preview, and publishing behavior is historical design/implementation evidence only. Confirm active Revyme and Cloudflare behavior independently before describing current authoring or publishing capabilities.

The legacy admin talked to server functions through `src/admin/api`; server routes lived under `functions/admin/api`. These implementation details derive from archived milestone records and must not be mistaken for active production architecture. The fixture adapter and pure renderer describe the legacy local rendering path; check current source and deployment before relying on them.

## Content and assets

The historical schema-v1 model covers design projects, photography projects, Home/About/Contact, and site configuration. Design content uses structured blocks and rich-text runs rather than stored HTML; photography uses an ordered gallery and collection metadata. Schema version, current documents, and renderer behavior should be verified in `src/shared/content/` before relying on specifics.

Portfolio source assets are organized under `portfolio/assets/graphics/<slug>/` and `portfolio/assets/images/<slug>/`. The preserved [asset naming guide](../portfolio/ASSET-NAMING.md) describes the legacy archive convention. CMS staged targets and generated responsive media have separate workflows; do not conflate those paths.

## Key directories

```text
src/site/                 Public React site
mockup/                   Approved visual/reference material
portfolio/                Legacy site and source media archive
src/admin/                Inactive legacy CMS React application
functions/admin/          Inactive legacy CMS Pages Functions
src/shared/content/       Website content contracts (verify current consumers)
src/renderer/             Legacy deterministic artifact rendering path
docs/archive/             Historical CMS milestone and boundary records
```
