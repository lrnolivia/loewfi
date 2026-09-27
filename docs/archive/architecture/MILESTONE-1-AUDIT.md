# Milestone 1 takeover audit

## Actual repository

- Vite 6 builds a root React 19 landing page plus six static HTML mockup entries.
- At audit start, the root React page imported the vendored Ybouane renderer. During this milestone, a separate agent's uncommitted Sohum migration appeared in the shared working tree. Those public-site changes are externally owned and were not modified as part of the CMS foundation.
- `mockup/` contains the approved portfolio reference pages and their shared CSS/behavior.
- `portfolio/` contains the older, fuller static site and the real organized asset archive.
- Before this milestone there was no `/admin`, Pages Function, TypeScript configuration, test suite, canonical data directory, draft store, renderer/build pipeline, or publisher.
- Cloudflare deployment behavior currently comes from Vite output plus `public/_redirects`; there is no Wrangler configuration.

## Inherited-component classification

| Component | Classification | Reason |
| --- | --- | --- |
| Cloudflare Access + `whoami` Function concept | Keep / port | Correct zero-custom-auth boundary; ported into the live repo as TypeScript. Live Access configuration still needs account-level verification. |
| Claude vanilla admin shell | Replace | It proved the route concept, but the controlling directive requires a React + TypeScript application foundation. |
| Block renderer functions | Port logic | Pure rendering, escaping, first-paragraph handling, and derived heading navigation are useful. CommonJS, inline presentation, missing validation, and schema assumptions should not be activated unchanged. |
| Article assembler/partials | Refactor | Deterministic composition is sound; hardcoded nav tracks, footer year/contact assumptions, unsafe About widget interpolation, and missing link-rich text require redesign. |
| Extracted gallery switcher | Port logic | Generic view-state behavior is separable, but it needs empty-state guards, accessibility checks, and integration with the final public architecture. |
| Shared CSS additions | Prototype/reference only | Captures real reusable patterns, but was never visually tested and must be reconciled with the incoming public design system. |
| Claude content schema | Refactor in Milestone 2 | It is grounded in real pages and a good starting vocabulary, but several authoring and rendering gaps remain. |
| GitHub atomic publishing design | Keep concept | Atomic Git Data API commits, deterministic artifacts, and server-only credentials remain correct; implementation has not begun. |
| KV draft model | Keep concept / define later | The separation is correct, while keying, migrations, concurrency, and retention are unspecified. |
| Mockup HTML/CSS/JS | Prototype/reference only | It is approved design/content evidence, not a safe canonical source or final build system. |
| Old `portfolio/` pages/assets | Keep as source/reference | They hold the complete archive and naming convention; their duplicated hand-authored pages are not the new CMS renderer. |
| Root Ybouane landing implementation | Replace by incoming project | It is explicitly superseded. The separate Sohum migration is now present as concurrent uncommitted work and remains outside this milestone's changes. |

## Content-model audit

Claude correctly separated narrative design projects from flat photo galleries, modeled flexible metadata, represented image groupings explicitly, derived section navigation from headings, and treated About as structured editorial content rather than a one-off HTML blob.

Milestone 2 must resolve these findings before the schema becomes canonical:

- Links and inline emphasis are present in About, but `paragraph.text` escapes all markup and cannot represent them.
- Heading IDs derived only from text need collision handling and stable IDs when headings are renamed.
- Hero art direction needs more than `soften`: the real pages use focal position, fixed-background behavior, and hand-tuned filters.
- Image data includes `full` variants in the proposal, but inherited renderers emit only `web`; lightbox/download intent is therefore unrepresented in output.
- `plate` needs layout intent beyond `full|narrow` (CK Steele uses centered width and custom rhythm).
- Captions are treated inconsistently as optional versus required across image group blocks.
- The photo gallery's “16 of 44” note exposes the difference between a displayed subset and a full collection, which the flat `images` proposal does not model.
- Site-page fields are underspecified for Home and Contact, including actions, selected-work cards, contact-form behavior, and direct contact links.
- Flexible `meta` values need a safe rich-value/link model for About's email rather than raw HTML.
- Track configuration and the proposed project `track` union need a clear extension/versioning policy.
- Slugs, paths, asset extensions, duplicate order values, minimum/maximum group sizes, and alt-text rules need runtime validation.

## Renderer audit

The pure-function direction can survive independently of React. Escaping, block dispatch, deterministic joins, derived navigation, reusable partials, and per-instance strip column counts are worth porting with tests.

The current prototype should not be promoted wholesale because it is unexecuted CommonJS, has unsafe unescaped About widget values and document titles, hardcodes two tracks and footer details, ignores `full` media, cannot express inline links, and does not include the gallery renderer or build/diff harness. The final renderer also needs an explicit artifact model so publishing never performs string replacement.

## Liquid Glass readiness

Admin business components import only the local design-system boundary. The temporary foundation styles use opaque surfaces and do not imitate a glass renderer. The incoming implementation can replace or extend those primitives without changing CMS data flow. No new dependency on Ybouane, Sohum, SVG filters, canvas, or WebGL was introduced.
