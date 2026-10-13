# Asset naming & folder convention

This describes how images are organized and named across the site, so new
projects and pages can be added later without breaking the pattern.

## Folder structure

```
assets/
  images/          photography work (pages under /images/)
    home/          images used on the homepage only
    avedalife/
    avedastudio/
    islesashore/
    magnoliafields/
    leavesleos/
  graphics/        design/branding work (pages under /graphics/)
    hydroviv/
    delta-ascencion/
    glorybe/
    cksteele/
    promotional/
    misc/
  css/
  js/
```

Every page that shows a gallery gets its own subfolder, named after that
page's URL slug. `assets/images/<slug>/` pairs with `images/<slug>.html`,
and `assets/graphics/<slug>/` pairs with `graphics/<slug>.html`.

- `assets/images/` = photography (anything under the "Photo" nav menu)
- `assets/graphics/` = design/branding work (anything under the "Design" nav menu)

## File naming

Inside each project folder, files are named:

```
<slug>-<number>.<ext>
```

- `<slug>` matches the folder/page name exactly (lowercase, hyphenated)
- `<number>` is a two-digit, zero-padded index (`01`, `02`, ... `10`, `11`)
  starting at `01`, in the same order the images appear on the page
- `<ext>` is the original file extension, lowercased (`.jpeg` was
  normalized to `.jpg`)

Examples:

```
assets/images/avedalife/avedalife-01.jpg
assets/images/avedalife/avedalife-02.jpg
...
assets/graphics/hydroviv/hydroviv-01.png
assets/graphics/hydroviv/hydroviv-02.jpg
```

Names are generic on purpose — they don't describe the image content, just
its project and position. That keeps renaming mechanical (no need to look
at each photo) and keeps sort order predictable.

## Adding a new project

1. Decide whether it's photography or design work.
2. Pick a slug for it (e.g. `newproject`).
3. Create `assets/images/newproject/` or `assets/graphics/newproject/`.
4. Drop images in as `newproject-01.jpg`, `newproject-02.jpg`, etc., in
   display order.
5. Copy an existing page (e.g. `graphics/hydroviv.html`) to
   `graphics/newproject.html` (or the `images/` equivalent), update the
   `<title>`, the `<h1>`, the intro paragraph, and the `.gallery` figures
   to point at the new folder.
6. Add a link to the new page in the "Photo" or "Design" dropdown in the
   shared nav markup (repeated at the top of every page — see
   `README.md` for the full list of files that need the nav update), and
   add a card to `photo.html` or `design.html` if you want it on the hub
   grid.

## Why not real/descriptive filenames?

Per the current pass, filenames were intentionally kept generic
(`slug-01.jpg`, not `hydroviv-red-bottle.jpg`) rather than scanned and
labeled by content. If descriptive names are wanted later, they can be
added without changing the convention — just replace the number with a
short descriptor and keep it lowercase-hyphenated, e.g.
`hydroviv-red-bottle-ad.jpg`.
