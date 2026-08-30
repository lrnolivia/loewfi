import type {
  AboutPage,
  ContactPage,
  DesignProject,
  Figure,
  HomePage,
  PhotographyProject,
  ProjectDocument,
} from '../shared/content/types.js';
import { renderBlocks, renderOnThisPage } from './blocks.js';
import { escapeHtml, renderRichText } from './escape.js';
import {
  assetUrl,
  renderFooter,
  renderHead,
  renderImage,
  renderLinkedImage,
  renderMetadata,
  renderNav,
  renderPageHero,
  renderRuntimeScripts,
} from './partials.js';
import type { RenderContext } from './types.js';

export function renderProject(project: ProjectDocument, context: RenderContext): string {
  return project.projectType === 'design'
    ? renderDesignProject(project, context)
    : renderPhotographyProject(project, context);
}

export function renderDesignProject(project: DesignProject, context: RenderContext): string {
  return `${renderHead(project.title, context)}
<body class="cat-design">
  ${renderNav(project.slug, context)}
  ${renderPageHero(project.hero, project.title, project.eyebrow, renderRichText(project.summary), context)}
  <main class="article article--project">
    <aside class="article__sidebar">
      ${renderMetadata(project.metadata)}
      ${renderOnThisPage(project.body)}
    </aside>
    <div class="article__body">
      ${renderBlocks(project.body, context)}
    </div>
  </main>
  ${renderFooter(context)}
  ${renderRuntimeScripts(context)}
</body>
</html>
`;
}

export function renderPhotographyProject(project: PhotographyProject, context: RenderContext): string {
  const shown = project.gallery.figures.length;
  return `${renderHead(project.title, context)}
<body class="cat-photo">
  ${renderNav(project.slug, context)}
  ${renderPageHero(project.hero, project.title, project.eyebrow, renderRichText(project.summary), context, 'gallery')}
  <div class="gwrap">
    <div class="gallery-bar">
      <p class="gnote">${shown} of ${project.gallery.collectionSize}</p>
      ${renderViewSwitcher()}
    </div>
    <div class="gallery" data-view="grid" id="gallery">
      ${project.gallery.figures.map((figure) => renderGalleryFigure(figure, context)).join('\n      ')}
    </div>
    <div class="carousel-controls" id="carouselControls">
      <button type="button" id="prevBtn" aria-label="Previous image">‹</button>
      <span class="carousel-controls__count" id="carouselCount">1 / ${shown}</span>
      <button type="button" id="nextBtn" aria-label="Next image">›</button>
    </div>
  </div>
  ${renderFooter(context)}
  ${renderRuntimeScripts(context, true)}
</body>
</html>
`;
}

export function renderAbout(page: AboutPage, context: RenderContext): string {
  const widget = page.sidebarWidget
    ? `<div class="facts-plate">
        <div class="plate card-tilt">
          <h4>${escapeHtml(page.sidebarWidget.title)}</h4>
          <ul>${page.sidebarWidget.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </div>
      </div>`
    : '';
  return `${renderHead(page.title, context)}
<body class="cat-neutral">
  ${renderNav(page.slug, context)}
  ${renderPageHero(page.hero, page.personName, 'About', '', context, 'about')}
  <main class="article article--about">
    <aside class="article__sidebar">
      ${renderMetadata(page.metadata)}
      ${widget}
      ${renderOnThisPage(page.body)}
    </aside>
    <div class="article__body">
      ${renderBlocks(page.body, context)}
    </div>
  </main>
  ${renderFooter(context)}
  ${renderRuntimeScripts(context)}
</body>
</html>
`;
}

export function renderHome(page: HomePage, context: RenderContext): string {
  const heroUrl = assetUrl(page.hero.image, context);
  const style = `background-image:url(&quot;${escapeHtml(heroUrl)}&quot;);--hero-x:${page.hero.focalPoint.x * 100}%;--hero-y:${page.hero.focalPoint.y * 100}%;--hero-attachment:${page.hero.attachment};`;
  const cards = page.selectedProjectSlugs.map((slug) => {
    const project = context.projectsBySlug.get(slug);
    if (!project) return '';
    return `<a href="./${escapeHtml(slug)}.html" class="teaser-card">
        <div class="teaser-card__frame"><div class="teaser-card__frame-inner">${renderImage(project.hero.image, context)}</div></div>
        <div class="teaser-card__meta">
          <span class="teaser-card__track mono">${project.projectType === 'photography' ? 'Photo' : 'Design'}</span>
          <h3 class="teaser-card__title">${escapeHtml(project.title)}</h3>
          <p class="teaser-card__desc">${renderRichText(project.summary)}</p>
        </div>
      </a>`;
  }).join('\n      ');

  return `${renderHead(page.title, context)}
<body class="cat-neutral">
  ${renderNav(page.slug, context)}
  <section class="hero">
    <div class="photo-fill scrim-top" style="${style}"></div>
    <div class="grain-line"></div>
    <div class="tag-corner mono">LOEW FIDELITY<br>FIELD NOTES</div>
    <div class="hero-card">
      <div class="hero-card-inner paper card-tilt">
        <div class="eyebrow"><i></i>${escapeHtml(page.hero.eyebrow)}</div>
        <h1>${renderRichText(page.hero.headline)}</h1>
        <p class="sub">${renderRichText(page.hero.introduction)}</p>
        <div class="actions">${page.hero.actions.map((action, index) => `<a href="${escapeHtml(generatedHref(action.href))}" class="${index === 0 ? 'btn-primary' : 'btn-ghost'}">${escapeHtml(action.label)}</a>`).join('')}</div>
      </div>
    </div>
  </section>
  <section class="work">
    <div class="work-head"><h2>Selected work</h2></div>
    <div class="work-grid">
      ${cards}
    </div>
  </section>
  <section class="tracks"><div class="tracks-inner">
    ${page.trackIntroductions.map((track) => `<div class="track"><h3>${escapeHtml(track.title)}</h3><p>${renderRichText(track.description)}</p><a href="./${escapeHtml(context.siteConfig.projectOrder[track.projectType][0] ?? 'home')}.html">${escapeHtml(track.actionLabel)} →</a></div>`).join('\n    ')}
  </div></section>
  ${renderFooter(context)}
  ${renderRuntimeScripts(context)}
</body>
</html>
`;
}

export function renderContact(page: ContactPage, context: RenderContext): string {
  const heroUrl = assetUrl(page.hero.image, context);
  const style = `background-image:url(&quot;${escapeHtml(heroUrl)}&quot;);--hero-x:${page.hero.focalPoint.x * 100}%;--hero-y:${page.hero.focalPoint.y * 100}%;`;
  return `${renderHead(page.title, context)}
<body class="cat-neutral">
  ${renderNav(page.slug, context)}
  <section class="hero">
    <div class="photo-fill scrim-full" style="${style}"></div>
    <div class="contact-panel paper">
      <div class="eyebrow"><i></i>${escapeHtml(page.eyebrow)}</div>
      <h1>${renderRichText(page.headline)}</h1>
      <p class="sub">${renderRichText(page.introduction)}</p>
      <form class="contact-form" action="mailto:${escapeHtml(page.form.delivery.recipientEmail)}" method="GET" enctype="text/plain">
        <input type="hidden" name="subject" value="${escapeHtml(page.form.delivery.subject)}">
        <div class="row">
          <div class="field"><label for="name">Name</label><input type="text" id="name" name="name" required></div>
          <div class="field"><label for="email">Email</label><input type="email" id="email" name="email" required></div>
        </div>
        <div class="field"><label for="message">${escapeHtml(page.form.messageLabel)}</label><textarea id="message" name="body" required></textarea></div>
        <button type="submit" class="btn-primary">${escapeHtml(page.form.submitLabel)}</button>
      </form>
      <div class="direct">${page.directLinks.map((link) => `<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`).join('')}</div>
    </div>
  </section>
  ${renderFooter(context)}
  ${renderRuntimeScripts(context)}
</body>
</html>
`;
}

function renderGalleryFigure(figure: Figure, context: RenderContext): string {
  return `<figure class="g-item">${renderLinkedImage(figure.image, context)}${figure.caption ? `<figcaption>${renderRichText(figure.caption)}</figcaption>` : ''}</figure>`;
}

function renderViewSwitcher(): string {
  return `<div class="view-switch glass" role="group" aria-label="Gallery view">
        ${(['grid', 'natural', 'strip', 'story', 'carousel'] as const).map((view, index) => `<button type="button" data-set-view="${view}" aria-pressed="${index === 0}">${view[0].toUpperCase()}${view.slice(1)}</button>`).join('\n        ')}
      </div>`;
}

function generatedHref(href: string): string {
  if (!href.startsWith('/')) return href;
  const slug = href.slice(1) || 'home';
  return `./${slug}.html`;
}
