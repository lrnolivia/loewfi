import { useEffect, useState } from 'react';
import { LiquidGlass } from '@sohumsuthar/liquid-glass';
import { useLiquidGlassEffects } from '@sohumsuthar/liquid-glass/hooks';
import mossUrl from './assets/img/moss.jpg?url';
import contactHeroUrl from './assets/img/contact-hero.jpg?url';

const localImages = { 'moss.jpg': mossUrl, 'contact-hero.jpg': contactHeroUrl };
const img = (name) => localImages[name];
const portfolioAssetUrls = import.meta.glob('../portfolio/assets/**/*.{jpg,jpeg,png,webp,avif}', { eager: true, query: '?url', import: 'default' });
const portfolioImg = (path) => portfolioAssetUrls[`../portfolio/assets/${path}`];
const numberedImages = (directory, prefix, count, extensions = {}) => Array.from({ length: count }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');
  return `${directory}/${prefix}-${number}.${extensions[index + 1] || 'jpg'}`;
});

const photographyProjects = {
  avedalife: {
    title: 'Aveda Lifestyle',
    eyebrow: 'Photo — lifestyle',
    description: 'Aveda Institute Tallahassee Masters Photoshoot, 2018.',
    images: numberedImages('images/avedalife', 'avedalife', 42),
  },
  avedastudio: {
    title: 'Aveda Studio',
    eyebrow: 'Photo — studio beauty',
    description: 'A season of studio beauty work — hair, light, and forty-four frames.',
    images: numberedImages('images/avedastudio', 'avedastudio', 44),
    captions: { 4: 'Ashelli — updo detail', 11: 'Brittany — studio light', 22: 'Gabby — color work', 30: 'Nina — braid detail' },
  },
  islesashore: {
    title: 'Isles Ashore',
    eyebrow: 'Photo — landscape',
    description: 'St. George Island, Florida.',
    images: numberedImages('images/islesashore', 'islesashore', 10),
  },
  magnoliafields: {
    title: 'Magnolia Fields',
    eyebrow: 'Photo — landscape',
    description: 'Maclay Gardens and Lake Jackson, Florida.',
    images: numberedImages('images/magnoliafields', 'magnoliafields', 10),
  },
  leavesleos: {
    title: 'Leaves & Leos',
    eyebrow: 'Photo — portrait',
    description: 'Photoshoot with Steven Frasier.',
    images: numberedImages('images/leavesleos', 'leavesleos', 11),
  },
};

const designArchiveProjects = {
  'delta-ascencion': {
    title: 'Ascencion',
    eyebrow: 'Design — brand extension',
    description: 'A brand extension exercise imagining a commercial spaceflight expansion of Delta Air Lines.',
    images: numberedImages('graphics/delta-ascencion', 'delta-ascencion', 19),
  },
  glorybe: {
    title: 'Glory Be',
    eyebrow: 'Design — publication & typography',
    description: 'A magazine-style lyric and album booklet for Britney Spears’ ninth studio album, Glory.',
    images: numberedImages('graphics/glorybe', 'glorybe', 16),
  },
  promotional: {
    title: 'Promotional Material',
    eyebrow: 'Design — promotional',
    description: 'Individual promotional pieces.',
    images: numberedImages('graphics/promotional', 'promotional', 6, { 5: 'png', 6: 'png' }),
  },
  misc: {
    title: 'Misc',
    eyebrow: 'Design — freelance archive',
    description: 'Freelance design with a focus on pop culture and celebrities.',
    images: numberedImages('graphics/misc', 'misc', 7),
  },
};

const photoSlugs = Object.keys(photographyProjects);
const designSlugs = ['hydroviv', 'cksteele', ...Object.keys(designArchiveProjects)];
const projectCatalog = {
  ...Object.fromEntries(Object.entries(photographyProjects).map(([slug, project]) => [slug, {
    ...project,
    slug,
    track: 'Photo',
    cover: project.images[0],
  }])),
  hydroviv: {
    slug: 'hydroviv',
    track: 'Design',
    title: 'Hydroviv',
    eyebrow: 'Design — print & marketing',
    description: 'Advertisement, print and marketing material for a custom water-filtration company.',
    cover: 'graphics/hydroviv/hydroviv-01.png',
  },
  cksteele: {
    slug: 'cksteele',
    track: 'Design',
    title: 'CK Steele Plaza',
    eyebrow: 'Design — public mural',
    description: 'A mural tracing the history and future of public transportation in Tallahassee.',
    cover: 'graphics/cksteele/cksteele-07.jpg',
  },
  ...Object.fromEntries(Object.entries(designArchiveProjects).map(([slug, project]) => [slug, {
    ...project,
    slug,
    track: 'Design',
    cover: project.images[0],
  }])),
};
const designCatalogSlugs = ['hydroviv', 'delta-ascencion', 'glorybe', 'cksteele', 'promotional', 'misc'];
const featuredSlugs = ['avedastudio', 'hydroviv', 'cksteele', 'islesashore', 'delta-ascencion', 'glorybe'];
const socialImageForPage = (page) => {
  if (projectCatalog[page]) return portfolioImg(projectCatalog[page].cover);
  if (page === 'photo') return portfolioImg('images/home/home-01.jpg');
  if (page === 'design') return portfolioImg('graphics/delta-ascencion/delta-ascencion-01.jpg');
  if (page === 'contact') return contactHeroUrl;
  return mossUrl;
};
const lens = {
  nav: { bezel: 16, refraction: 1.2, dispersion: 5, radius: 40 },
  panel: { bezel: 12, refraction: 1.05, dispersion: 2, radius: 16 },
  control: { bezel: 10, refraction: 1, dispersion: 2, radius: 40 },
};

const routePath = (page) => page === 'index' ? '/' : `/${page}`;
const pageKey = () => {
  const pathname = decodeURIComponent(window.location.pathname).replace(/\/+$/, '');
  if (!pathname) return 'index';
  const file = pathname.split('/').pop() || 'index';
  return file.replace(/\.html$/, '') || 'index';
};

function useDynamicFrameColors(page) {
  useEffect(() => {
    const cleanups = [];
    const apply = (image, target) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 24;
      const context = canvas.getContext('2d');
      try {
        context.drawImage(image, 0, 0, 24, 24);
        const pixels = context.getImageData(0, 0, 24, 24).data;
        let red = 0, green = 0, blue = 0;
        for (let i = 0; i < pixels.length; i += 4) { red += pixels[i]; green += pixels[i + 1]; blue += pixels[i + 2]; }
        const count = pixels.length / 4;
        const tint = [red, green, blue].map((value, channel) => Math.round((value / count) * .55 + [241, 236, 223][channel] * .45));
        target.style.setProperty('--frame-color', `rgb(${tint.join(',')})`);
        target.style.setProperty('--frame-text', (.299 * tint[0] + .587 * tint[1] + .114 * tint[2]) / 255 > .6 ? '#3E3B33' : '#F1ECDF');
      } catch { /* CSS defaults remain if canvas sampling is unavailable. */ }
    };
    document.querySelectorAll('.teaser-card__frame-inner img, .plate img').forEach((image) => {
      const target = image.closest('.teaser-card__frame, .plate');
      if (!target) return;
      if (image.complete && image.naturalWidth) apply(image, target);
      else {
        const onLoad = () => apply(image, target);
        image.addEventListener('load', onLoad);
        cleanups.push(() => image.removeEventListener('load', onLoad));
      }
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [page]);
}

function Glass({ className = '', contentClassName = '', options = lens.panel, variant = 'clear', children, ...props }) {
  return <LiquidGlass macro variant={variant} dimmed lens lensOptions={options} className={className} contentClassName={contentClassName} {...props}>{children}</LiquidGlass>;
}

function Navbar({ page }) {
  const [open, setOpen] = useState(false);
  const mobileLink = (slug, label) => <a href={routePath(slug)} aria-current={page === slug ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</a>;
  return <nav className="nav-wrap" aria-label="Primary">
    <Glass className="nav-pill" contentClassName="nav-pill__glass-content" options={lens.nav}>
      <div className="nav-pill__content">
        <a href={routePath('index')} className="brand">loew.fi</a>
        <ul className="nav-links">
          <li><a href={routePath('index')} aria-current={page === 'index' ? 'page' : undefined}>Main</a></li>
          <li className="nav-drop">
            <a href={routePath('photo')} aria-current={page === 'photo' || photoSlugs.includes(page) ? 'page' : undefined}>Photo <span className="caret" /></a>
            <div className="nav-drop__panel-wrap"><Glass className="nav-drop__panel" contentClassName="nav-drop__panel-content">
              <a href={routePath('photo')} aria-current={page === 'photo' ? 'page' : undefined}>All photography</a><a href={routePath('avedalife')} aria-current={page === 'avedalife' ? 'page' : undefined}>Aveda Lifestyle</a><a href={routePath('avedastudio')} aria-current={page === 'avedastudio' ? 'page' : undefined}>Aveda Studio</a><a href={routePath('islesashore')} aria-current={page === 'islesashore' ? 'page' : undefined}>Isles Ashore</a><a href={routePath('magnoliafields')} aria-current={page === 'magnoliafields' ? 'page' : undefined}>Magnolia Fields</a><a href={routePath('leavesleos')} aria-current={page === 'leavesleos' ? 'page' : undefined}>Leaves &amp; Leos</a>
            </Glass></div>
          </li>
          <li className="nav-drop">
            <a href={routePath('design')} aria-current={page === 'design' || designSlugs.includes(page) ? 'page' : undefined}>Design <span className="caret" /></a>
            <div className="nav-drop__panel-wrap"><Glass className="nav-drop__panel" contentClassName="nav-drop__panel-content">
              <a href={routePath('design')} aria-current={page === 'design' ? 'page' : undefined}>All design</a><a href={routePath('hydroviv')} aria-current={page === 'hydroviv' ? 'page' : undefined}>Hydroviv</a><a href={routePath('delta-ascencion')} aria-current={page === 'delta-ascencion' ? 'page' : undefined}>Ascencion</a><a href={routePath('glorybe')} aria-current={page === 'glorybe' ? 'page' : undefined}>Glory Be</a><a href={routePath('cksteele')} aria-current={page === 'cksteele' ? 'page' : undefined}>CK Steele Plaza</a><a href={routePath('promotional')} aria-current={page === 'promotional' ? 'page' : undefined}>Promotional Material</a><a href={routePath('misc')} aria-current={page === 'misc' ? 'page' : undefined}>Misc</a>
            </Glass></div>
          </li>
          <li><a href={routePath('about')} aria-current={page === 'about' ? 'page' : undefined}>About</a></li>
        </ul>
      </div>
      <div className="nav-actions">
        <button type="button" className={`mobile-nav-toggle${open ? ' is-open' : ''}`} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}><span /><span /><span /></button>
        <a href={routePath('contact')} className="nav-cta" aria-current={page === 'contact' ? 'page' : undefined}>Contact</a>
      </div>
    </Glass>
    <Glass className={`mobile-nav-panel${open ? ' is-open' : ''}`} contentClassName="mobile-nav-panel__content" options={lens.panel} id="mobile-menu" aria-hidden={!open}>
      <div className="mobile-nav-group">{mobileLink('index', 'Main')}{mobileLink('about', 'About')}</div>
      <div className="mobile-nav-group"><span>Photo</span>{mobileLink('photo', 'All photography')}{mobileLink('avedalife', 'Aveda Lifestyle')}{mobileLink('avedastudio', 'Aveda Studio')}{mobileLink('islesashore', 'Isles Ashore')}{mobileLink('magnoliafields', 'Magnolia Fields')}{mobileLink('leavesleos', 'Leaves & Leos')}</div>
      <div className="mobile-nav-group"><span>Design</span>{mobileLink('design', 'All design')}{mobileLink('hydroviv', 'Hydroviv')}{mobileLink('delta-ascencion', 'Ascencion')}{mobileLink('glorybe', 'Glory Be')}{mobileLink('cksteele', 'CK Steele Plaza')}{mobileLink('promotional', 'Promotional Material')}{mobileLink('misc', 'Misc')}</div>
    </Glass>
  </nav>;
}

function Footer() {
  return <footer><span>© 2026 Lauren Olivia — loew.fi</span><span><a href="http://instagram.com/lrnolivia">Instagram</a> &nbsp;/&nbsp; <a href="mailto:me@loew.fi">Email</a></span></footer>;
}

function PageHero({ image, imageUrl, eyebrow, title, lede, className = '', soften = false }) {
  return <section className={`page-hero ${className}`}>
    <div className={`photo-fill${soften ? ' photo-fill--soften' : ''} scrim-bottom`} style={{ backgroundImage: `url('${imageUrl || img(image)}')` }} />
    <div className="page-hero-content"><div className="eyebrow on-dark mono"><i />{eyebrow}</div><h1>{title}</h1>{lede && <p className="lede">{lede}</p>}</div>
  </section>;
}

function ProjectGrid({ slugs }) {
  return <div className="work-grid">{slugs.map((slug) => {
    const project = projectCatalog[slug];
    return <a href={routePath(slug)} className="teaser-card" key={slug}><div className="teaser-card__frame"><div className="teaser-card__frame-inner"><img src={portfolioImg(project.cover)} alt="" loading="lazy" decoding="async" /></div></div><div className="teaser-card__meta"><span className="teaser-card__track mono">{project.track}</span><h3 className="teaser-card__title">{project.title}</h3><p className="teaser-card__desc">{project.description}</p></div></a>;
  })}</div>;
}

function Home() {
  return <><section className="hero home-hero">
    <div className="photo-fill scrim-top" style={{ backgroundImage: `url('${img('moss.jpg')}')` }} /><div className="grain-line" /><div className="tag-corner mono">LOEW FIDELITY<br />FIELD NOTES — VOL. 04</div>
    <div className="hero-card"><div className="hero-card-inner paper"><div className="eyebrow"><i />tallahassee, fl</div><h1>Twenty years of<br />making <span>things.</span></h1><p className="sub">A collection of design and photography by Lauren White — from personal and college projects to production assets for recording artists and D2C marketing.</p><div className="actions"><a href={routePath('avedastudio')} className="btn-primary">View the work</a><a href={routePath('about')} className="btn-ghost">About Lauren</a></div></div></div>
  </section>
  <section className="work anim-fadeUp"><div className="work-head"><h2>Selected work</h2><p>A mix of photography and design projects from the full portfolio archive.</p></div><ProjectGrid slugs={featuredSlugs} /></section>
  <section className="tracks"><div className="tracks-inner"><div className="track"><h3>Photo</h3><p>Finished photography — studio beauty work, coastal landscapes, lifestyle sets. Shown full-bleed, with a view switcher on every gallery so you can browse it the way that suits the set.</p><a href={routePath('photo')}>View all photography →</a></div><div className="track"><h3>Design</h3><p>Print, brand, and packaging work — presented as case studies, with the artifacts themselves framed like prints on a table rather than cropped into a photo grid.</p><a href={routePath('design')}>View all design →</a></div></div></section></>;
}

function PortfolioIndex({ track }) {
  const isPhoto = track === 'Photo';
  const slugs = isPhoto ? photoSlugs : designCatalogSlugs;
  const hero = isPhoto ? 'images/home/home-01.jpg' : 'graphics/delta-ascencion/delta-ascencion-01.jpg';
  return <><PageHero imageUrl={portfolioImg(hero)} eyebrow={`${track.toLowerCase()} — complete archive`} title={isPhoto ? 'Photography' : 'Design'} lede={isPhoto ? 'Studio beauty, lifestyle, portraiture, and the landscapes around North Florida.' : 'Brand, publication, promotional, and public-space work collected across the archive.'} />
    <main className="work portfolio-index"><div className="work-head"><h2>{slugs.length} projects</h2><p>Every collection currently available in the portfolio source archive.</p></div><ProjectGrid slugs={slugs} /></main>
  </>;
}

function About() {
  return <><PageHero image="moss.jpg" eyebrow="about" title="Lauren White" />
  <main className="article"><aside className="article__sidebar"><dl><dt>Based</dt><dd>Tallahassee, FL</dd><dt>Disciplines</dt><dd>Design, art direction, photography</dd><dt>Selected clients</dt><dd>Hydroviv, Delta (student), Britney Spears / Glory (student)</dd><dt>Contact</dt><dd><a href="mailto:me@loew.fi" className="text-link">me@loew.fi</a></dd></dl><div className="facts-plate"><div className="plate card-tilt"><h4>On the desk right now</h4><ul><li>Aveda Studio, season two</li><li>A print run for a friend's zine</li><li>This website</li></ul></div></div><nav aria-label="On this page"><a href="#story" className="is-active">The short version</a><a href="#practice">How I work</a><a href="#now">What's next</a></nav></aside>
  <div className="article__body"><h1 className="about-title">Twenty years of making things, most of them by hand first.</h1><p className="lede" id="story">I've been making things — collages, zines, posters, then album layouts and brand systems, then whatever a client actually needed — for about twenty years now. Some of it was for college. Some of it was for myself. A good amount of it, lately, is for people who need a system to sell water filters or fill a mural wall downtown.</p><p>I trained as a designer first, which is probably why even the photography leans toward composition and light over spontaneity — the beauty work in Aveda Studio is closer in spirit to the brand plates in Hydroviv than either of them is to a snapshot. I like problems with real constraints: a wall that's already there, a product that already exists, a client with an actual opinion about their own brand.</p><div className="pull"><img src={portfolioImg('images/avedastudio/avedastudio-07.jpg')} alt="Studio portrait from the Aveda Studio series" loading="lazy" decoding="async" /></div><h2 id="practice">How I work</h2><p>Most projects start on paper, not because it's precious but because it's faster to throw away. The CK Steele mural went through a dozen thumbnail passes before anyone saw a digital file. The same is mostly true of a shoot — I'd rather over-plan a set and improvise the actual frames than the other way around.</p><p>I still think in terms of print, even for screens — a page, a spread, a plate. It's part of why this site treats design work like objects on a table instead of tiles in a grid.</p><h2 id="now">What's next</h2><p>A second season of studio work with Aveda, and slowly getting the rest of the archive — Glory Be, the Ascencion brand exercise, a decade of miscellaneous print — properly organized here instead of scattered across old drives. If you've got a wall, a brand, or a water filter that needs a system, <a href={routePath('contact')} className="text-link">say hello</a>.</p></div></main></>;
}

const views = ['grid','natural','strip','story','carousel'];
function ViewIcon({ type }) {
  const paths = { grid:<><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/></>, natural:<><rect x="1" y="1" width="6" height="9"/><rect x="9" y="1" width="6" height="5"/><rect x="9" y="8" width="6" height="7"/></>, strip:<><rect x="1" y="3" width="3" height="10"/><rect x="6" y="3" width="4" height="10"/><rect x="12" y="3" width="3" height="10"/></>, story:<><rect x="2" y="1" width="12" height="6"/><rect x="2" y="9" width="12" height="6"/></>, carousel:<><rect x="3" y="2" width="10" height="12" rx="1"/><path d="M1 8h1.5M13.5 8H15"/></> };
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor">{paths[type]}</svg>;
}

function MediaLightbox({ images, current, title, onClose, onMove }) {
  useEffect(() => {
    if (current === null) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') onMove(-1);
      if (event.key === 'ArrowRight') onMove(1);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('lightbox-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('lightbox-open');
    };
  }, [current, onClose, onMove]);
  if (current === null) return null;
  return <div className="media-lightbox" role="dialog" aria-modal="true" aria-label={`${title} image viewer`} onClick={onClose}>
    <button type="button" className="media-lightbox__close" aria-label="Close image viewer" onClick={onClose}>×</button>
    <button type="button" className="media-lightbox__arrow is-prev" aria-label="Previous image" onClick={(event) => { event.stopPropagation(); onMove(-1); }}>‹</button>
    <figure onClick={(event) => event.stopPropagation()}><img src={portfolioImg(images[current])} alt={`${title} — image ${current + 1}`} /><figcaption>{current + 1} / {images.length}</figcaption></figure>
    <button type="button" className="media-lightbox__arrow is-next" aria-label="Next image" onClick={(event) => { event.stopPropagation(); onMove(1); }}>›</button>
  </div>;
}

function PhotographyGallery({ project }) {
  const [view,setView] = useState('grid'); const [current,setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const move = (delta) => setCurrent(i => (i + delta + project.images.length) % project.images.length);
  const moveLightbox = (delta) => setLightbox(i => (i + delta + project.images.length) % project.images.length);
  return <><PageHero imageUrl={portfolioImg(project.images[0])} eyebrow={project.eyebrow} title={project.title} lede={project.description} />
  <div className="gwrap"><div className="gallery-bar"><p className="gnote">{project.images.length} images — complete series</p><Glass className="view-switch" contentClassName="view-switch__content" options={lens.control} variant="clear" role="group" aria-label="Gallery view">{views.map(item => <button type="button" key={item} onClick={() => setView(item)} aria-pressed={view === item}><ViewIcon type={item}/>{item}</button>)}</Glass></div>
  <div className="gallery" data-view={view}>{project.images.map((src,i) => <figure className={`g-item${i === current ? ' is-active' : ''}`} key={src}><button type="button" className="media-open" onClick={() => setLightbox(i)} aria-label={`Open ${project.title} image ${i + 1}`}><img src={portfolioImg(src)} alt={`${project.title} — image ${i + 1}`} loading={i < 4 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'} decoding="async" /></button>{project.captions?.[i + 1] && <figcaption>{project.captions[i + 1]}</figcaption>}</figure>)}</div>
  <div className={`carousel-controls${view === 'carousel' ? ' is-active' : ''}`}><button type="button" onClick={() => move(-1)} aria-label="Previous image">‹</button><span className="carousel-controls__count">{current+1} / {project.images.length}</span><button type="button" onClick={() => move(1)} aria-label="Next image">›</button></div>
  <div className={`carousel-thumbs${view === 'carousel' ? ' is-active' : ''}`}>{project.images.map((src,i) => <button type="button" key={src} className={i === current ? 'is-active' : ''} onClick={() => setCurrent(i)} aria-label={`Go to image ${i+1}`}><img src={portfolioImg(src)} alt="" loading="lazy" decoding="async" /></button>)}</div></div>
  <MediaLightbox images={project.images} current={lightbox} title={project.title} onClose={() => setLightbox(null)} onMove={moveLightbox} /></>;
}

function DesignArchive({ project }) {
  const [lightbox, setLightbox] = useState(null);
  const moveLightbox = (delta) => setLightbox(i => (i + delta + project.images.length) % project.images.length);
  return <><PageHero imageUrl={portfolioImg(project.images[0])} eyebrow={project.eyebrow} title={project.title} lede={project.description} className="hero-grain" soften />
    <main className="archive"><header className="archive__intro"><div className="eyebrow on-dark"><i />visual archive</div><p>{project.description}</p></header><div className="archive-grid">{project.images.map((src, index) => <figure className="plate" key={src}><button type="button" className="media-open" onClick={() => setLightbox(index)} aria-label={`Open ${project.title} artifact ${index + 1}`}><img src={portfolioImg(src)} alt={`${project.title} — artifact ${index + 1}`} loading={index < 2 ? 'eager' : 'lazy'} decoding="async" /></button><figcaption>{project.title} — {String(index + 1).padStart(2, '0')}</figcaption></figure>)}</div></main>
    <MediaLightbox images={project.images} current={lightbox} title={project.title} onClose={() => setLightbox(null)} onMove={moveLightbox} />
  </>;
}

function Hydroviv() {
  return <><PageHero imageUrl={portfolioImg('graphics/hydroviv/hydroviv-01.png')} eyebrow="design — print & marketing" title="Hydroviv" lede="Advertisement, print and marketing material work for Hydroviv, a custom water-filtration company." className="hero-grain" soften />
  <main className="article"><CaseSidebar items={[['Client','Hydroviv'],['Role','Design'],['Medium','Print, direct mail, email'],['Deliverables','Trifold brochure, digital ad set']]} links={[['#brochure','The brochure'],['#digital','Digital set']]}/><div className="article__body"><p className="lede">Hydroviv builds water filters customized to a household's actual local water report — the brief called for print and digital material that could make “your water is specifically contaminated” feel useful rather than alarming.</p><h2 id="brochure">The brochure</h2><p>A trifold, meant to work as both a countertop leaflet and a direct-mail piece: one outward-facing panel to stop someone flipping past it, and an interior spread that does the actual explaining once they've opened it.</p><Plate portfolioSrc="graphics/hydroviv/hydroviv-01.png" caption="Outer spread — cover, QR-code offer panel, and back panel."/><Plate portfolioSrc="graphics/hydroviv/hydroviv-02.png" caption="Inner spread — the actual filter, spelled out."/><h2 id="digital">Digital set</h2><p>A matching set of digital assets built from the same system — an email header, a vertical social ad, and a pattern tile pulled from the brochure's wave motif for use across the rest of the campaign.</p><div className="plate-pair"><Plate portfolioSrc="graphics/hydroviv/hydroviv-03.jpg" caption="Email header"/><Plate portfolioSrc="graphics/hydroviv/hydroviv-04.jpg" caption="Vertical social ad"/></div><Plate portfolioSrc="graphics/hydroviv/hydroviv-05.jpg" caption="Wave pattern, extracted for reuse across the campaign." className="plate-narrow"/></div></main></>;
}

function CaseSidebar({ items, links }) { return <aside className="article__sidebar"><dl>{items.map(([dt,dd]) => <div key={dt}><dt>{dt}</dt><dd>{dd}</dd></div>)}</dl><nav aria-label="On this page">{links.map(([href,label],i) => <a href={href} className={i === 0 ? 'is-active' : ''} key={href}>{label}</a>)}</nav></aside>; }
function Plate({ src, portfolioSrc, caption, className='' }) { return <figure className={`plate ${className}`}><img src={portfolioSrc ? portfolioImg(portfolioSrc) : img(src)} alt={caption} loading="lazy" decoding="async" /><figcaption>{caption}</figcaption></figure>; }

function CKSteele() {
  const panels = [1,4,6,8,9];
  return <><PageHero imageUrl={portfolioImg('graphics/cksteele/cksteele-07.jpg')} eyebrow="design — public mural, college project" title="CK Steele Plaza" lede="A physical mural for Tallahassee's CK Steele Plaza, tracing the history and future of public transportation in the capital city." className="hero-grain ck-hero" />
  <main className="article"><CaseSidebar items={[['Context','College project'],['Site','CK Steele Plaza, Tallahassee'],['Medium','Large-format mural panels'],['Subject','StarMetro transit, past & future']]} links={[['#thenandnow','Then & now'],['#panels','The panel set']]}/><div className="article__body"><p className="lede">The plaza is Tallahassee's central transit hub — the brief was to design a mural that a rider actually waiting for a bus would read, not just glance past. The concept pairs a “past” and “now” illustration of the same route, then unpacks it across a run of transit-shelter panels.</p><h2 id="thenandnow">Then &amp; now</h2><p>Two roundels, same composition, one generation apart — a horse-and-trolley-era capitol scene opposite a modern StarMetro coach.</p><figure className="baPair plate"><div className="baPair-imgs"><div><span className="lbl">Past</span><img src={portfolioImg('graphics/cksteele/cksteele-03.png')} alt="Past illustration panel"/></div><div><span className="lbl">Now</span><img src={portfolioImg('graphics/cksteele/cksteele-05.png')} alt="Present-day illustration panel"/></div></div><figcaption>Left and right panels of the entry roundel — same layout, a century apart.</figcaption></figure><Plate portfolioSrc="graphics/cksteele/cksteele-02.jpg" caption="The center pairing that ties the two side panels together." className="plate-center"/><h2 id="panels">The panel set</h2><p>Five additional panels extend the story across the shelter run — each kept at its own natural proportions rather than cropped to a shared grid.</p><div className="panelStrip">{panels.map(n => <Plate key={n} portfolioSrc={`graphics/cksteele/cksteele-${String(n).padStart(2, '0')}.jpg`} caption={`Panel ${String(n).padStart(2, '0')}`}/>)}</div></div></main></>;
}

function Contact() {
  return <section className="hero contact-hero"><div className="photo-fill scrim-full" style={{ backgroundImage:`url('${img('contact-hero.jpg')}')` }}/><div className="grain-line contact-line"/><div className="tag-corner mono">LOEW FIDELITY<br/>GET IN TOUCH</div><div className="contact-panel paper"><div className="eyebrow"><i/>say hello</div><h1>Let's make<br/>something.</h1><p className="sub">Print, brand, or photography — if it's a real problem with a real deadline, I'd like to hear about it.</p><form className="contact-form" action="mailto:me@loew.fi" method="GET" encType="text/plain"><div className="row"><div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required/></div><div className="field"><label htmlFor="email">Email</label><input type="email" id="email" name="email" required/></div></div><div className="field"><label htmlFor="message">What are you working on?</label><textarea id="message" name="body" required/></div><button type="submit">Send it</button></form><div className="direct"><a href="mailto:me@loew.fi">me@loew.fi</a><a href="tel:8505709019">850.570.9019</a><a href="http://instagram.com/lrnolivia">@lrnolivia</a></div></div></section>;
}

function NotFound() {
  return <main className="not-found"><div className="eyebrow on-dark"><i />404</div><h1>This page wandered off.</h1><p>The work is still here. Head back to the portfolio index and try another route.</p><a href={routePath('index')} className="btn-primary">Back to the work</a></main>;
}

const pages = {
  index: Home,
  photo: () => <PortfolioIndex track="Photo" />,
  design: () => <PortfolioIndex track="Design" />,
  about: About,
  hydroviv: Hydroviv,
  cksteele: CKSteele,
  contact: Contact,
  ...Object.fromEntries(Object.entries(photographyProjects).map(([slug, project]) => [slug, () => <PhotographyGallery project={project} />])),
  ...Object.fromEntries(Object.entries(designArchiveProjects).map(([slug, project]) => [slug, () => <DesignArchive project={project} />])),
};
const meta = {
  index: ['loew.fi — Lauren White, design & photography', 'cat-neutral', 'The design and photography portfolio of Lauren White.'],
  photo: ['Photography — loew.fi', 'cat-photo', 'Photography by Lauren White: studio beauty, lifestyle, portraiture, and North Florida landscapes.'],
  design: ['Design — loew.fi', 'cat-design', 'Design work by Lauren White: brand, publication, promotional, and public-space projects.'],
  about: ['About Lauren White — loew.fi', 'cat-neutral', 'About Lauren White, a Tallahassee-based designer, art director, and photographer.'],
  avedastudio: ['Aveda Studio — loew.fi', 'cat-photo', 'A season of studio beauty photography by Lauren White.'],
  hydroviv: ['Hydroviv — loew.fi', 'cat-design', 'Print, direct-mail, and digital campaign design for Hydroviv.'],
  cksteele: ['CK Steele Plaza — loew.fi', 'cat-design', 'A public mural project tracing Tallahassee transportation history.'],
  contact: ['Contact — loew.fi', 'cat-neutral', 'Contact Lauren White about design, art direction, and photography projects.'],
  notFound: ['Page not found — loew.fi', 'cat-neutral', 'The requested page could not be found.'],
  ...Object.fromEntries(Object.entries(photographyProjects).map(([slug, project]) => [slug, [`${project.title} — loew.fi`, 'cat-photo', project.description]])),
  ...Object.fromEntries(Object.entries(designArchiveProjects).map(([slug, project]) => [slug, [`${project.title} — loew.fi`, 'cat-design', project.description]])),
};

export default function MockupApp() {
  const page = pageKey(); const found = Boolean(pages[page]); const Page = pages[page] || NotFound;
  useLiquidGlassEffects({ cursor:true, spotlight:false, reveal:false, scroll:false });
  useDynamicFrameColors(page);
  useEffect(() => {
    const [title, bodyClass, description] = meta[found ? page : 'notFound'];
    const canonicalPath = found ? routePath(page) : window.location.pathname;
    document.title = title;
    document.body.className = bodyClass;
    document.documentElement.classList.add('dark');
    document.documentElement.dataset.glassEngine = 'sohum';
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
    const canonicalUrl = new URL(canonicalPath, 'https://loew.fi').href;
    const socialImage = new URL(socialImageForPage(found ? page : 'index'), window.location.origin).href;
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', socialImage);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', socialImage);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
    let robots = document.querySelector('meta[name="robots"]');
    if (!found && !robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.append(robots);
    }
    if (robots) robots.setAttribute('content', found ? 'index,follow' : 'noindex,follow');
    return () => { document.body.className = ''; };
  }, [found, page]);
  return <><Navbar page={page}/><Page/><Footer/></>;
}
