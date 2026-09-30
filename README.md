# loew.fi

Lauren White's portfolio website and canonical source repository. The self-hosted Revyme editor/CMS is the day-to-day editing surface; the former custom CMS/Puck implementation in this repository is historical and inactive unless explicitly revived. Non-product project context, state, architecture, decisions, research, operations, and historical records are Runner-owned under [`docs/loewfi/`](https://github.com/lrnolivia/loew-runner/tree/main/docs/loewfi).

## Development

- `pnpm dev` renders the legacy fixtures and starts the Vite site.
- `pnpm api:dev` builds the site and starts the legacy local Cloudflare Pages runtime with local `CMS_DRAFTS` and `CMS_MEDIA` KV bindings. This is retained development tooling, not evidence that the former CMS is active or that publishing is available.
- `pnpm render:fixtures` validates the legacy fixtures and regenerates the local preview in `generated-preview/`.
- `pnpm typecheck` checks the TypeScript boundaries.
- `pnpm test` runs the focused unit tests.
- `pnpm build` creates the Cloudflare Pages output in `dist/`.
- `pnpm check` runs type checking, tests, and the production build together.

Repository-local product authoring references remain in [`portfolio/README.md`](portfolio/README.md) and [`portfolio/ASSET-NAMING.md`](portfolio/ASSET-NAMING.md). Non-product documentation lives in [`lrnolivia/loew-runner/docs/loewfi/`](https://github.com/lrnolivia/loew-runner/tree/main/docs/loewfi). The ignored local [`REPO-CLEANUP.md`](REPO-CLEANUP.md) is preserved and is not a committed/current status source.
