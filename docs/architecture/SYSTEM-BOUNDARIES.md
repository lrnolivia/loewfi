# CMS system boundaries

The CMS follows one directional flow:

`React admin -> CMS API -> canonical data -> renderer/build -> publisher -> public site`

Drafts branch from canonical validated data before publishing and never become public merely because they were saved.

## React admin

The application mounted from `admin/index.html` owns routing, bootstrap state, portfolio management, specialized project editing, and status UI. It talks to the server only through `src/admin/api`. Feature modules consume `src/admin/design-system`; they do not import public Liquid Glass internals. The current shell, catalog, and editors use an isolated cream/ink material boundary that can accept the revised Sohum treatment when the final mockup arrives.

## CMS API

Cloudflare Pages Functions live under `functions/admin/api`. Shared middleware requires the identity headers injected behind Cloudflare Access, assigns a request ID, converts expected failures into a stable JSON envelope, and prevents internal exception details from reaching the client. The active API exposes identity, capability discovery, a read-only bundled repository snapshot, full-collection validation/artifact planning, draft persistence, and temporary media staging. A loopback-only development identity can be enabled explicitly by the local Wrangler command and cannot activate on a non-local hostname. Each storage capability reports itself as active only when its binding exists; preview and publishing remain disabled.

## Shared content model

Framework-free TypeScript types and strict runtime validators live under `src/shared/content`. The admin, API, renderer, and publisher share schema version 1. The model was defined from Hydroviv, CK Steele, Aveda Studio, About, Home, and Contact; ordering and collection references are validated separately from individual documents.

## Renderer/build

The renderer under `src/renderer` is a deterministic, side-effect-free layer: untrusted structured input is validated first, then converted into an explicit list of public artifacts. It remains independent of the React admin and performs no filesystem, draft-store, GitHub, or deployment mutations. The fixture command is a separate build adapter that owns only `generated-preview/`, writes the declared artifacts plus a manifest, and supplies those pages to Vite. Public output reuses the approved mockup styles and the committed Sohum Liquid Glass adapter without converting the public site to React.

## Media staging

Image decoding, cropping, resizing, and WebP compression run in the browser. The authenticated media API validates safe metadata and stores temporary binary objects in the `CMS_MEDIA` KV namespace for 30 days. Drafts reference staging IDs plus canonical future repository paths. Staging never copies files into Git, serves them publicly, or triggers deployment.

## Draft persistence

The editor uses two coordinated recovery layers. A namespaced browser envelope immediately preserves valid or temporarily invalid form state, staged-media IDs, and the last server revision. Canonical-valid work also synchronizes through the authenticated API to the `CMS_DRAFTS` KV namespace after a 15-second idle interval or an explicit save. Revision checks surface conflicts instead of silently overwriting the normal stale client. Published Git data remains the immutable editor baseline and is never used as an autosave store.

## Publisher

The publisher accepts only validated canonical content and an explicit artifact set. It will create one atomic Git commit, preserve unrelated repository files, and return commit/deployment information. Rendering and GitHub mutations stay separate so generation can be tested without network writes.

## Public site

The current root React application is a temporary landing surface; `mockup/` is the approved portfolio reference; `portfolio/` is the older production site/archive. Generated preview pages share the approved public material assets through URL dependencies, while the CMS admin remains isolated from both public renderers.
