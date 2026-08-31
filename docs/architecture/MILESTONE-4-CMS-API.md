# Milestone 4 CMS API foundation

## Outcome

Milestone 4 establishes a real Cloudflare Pages Functions API boundary around the canonical validator and deterministic renderer. It supplies authenticated identity and capability reads plus a non-persisting content-validation request that returns the exact artifact plan a valid collection would produce.

No route saves drafts, returns preview HTML, calls GitHub, starts a deployment, or changes published content. Those capabilities explicitly report `false` until their later milestones are complete.

## Active routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/admin/api/whoami` | Return the Cloudflare Access identity without exposing its JWT. |
| `GET` | `/admin/api/capabilities` | Discover API/schema versions, body limits, and genuinely active features. |
| `POST` | `/admin/api/content/validate` | Validate one complete canonical collection and return document counts, IDs, and artifact metadata without rendered content. |

Every response uses one JSON envelope:

- success: `{ ok: true, data, requestId }`;
- failure: `{ ok: false, error: { code, message, issues? }, requestId }`.

Expected content errors return HTTP 422 with schema paths suitable for a future form UI. Malformed JSON, unsupported content types, oversized bodies, missing Access identity, and incorrect methods receive distinct status codes and machine-readable error codes. Internal exceptions become a generic 500 response and are logged with the request ID instead of exposing stack traces.

## Authentication boundary

The `/admin/api` middleware requires both `Cf-Access-Authenticated-User-Email` and `Cf-Access-Jwt-Assertion`. It passes only the email, a boolean JWT-presence marker, and a timestamp to application code; the JWT is never serialized.

Cloudflare Access remains the actual authentication and authorization layer. Header-presence checking is defense in depth and a deployment-wiring check, not a replacement for Access token verification. Production configuration must protect `/admin` and all `/admin/api/*` hostnames, including any reachable Pages aliases. A later security-hardening milestone should verify that live configuration and decide whether server-side JWT signature validation is warranted.

## Trust-boundary rules

- The outer collection container is now parsed from `unknown`; callers cannot satisfy the server merely through a TypeScript assertion.
- JSON bodies must use `application/json` and are limited to 1,000,000 UTF-8 bytes. Announced oversized bodies are rejected before they are read.
- The server validates the complete collection, including cross-document ordering and singleton references, before asking the renderer for an artifact plan.
- Artifact-plan responses omit generated HTML, CSS, and JavaScript content. Preview delivery remains a separate milestone.
- Responses are `no-store`, use `nosniff`, and carry the same request ID in both the header and JSON envelope.
- The client validates successful response envelopes and converts structured server failures into typed `ApiError` values with status, code, and request ID.

## Service seams

Server-only interfaces define four later integrations:

- `PublishedContentSource` reads canonical published content and its revision;
- `DraftRepository` provides revision-checked read/save/remove operations;
- `ArtifactRenderer` turns validated content into explicit artifacts;
- `Publisher` accepts a collection, artifact set, expected published revision, and actor, then returns commit/deployment information.

These are contracts only. There is deliberately no in-memory production fallback, KV binding, GitHub token, or placeholder publish success path.

## Verification

- TypeScript and the production build pass.
- The suite contains 38 passing tests after the API work, covering authentication, method handling, capability truthfulness, JSON/media/size failures, structured schema failures, artifact planning, and client envelope parsing.
- Wrangler 4.127.1 compiles the Functions with a pinned local compatibility date.
- Requests through the local Workers runtime returned 401 without Access headers, 200 for authenticated capability discovery, and 200 for a real six-document fixture validation.
- The live validation request returned three projects, three pages, and eight artifact records without returning rendered markup.
- Removing the renderer's Node-only path import made the shared renderer compatible with the Workers runtime instead of relying on `nodejs_compat`.

Local request duration is not treated as a Workers CPU-budget measurement. Production CPU and Access configuration still require deployment-level observation.

## Recommended Milestone 5

Establish the React admin application architecture and integrate the approved design-system boundary. Add client-side routing, page shells, loading/error/empty states, API capability bootstrapping, and reusable form/navigation primitives. Keep dashboard CRUD, editors, drafts, and publishing behavior inactive until their respective milestones.
