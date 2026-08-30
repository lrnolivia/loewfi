# loew.fi

Lauren White's portfolio and its custom CMS.

## Development

- `pnpm dev` starts the public site and CMS admin. Open `/admin/` for the CMS foundation.
- `pnpm render:fixtures` validates the canonical fixtures and regenerates the local public-site preview in `generated-preview/`.
- `pnpm typecheck` checks the TypeScript boundaries.
- `pnpm test` runs the focused unit tests.
- `pnpm build` creates the Cloudflare Pages output in `dist/`.
- `pnpm check` runs type checking, tests, and the production build together.

Architecture notes live in [`docs/architecture/`](docs/architecture/), including the takeover audit, system boundaries, canonical content-model decisions, and renderer artifact contract.
