# Milestone 6 dashboard and project management

## Outcome

Milestone 6 adds a functional portfolio dashboard and project-management catalog backed by the CMS API. It reads the validated canonical repository snapshot, follows configured project ordering, and exposes track-aware summaries without pretending that mutation, drafts, or editors already exist.

## Published-content read path

`GET /admin/api/content` returns:

- the validated `ContentCollection` bundled from the current repository fixtures;
- the Cloudflare Pages commit SHA when available, or `local-working-tree` locally;
- the explicit source label `bundled-repository`.

The client validates the complete returned collection again. Capability discovery now reports `publishedContentRead: true`. This is a genuine read path, not a writable in-memory database. A later source adapter can read final canonical repository data without changing the route or browser contract.

## Dashboard

The dashboard shows only facts derivable from canonical content:

- published project count;
- singleton page count;
- unique referenced media count;
- configured project order and track;
- track-specific structure counts;
- honest readiness for validation, drafts, and publishing;
- published-source revision.

No fake dates, activity history, deployment status, or editorial state are invented.

## Project management

- The catalog supports case-insensitive, punctuation-tolerant search.
- All, Design, and Photo filters update the visible result set and accessible count.
- Cards use bundled hero assets, project track accents, and track-appropriate structure counts.
- Project detail routes show the hero, schema facts, generated-page link, and either the design block outline or included gallery frames.
- The new-project route explains the two distinct content workflows.
- Edit and creation controls remain disabled with their target milestones identified. Documents are not created until their editor can produce valid recoverable content.

## Verification

- TypeScript, all 46 tests, and the production Vite build pass.
- Wrangler compiles and serves the admin plus all API routes with the explicit local identity binding.
- Desktop browser checks exercised dashboard loading, project navigation, Design filtering, punctuation-tolerant search, Hydroviv detail, and the new-project chooser.
- Mobile checks at 390 by 844 pixels loaded all images, retained dashboard/project navigation, displayed all three cards, and had no horizontal overflow.
- Browser diagnostics contained no warnings or errors.

## Known limits

- The bundled repository source currently contains the six canonical milestone fixtures, not the complete historical portfolio.
- Project management is read-only until the specialized editors and draft repository exist.
- Ordering is displayed from site configuration but is not draggable yet.
- The existing unrelated `/hybrid-test/` redirect still produces a Wrangler warning.

## Recommended Milestone 7

Build the design-project editor against `DesignProject`: identity fields, flexible metadata, ordered block editing for all eight block types, client validation, and a recoverable local working state. Keep server drafts and autosave deferred to Milestone 10, but design the editor state so that persistence can be added without conversion.
