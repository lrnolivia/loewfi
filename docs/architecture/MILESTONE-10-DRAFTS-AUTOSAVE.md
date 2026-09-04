# Milestone 10 — drafts and autosave

Milestone 10 replaces the interim browser-only working copy with an authenticated server draft while retaining browser recovery for every keystroke and temporarily invalid work.

## Two-layer recovery model

The editor writes a versioned recovery envelope to namespaced browser storage after 250 ms of inactivity. That envelope includes the project document, staged-media IDs, the last known server revision, and a timestamp. It can preserve incomplete or invalid form state, so a reload does not erase work while a field is mid-edit.

Canonical-valid documents also autosave to the server after 15 seconds of inactivity. The longer server interval is intentional: it limits KV writes while keeping the immediate local recovery experience. Editors can select **Save now** at any time. The status panel distinguishes loading, pending, saving, saved, local-only, invalid, unavailable, and conflict states without implying that a draft is published.

On load, the editor compares the local recovery timestamp with the server draft timestamp. It opens the newer version, retains the server baseline for dirty-state calculation, and keeps the other layer available. Invalid local work never overwrites the last valid server draft.

## Draft API and storage

`GET`, `PUT`, and `DELETE /admin/api/drafts/:draftId` operate on the `CMS_DRAFTS` KV binding. PUT accepts only a schema-valid canonical project and records:

- the route-scoped draft ID;
- the project document;
- the published revision it began from;
- attached staged-media IDs;
- a generated draft revision;
- update time and authenticated editor email.

PUT supplies an expected revision and DELETE uses `If-Match`. A stale revision returns `409 conflict`, preventing the normal editor flow from silently overwriting a newer server draft. The conflict UI offers an explicit, confirmed reload of the server version.

Cloudflare KV does not provide an atomic compare-and-swap transaction, so the read/check/write sequence is optimistic rather than mathematically atomic. That is acceptable for the current single-editor beta assumption; stronger coordination should be evaluated during reliability hardening if multi-editor use becomes a requirement.

## Local and production configuration

`pnpm api:dev` builds the application and starts the local Cloudflare Pages runtime with persistent local `CMS_DRAFTS` and `CMS_MEDIA` KV bindings under ignored `.wrangler/` state. It exercises the real Pages Function boundary without connecting the repository to a live Cloudflare account or modifying the existing production site.

For a deployed beta, create two isolated KV namespaces on the test Worker/Pages project and bind them with the exact names `CMS_DRAFTS` and `CMS_MEDIA`. If either binding is absent, capability discovery remains honest: the dashboard reports the missing service, drafts fall back to browser recovery, and media fields retain manual path editing.

## Deliberate boundaries

- Draft save and media staging do not render a preview, write Git, publish content, or deploy Pages.
- Published repository content remains the editor baseline, not an autosave destination.
- Reset requires confirmation and discards both the browser recovery copy and the matching server draft.
- Preview begins at Milestone 11 after the final `/mockup` is supplied.

## Verification

Tests cover save/read/delete, invalid-document rejection, stale-revision conflicts, encoded route IDs, recovery-envelope migration, staged-media references, and API response parsing. Live browser verification covered both design and photography drafts, explicit saves, idle autosave, reload recovery, invalid local-only recovery, media attachment recovery, a 390×844 responsive viewport with no horizontal overflow, and an empty warning/error console.

