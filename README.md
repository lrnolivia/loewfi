# loew.fi

Lauren White's portfolio and its custom CMS.

## Development

- `pnpm dev` starts the public site and CMS admin UI. Open `/admin/` for the control panel; API-backed data requires `pnpm api:dev`.
- `pnpm api:dev` builds the site and starts the local Cloudflare Pages runtime for exercising `/admin/api/*`.
- `pnpm render:fixtures` validates the canonical fixtures and regenerates the local public-site preview in `generated-preview/`.
- `pnpm typecheck` checks the TypeScript boundaries.
- `pnpm test` runs the focused unit tests.
- `pnpm build` creates the Cloudflare Pages output in `dist/`.
- `pnpm check` runs type checking, tests, and the production build together.

Architecture notes live in [`docs/architecture/`](docs/architecture/), including the takeover audit, system boundaries, content and renderer contracts, CMS API, admin architecture, project management, and the two specialized project editors.
