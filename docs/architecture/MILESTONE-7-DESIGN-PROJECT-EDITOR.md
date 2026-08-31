# Milestone 7 design-project editor

## Outcome

Milestone 7 adds a working structured editor for canonical `DesignProject` documents. Existing design projects open from their project detail page, and the new-project chooser can open a valid design starter. The editor works against the same typed document used by validation and rendering; it does not translate through a second form-only content shape.

## Editing coverage

The editor supports:

- title, eyebrow, URL slug, and stable project ID;
- structured project summary;
- hero asset identity, alt text, web/full paths, optional dimensions, focal point, tone, and attachment;
- flexible ordered metadata with structured values;
- adding, removing, and reordering all eight canonical block types;
- stable block IDs and every block-specific setting;
- figure assets, captions, layouts, pairs, comparisons, labels, and strips.

Rich text is edited as ordered inline nodes rather than flattened into a textarea. Text and link nodes retain destinations plus independent emphasis and strong marks.

## Local working state

`#/projects/:slug/edit` and `#/projects/new/design` use a namespaced browser-local working-copy adapter. Saving is explicit. A saved working copy survives reload even while canonical validation is failing, which prevents an in-progress correction from being discarded. Corrupt or incompatible stored data falls back to the source document with a visible recovery notice. Reset requires confirmation.

This is not a draft API. The editor makes no server mutation and performs no media upload, preview generation, publish, Git, or deployment action.

## Validation

Every edit is evaluated by the canonical `parseProjectDocument` trust-boundary parser. The status panel reports the first actionable schema path and message, then returns to a valid state as soon as the document is accepted.

## Verification

- TypeScript passes.
- All 52 tests pass, including valid templates for all eight block types, immutable ordering helpers, validation failures, local recovery, corrupted-storage fallback, and editor routes.
- The production Vite build succeeds.
- Local Cloudflare Pages serves the authenticated admin and API routes.
- Browser testing edited Hydroviv, produced and repaired a slug validation error, added a headline block, reordered it, saved locally, reloaded, and recovered the changed title and block order.
- The editor rendered cleanly at desktop and 390 by 844 pixels with no horizontal overflow or browser warnings/errors.

## Known limits

- Media fields reference repository paths; selection, optimization, and upload belong to Milestone 9.
- Local work is isolated to one browser and device. Server drafts, autosave, conflict handling, and unsaved-navigation protection belong to Milestone 10.
- Preview and publishing remain disconnected.
