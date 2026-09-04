# Milestone 9 — media preparation and staging

Milestone 9 adds an authenticated, draft-only media pipeline to both specialized project editors. It prepares images in the browser, stages the resulting bytes in Cloudflare KV, and writes canonical repository paths back into the project document. It does not publish files into Git or expose them on the public site.

## Editor workflow

Every canonical image field can open the same media preparation panel. An editor can choose or drop a JPEG, PNG, or WebP; compare the source with an optimized WebP derivative; choose a maximum width and compression quality; and optionally crop to 1:1, 4:5, or 16:9 around an adjustable focal point.

The browser performs decoding, cropping, resizing, and WebP encoding. This keeps image-processing CPU out of the Cloudflare Worker. The default web derivative is capped at 2400 pixels on its longest requested dimension and uses 82% WebP quality. The original can be staged beside it when it is no larger than 10 MB.

Asset IDs are normalized and must remain prefixed by the current project slug. Successful staging updates the canonical `ImageAsset` with dimensions and one of these paths:

- design: `portfolio/assets/graphics/<slug>/<asset-id>.<ext>`;
- photography: `portfolio/assets/images/<slug>/<asset-id>.<ext>`;
- optional original: the same path with `-full` before its extension.

## Authenticated staging API

`POST /admin/api/media` accepts one binary image plus validated query metadata. `GET /admin/api/media?id=<uuid>` returns a staged file with `no-store` and `nosniff` headers. Both routes pass through the same Cloudflare Access identity middleware as the rest of the CMS API.

The `CMS_MEDIA` KV binding stores bytes with structured metadata and a 30-day expiration. Staging IDs are opaque UUIDs; project slugs and asset IDs cannot introduce path traversal. The API accepts only JPEG, PNG, and WebP content types and rejects empty or over-10-MB bodies. Capability discovery reports media staging as active only when the binding exists.

## Deliberate boundaries

- Staging is not publishing. It does not write the repository, create a Git commit, deploy Pages, or change the public site.
- Draft records retain the staging IDs required by the later publisher; canonical paths alone are not treated as proof that bytes exist.
- Originals larger than 10 MB remain outside the Worker path and should be added through GitHub Desktop when a full-size source is required.
- The pipeline preserves the existing build-time responsive-media generator. Reconciliation between staged files and final generated variants belongs to publishing work.

## Verification

Automated coverage exercises crop geometry, safe naming, byte formatting, upload validation, KV persistence, canonical target paths, and binary reads. The local Wrangler runtime was also exercised with real KV bindings: a 1060×1484 JPEG became a 162,496-byte WebP, both variants were staged, the canonical paths were attached to a design draft, and the optimized bytes were fetched back through the authenticated endpoint.

