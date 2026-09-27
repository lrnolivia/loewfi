# Milestone 5 admin application architecture

## Outcome

Milestone 5 replaces the single foundation screen with a real React application shell. The admin now boots from three typed API reads, owns a small internal router, presents explicit loading and startup-error states, and gives feature modules a stable design-system and layout boundary.

The current visual language follows the approved loew.fi cream, ink, typography, spacing, and track accents. Public Liquid Glass internals remain outside the admin feature code. When the revised Sohum mockup arrives, its material implementation can be adapted at the design-system boundary without changing routing, API, or project logic.

## Application boundaries

- `app/router.ts` maps hash routes for dashboard, project index, project details, and new-project entry. Hash routing keeps local, preview, and deployed static hosting behavior identical without server rewrite requirements.
- `app/bootstrap.ts` loads identity, capability discovery, and published content together. The workspace does not render partially initialized business screens.
- `app/AdminShell.tsx` owns navigation, identity presentation, responsive layout, and active-section state.
- `features/` owns business-facing screens and view models.
- `design-system/` owns surfaces, actions, badges, headings, empty states, and loading presentation.
- `api/client.ts` remains the only browser-to-server boundary.

## Local authentication

`pnpm api:dev` supplies `CMS_LOCAL_ADMIN_EMAIL` to Wrangler. The middleware accepts it only for `localhost`, `127.0.0.1`, or `::1`, marks the session as `local-development`, and reports that no Access JWT is present. The same binding cannot authenticate a request to a deployed hostname. Production still requires both Cloudflare Access headers.

## Responsive and accessibility behavior

- Navigation collapses into a horizontal mobile rail while unfinished sections disappear rather than becoming misleading controls.
- Active links, pressed filters, disabled editor actions, labels, result counts, and loading state expose semantic state.
- Keyboard focus remains visible, reduced-motion preferences suppress decorative movement, and the layout has no horizontal overflow at 390 pixels.

## Deferred intentionally

- revised Sohum material internals from the final mockup;
- editor state and form controls;
- drafts, dirty-state protection, and autosave;
- preview and publish actions;
- Pages, Media, and Settings feature routes.

Milestone 6 builds business-facing project management on this shell.
