# CMS system boundaries

The CMS follows one directional flow:

`React admin -> CMS API -> canonical data -> renderer/build -> publisher -> public site`

Drafts branch from canonical validated data before publishing and never become public merely because they were saved.

## React admin

The application mounted from `admin/index.html` owns interactive editing and status UI. It talks to the server only through `src/admin/api`. Editor and business components consume `src/admin/design-system`; they must not import a Liquid Glass renderer directly.

## CMS API

Cloudflare Pages Functions live under `functions/admin/api`. They authenticate upstream through Cloudflare Access, validate all untrusted input again, coordinate draft/renderer/publisher services, and keep GitHub credentials server-side.

## Shared content model

Framework-free TypeScript types and strict runtime validators live under `src/shared/content`. The admin, API, renderer, and publisher share schema version 1. The model was defined from Hydroviv, CK Steele, Aveda Studio, About, Home, and Contact; ordering and collection references are validated separately from individual documents.

## Renderer/build

The renderer under `src/renderer` is a deterministic, side-effect-free layer: untrusted structured input is validated first, then converted into an explicit list of public artifacts. It remains independent of the React admin and performs no filesystem, draft-store, GitHub, or deployment mutations. The fixture command is a separate build adapter that owns only `generated-preview/`, writes the declared artifacts plus a manifest, and supplies those pages to Vite. Public output reuses the approved mockup styles and the committed Sohum Liquid Glass adapter without converting the public site to React.

## Draft persistence

Draft storage is a separate repository interface, expected to use a low-cost Cloudflare store such as KV. Draft keys, migrations, conflict behavior, autosave, and retention are later milestones. Published Git data is not used as an autosave store.

## Publisher

The publisher accepts only validated canonical content and an explicit artifact set. It will create one atomic Git commit, preserve unrelated repository files, and return commit/deployment information. Rendering and GitHub mutations stay separate so generation can be tested without network writes.

## Public site

The current root React application is a temporary landing surface; `mockup/` is the approved portfolio reference; `portfolio/` is the older production site/archive. Generated preview pages share the approved public material assets through URL dependencies, while the CMS admin remains isolated from both public renderers.
