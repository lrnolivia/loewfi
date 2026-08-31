# Milestone 8 photography/gallery editor

## Outcome

Milestone 8 adds a dedicated editor for canonical `PhotographyProject` documents instead of forcing photography through the design block system. Existing collections open from their project detail page, and the new-project chooser can open a valid photography starter.

## Editing coverage

The editor supports:

- title, eyebrow, URL slug, stable project ID, and structured summary;
- full hero art direction and asset metadata;
- the full source collection size;
- ordered included gallery figures;
- figure add, remove, and reorder controls;
- asset IDs, alt text, web/full repository paths, optional dimensions, and optional structured captions.

Adding an included figure automatically keeps `collectionSize` at least as large as the selection. Directly setting an invalid smaller value remains visible and produces the canonical validation error rather than silently changing user input.

## Local working state

`#/projects/:slug/edit` selects this editor for photography documents, while `#/projects/new/photography` opens its valid starter. It shares the explicit browser-local save, reload recovery, corrupted-data fallback, and confirmed reset behavior introduced for Milestone 7. No state is sent to the API.

## Verification

- TypeScript, all 52 tests, and the production build pass.
- Browser testing edited Aveda Studio, exercised the collection-size validation rule, added and reordered a gallery frame, saved locally, reloaded, and recovered both the changed title and gallery order.
- Both new-project starters load as canonical schema-valid documents.
- Desktop and 390 by 844 mobile checks showed no horizontal overflow, broken editor controls, or browser warnings/errors.

## Known limits

- Gallery image picking, dropping, optimization, crop/adjustment, naming, and upload begin in Milestone 9.
- Browser-local recovery is an interim adapter, not multi-device draft persistence.
- Preview, publishing, history, and deployment status remain disconnected.

## Recommended Milestone 9

Build the media pipeline as a separate subsystem: select or drop images, inspect metadata, perform browser-side optimization, assign safe canonical names, and upload through an authenticated server API. Keep media ingestion independent from draft persistence so Milestone 10 can reference completed assets without mixing binary upload and document autosave responsibilities.
