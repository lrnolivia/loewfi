import type {
  Hero,
  ImageAsset,
  MetadataItem,
  ProjectType,
} from '../shared/content/types.js';
import { relativeAssetUrl } from './assets.js';
import { escapeHtml, renderRichText } from './escape.js';
import type { RenderContext } from './types.js';

export function renderHead(title: string, context: RenderContext): string {
  const sharedCss = relativeAssetUrl(context.artifactPath, 'mockup/shared.css');
  const materialCss = relativeAssetUrl(context.artifactPath, 'mockup/sohum-glass.css');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)} — loew.fi</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${escapeHtml(sharedCss)}">
<link rel="stylesheet" href="./renderer.css">
<link rel="stylesheet" href="${escapeHtml(materialCss)}">
</head>`;
}

export function renderNav(currentSlug: string, context: RenderContext): string {
  const { siteConfig, projectsBySlug } = context;
  const dropdown = (projectType: ProjectType) => {
    const track = siteConfig.tracks.find((item) => item.projectType === projectType);
    const slugs = siteConfig.projectOrder[projectType];
    const first = slugs[0] ? `./${slugs[0]}.html` : './home.html';
    const items = slugs.map((slug) => {
      const project = projectsBySlug.get(slug);
      const current = slug === currentSlug ? ' aria-current="page"' : '';
      return `<a href="./${escapeHtml(slug)}.html"${current}>${escapeHtml(project?.title ?? slug)}</a>`;
    }).join('\n              ');
    return `<li class="nav-drop">
            <a href="${first}" role="button">${escapeHtml(track?.label ?? projectType)} <span class="caret"></span></a>
            <div class="nav-drop__panel-wrap">
              <div class="nav-drop__panel glass">
                ${items}
              </div>
            </div>
          </li>`;
  };

  return `<div class="nav-wrap">
    <div class="nav-pill glass">
      <div class="nav-pill__content">
        <a href="./home.html" class="brand">loew.fi</a>
        <ul class="nav-links">
          <li><a href="./home.html"${currentSlug === 'home' ? ' aria-current="page"' : ''}>Main</a></li>
          ${dropdown('photography')}
          ${dropdown('design')}
          <li><a href="./about.html"${currentSlug === 'about' ? ' aria-current="page"' : ''}>About</a></li>
        </ul>
      </div>
      <a href="./contact.html" class="nav-cta"${currentSlug === 'contact' ? ' aria-current="page"' : ''}>Contact</a>
    </div>
  </div>`;
}

export function renderFooter(context: RenderContext): string {
  const { site, contact } = context.siteConfig;
  return `<footer>
    <span>${escapeHtml(site.footerCopyright)}</span>
    <span><a href="${escapeHtml(contact.instagramUrl)}">Instagram</a> &nbsp;/&nbsp; <a href="mailto:${escapeHtml(contact.email)}">Email</a></span>
  </footer>`;
}

export function renderPageHero(
  hero: Hero,
  title: string,
  eyebrow: string,
  summary: string,
  context: RenderContext,
  variant: 'article' | 'gallery' | 'about' = 'article',
): string {
  const url = assetUrl(hero.image, context);
  const className = variant === 'gallery' ? ' page-hero--gallery' : variant === 'about' ? ' page-hero--about' : '';
  const toneClass = hero.tone === 'softened-artwork'
    ? ' photo-fill--soften'
    : hero.tone === 'muted-photo' ? ' photo-fill--muted' : '';
  const grainClass = hero.tone === 'softened-artwork' ? ' hero-grain' : '';
  const style = `background-image:url(&quot;${escapeHtml(url)}&quot;);--hero-x:${hero.focalPoint.x * 100}%;--hero-y:${hero.focalPoint.y * 100}%;--hero-attachment:${hero.attachment};`;
  return `<section class="page-hero${className}${grainClass}">
    <div class="photo-fill${toneClass} scrim-bottom" style="${style}"></div>
    <div class="page-hero-content">
      <div class="eyebrow on-dark mono"><i></i>${escapeHtml(eyebrow)}</div>
      <h1>${escapeHtml(title)}</h1>${summary ? `
      <p class="lede">${summary}</p>` : ''}
    </div>
  </section>`;
}

export function renderMetadata(items: MetadataItem[]): string {
  return `<dl>
        ${items.map((item) => `<dt>${escapeHtml(item.label)}</dt>
        <dd>${renderRichText(item.value)}</dd>`).join('\n        ')}
      </dl>`;
}

export function renderImage(image: ImageAsset, context: RenderContext): string {
  const source = assetUrl(image, context);
  const dimensions = image.web.width && image.web.height
    ? ` width="${image.web.width}" height="${image.web.height}"`
    : '';
  return `<img src="${escapeHtml(source)}" alt="${escapeHtml(image.alt)}"${dimensions}>`;
}

export function renderLinkedImage(image: ImageAsset, context: RenderContext): string {
  const rendered = renderImage(image, context);
  if (!image.full) return rendered;
  const full = relativeAssetUrl(context.artifactPath, image.full.path);
  return `<a href="${escapeHtml(full)}" aria-label="View full-size image: ${escapeHtml(image.alt)}">${rendered}</a>`;
}

export function renderRuntimeScripts(context: RenderContext, gallery = false): string {
  const dynamicColor = relativeAssetUrl(context.artifactPath, 'mockup/dynamic-color.js');
  const material = relativeAssetUrl(context.artifactPath, 'mockup/sohum-glass.js');
  return `<script type="module" src="${escapeHtml(dynamicColor)}"></script>${gallery ? '\n<script type="module" src="./gallery-switcher.js"></script>' : ''}
<script type="module" src="${escapeHtml(material)}"></script>`;
}

export function assetUrl(image: ImageAsset, context: RenderContext): string {
  return relativeAssetUrl(context.artifactPath, image.web.path);
}
