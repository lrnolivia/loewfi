# Milestone 3 deterministic renderer

## Outcome

Milestone 3 turns schema-version-1 content into a deterministic, previewable public artifact set. The renderer validates the complete collection before producing output, covers Home, About, Contact, design projects, and photography projects, and keeps filesystem and publishing concerns outside the pure rendering layer.

The generated pages preserve the approved mockup architecture and reuse its shared styles, dynamic-color helper, and committed Sohum Liquid Glass adapter. The public output remains static HTML/CSS/JavaScript; no public-site React conversion or GitHub publishing mutation was introduced.

## Artifact contract

`renderSite(input)` accepts unknown project, page, and site-configuration values. It returns `GeneratedArtifact[]` only after `validateContentCollection` accepts the entire collection. Each artifact declares:

- a repository-relative output path;
- its content type and complete deterministic content;
- the canonical source document responsible for it;
- a sorted, de-duplicated list of runtime and image dependencies.

The current fixture collection produces eight declared artifacts:

- six HTML pages: Home, About, Contact, Aveda Studio, Hydroviv, and CK Steele Plaza;
- one shared renderer stylesheet;
- one progressive gallery-view script.

The fixture build adapter writes these files beneath the owned `generated-preview/` directory and adds `manifest.json`, which records artifact metadata and byte sizes without duplicating content. It refuses to clean an unexpected directory or write an artifact outside its owned output root. The generated directory and intermediate TypeScript build are intentionally ignored because they are reproducible build products.

## Rendering decisions

- Rich text is escaped by default. Only schema-defined strong, emphasis, and link marks become HTML; external links receive `rel="noopener noreferrer"`.
- Navigation order and dropdown contents come from validated site configuration rather than renderer constants.
- Heading navigation is derived from block headings with stable, collision-safe anchors.
- Image paths are resolved relative to each artifact, and full-size variants become links when present.
- Home-page dependencies include the selected project documents because their teaser images are rendered there.
- Photography galleries render usable grid markup before JavaScript runs. The small enhancement script changes views, maintains one active carousel item, updates `aria-pressed`, and supports previous/next controls.
- Public glass surfaces use the approved markup geometry and Sohum adapter. The CMS admin does not import these material primitives.

## Verification

- TypeScript type checking passes.
- All 29 focused tests pass, including eight renderer tests for determinism, escaping, path uniqueness, page structure, gallery modes, dependencies, and material integration.
- The production Vite build succeeds and includes the six generated pages alongside the existing public, mockup, hybrid, and admin entries.
- Browser checks covered all six generated routes at the desktop viewport: every route loaded its expected heading, used the Sohum engine, loaded all images, retained the approved navigation height, and had no horizontal overflow.
- Home, Hydroviv, Aveda Studio, and Contact were also checked at 390 by 844 pixels with no broken images or horizontal overflow.
- Hydroviv was compared visually and geometrically with the approved mockup. The generated navigation matches its 518.18 by 58.5 pixel desktop footprint and keeps dropdown panels out of layout until hover or focus.
- Aveda Studio was checked visually, and its view controls successfully changed from grid to carousel and advanced the count from `1 / 4` to `2 / 4` while retaining exactly one active item.

## Intentional limits

- Fixtures are representative canonical content, not a completed migration of the entire historical portfolio archive.
- `generated-preview/` is a local/build verification target, not the final production path convention.
- Contact form markup is rendered, but submission handling belongs to a later API milestone.
- Draft storage, autosave, media ingestion, GitHub commits, deployment status, and rollback are still deferred.
- The renderer declares dependencies but does not copy, upload, delete, or publish them.

## Recommended Milestone 4

Build the CMS API foundation around the validated content and renderer contracts. Define authenticated read/write endpoints and service interfaces, return structured validation errors, and keep draft persistence and publishing implementations behind explicit boundaries. Do not couple request handlers directly to GitHub or make draft saves public.
