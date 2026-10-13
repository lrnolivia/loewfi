# loew.fi

Lauren White's portfolio website. This repository holds the site's source, project pages, and visual assets.

The [portfolio guide](portfolio/README.md) and [asset naming guide](portfolio/ASSET-NAMING.md) describe the retained portfolio archive and its assets.

## Local development

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The development command renders the repository's legacy fixtures and starts Vite. To check the project and create a production build:

```sh
pnpm check
```

You can also run `pnpm typecheck`, `pnpm test`, or `pnpm build` separately. Build output goes to `dist/`.

## Editing and older tooling

The repository's documented day-to-day editing surface is the self-hosted Revyme editor/CMS. The former custom CMS/Puck implementation is retained as historical tooling and is inactive unless explicitly restored.

`pnpm render:fixtures` regenerates the local fixture preview. `pnpm api:dev` builds the site and starts the legacy local Cloudflare Pages runtime with local `CMS_DRAFTS` and `CMS_MEDIA` bindings. Use these commands when working on the retained legacy source.
