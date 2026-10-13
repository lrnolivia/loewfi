# loewfidelity — site

Static portfolio site. Plain HTML/CSS/JS, no build step, no framework,
no third-party runtime. Meant to be served as-is from a private
server / Cloudflare Pages or Workers.

## Structure

```
index.html            home
photo.html             photography hub (links to images/*)
design.html           design hub (links to graphics/*)
contact.html
images/                one page per photography project
graphics/               one page per design project
assets/
  css/style.css        all site styles
  js/main.js           nav toggle, gallery lightbox, contact form
  images/<slug>/       photography assets, one folder per project
  graphics/<slug>/     design assets, one folder per project
ASSET-NAMING.md        image folder/file naming convention
robots.txt
_redirects             Cloudflare Pages clean-URL routing
```

See `ASSET-NAMING.md` before adding images to a page.

## Editing a page

Every page is a self-contained HTML file — no templating engine. The
header nav, footer, and `<head>` are repeated at the top of each file
rather than pulled from a shared partial, since this is a static
no-build site. When you change the nav (add a project, rename one),
update it in all 14 HTML files, or introduce a build step
(11ty/Astro/etc.) if that becomes worth the tradeoff.

Each gallery page follows the same shape:

```html
<div class="page-intro">
  <span class="eyebrow">Design</span>
  <h1>Project Title</h1>
  <p class="lede">One paragraph description.</p>
</div>
<div class="gallery">
  <figure data-full="../assets/graphics/slug/slug-01.jpg">
    <img src="../assets/graphics/slug/slug-01.jpg" loading="lazy" alt="...">
  </figure>
  <!-- one <figure> per image -->
</div>
```

`.gallery` is a CSS grid mosaic (see `assets/css/style.css`, `.gallery`
rules) — it does not require JS to lay out. `data-full` on each
`<figure>` is what `main.js` reads to power the click-through lightbox;
if you add a `<figure>` without `data-full`, it just won't open in the
lightbox and will still render fine in the grid.

## Adding a new project page

1. Add images under `assets/images/<slug>/` or `assets/graphics/<slug>/`
   following `ASSET-NAMING.md`.
2. Copy the closest existing page in `images/` or `graphics/` as a
   starting point, update the title/intro/gallery figures.
3. Add a nav link in the Photo or Design dropdown on all pages.
4. Add a card to `photo.html` or `design.html` if it should show on the
   hub grid.

## Contact form

`contact.html`'s form posts (via `fetch`, in `main.js`) to the path set
in `CONTACT_ENDPOINT` at the top of `initContactForm()` — currently
`/api/contact`, a placeholder. Point it at a real endpoint (e.g. a
Cloudflare Worker route that emails or forwards the submission) before
relying on it; until then the form falls back to a `mailto:` link on
failure.

## Notes on this rebuild

The previous build was exported from Squarespace and depended on
Squarespace's hosted runtime (dynamic gallery/carousel JS, font CDN,
commerce cart, tracking config) — none of which resolves once the site
is served from elsewhere, which is why the old carousels didn't work.
This version replaces that with:

- static CSS grid mosaics + a small vanilla-JS lightbox instead of the
  Squarespace carousel/slideshow gallery blocks
- self-hosted system fonts instead of Squarespace's font service
- real `<form>` markup instead of a Squarespace-injected form block
- the commerce cart page removed (unused — no products)
- all image assets renamed and sorted into per-project folders (see
  `ASSET-NAMING.md`)
