# Milestone 2 — canonical content model

## Outcome

Schema version 1 is implemented as framework-independent TypeScript plus strict runtime parsing. It covers the six supplied reference surfaces without storing HTML and does not begin renderer, editor, draft, or publishing work.

## Document model

The top-level discriminated union contains:

- design projects;
- photography projects;
- Home, About, and Contact singleton pages;
- site configuration.

Every document declares `schemaVersion: 1`, `kind`, and a stable ID. Project order is owned only by site configuration, avoiding a second conflicting `order` field on every project.

## Structured text

Prose is an ordered list of text and link runs. Optional `strong` and `emphasis` marks are data, not HTML. Link protocols are restricted to root-relative internal links, HTTP(S), email, and telephone links. This expresses About's inline Contact link and linked metadata without accepting opaque markup.

## Blocks

The narrative block union is:

- `headline`
- `paragraph`
- `heading`
- `figure`
- `figure-pair`
- `comparison`
- `figure-strip`
- `image-break`

Every block has a stable authoring ID. Heading anchors can therefore derive from stable IDs instead of changing when display text changes. Pair cardinality and strip minimums are validated at runtime.

The vocabulary preserves the real content intent while removing renderer-specific names such as `plate`. A future renderer decides whether a `figure` is presented as a specimen plate; the data records only its content and layout intent.

## Media and art direction

Images contain:

- a stable asset ID;
- required alt text;
- a required web variant;
- an optional full-size variant;
- optional intrinsic dimensions on each variant.

Paths must be safe repository-relative image paths and cannot contain traversal. Hero data separately records focal point, tone (`natural`, `muted-photo`, or `softened-artwork`), and scroll/fixed attachment. This captures the real page differences without exposing arbitrary CSS filters in content.

## Photography collections

Photography remains a flat ordered figure collection. `collectionSize` distinguishes a representative published selection from the full source collection, covering Aveda Studio's “16 of 44” behavior without encoding that sentence as presentation text.

## Page-specific content

- Home owns its hero statement/actions, selected-project references, and track introductions.
- About owns structured metadata, an optional sidebar list, and narrative blocks.
- Contact owns its hero/copy, mailto delivery configuration, form labels, and direct links.
- Site configuration owns global identity/contact data, track labels, and project ordering.

## Runtime behavior

Parsers reject:

- unsupported schema versions and document types;
- unknown fields;
- invalid or duplicate stable IDs;
- unsafe URLs and image paths;
- invalid group sizes;
- gallery undercounts;
- duplicate ordering;
- missing singleton pages;
- unknown or incorrectly categorized project references;
- Home selections that reference missing projects.

Errors include the failing JSON path. Collection validation runs after each individual document passes.

## Fixtures

Representative JSON fixtures exist for Hydroviv, CK Steele, Aveda Studio, About, Home, Contact, and site configuration. Every referenced fixture image is checked against the repository during tests.

These fixtures prove the schema against the supplied reference pages. They are not presented as a complete migration of the older `portfolio/` archive; that inventory remains later work.

## Deferred intentionally

- rendering and generated artifact definitions;
- content migrations and backward compatibility beyond schema version 1;
- editor form/view models;
- draft persistence and autosave;
- media upload/optimization records;
- publish state and GitHub commits;
- final URL/asset relocation during the public-site migration.

## Recommended Milestone 3

Build the deterministic public rendering foundation around this parser. Define explicit artifact outputs, port the sound escaping/navigation logic into TypeScript, render the six fixtures, compare output structurally and visually against the approved mockups, and keep public material primitives compatible with the committed Sohum/hybrid work. Do not introduce publishing mutations yet.
