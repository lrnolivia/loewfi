import { useEffect, useState } from 'react';
import { LiquidGlass } from '@sohumsuthar/liquid-glass';
import { useLiquidGlassEffects } from '@sohumsuthar/liquid-glass/hooks';

const assetUrls = import.meta.glob('./assets/img/*', { eager: true, query: '?url', import: 'default' });
const img = (name) => assetUrls[`./assets/img/${name}`];
const lens = {
  nav: { bezel: 16, refraction: 1.2, dispersion: 5, radius: 40 },
  panel: { bezel: 12, refraction: 1.05, dispersion: 2, radius: 16 },
  control: { bezel: 10, refraction: 1, dispersion: 2, radius: 40 },
};

const pageKey = () => {
  const file = location.pathname.split('/').pop() || 'index.html';
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

function Glass({ className = '', contentClassName = '', options = lens.panel, variant = 'regular', children, ...props }) {
  return <LiquidGlass macro variant={variant} lens lensOptions={options} className={className} contentClassName={contentClassName} {...props}>{children}</LiquidGlass>;
}

function Navbar({ page }) {
  return <div className="nav-wrap">
    <Glass className="nav-pill" contentClassName="nav-pill__glass-content" options={lens.nav}>
      <div className="nav-pill__content">
        <a href="index.html" className="brand">loew.fi</a>
        <ul className="nav-links">
          <li><a href="index.html" aria-current={page === 'index' ? 'page' : undefined}>Main</a></li>
          <li className="nav-drop">
            <a href="avedastudio.html" role="button" aria-current={page === 'avedastudio' ? 'page' : undefined}>Photo <span className="caret" /></a>
            <div className="nav-drop__panel-wrap"><Glass className="nav-drop__panel" contentClassName="nav-drop__panel-content">
              <a href="#">Aveda Lifestyle</a><a href="avedastudio.html" aria-current={page === 'avedastudio' ? 'page' : undefined}>Aveda Studio</a><a href="#">Isles Ashore</a><a href="#">Magnolia Fields</a><a href="#">Leaves &amp; Leos</a>
            </Glass></div>
          </li>
          <li className="nav-drop">
            <a href="hydroviv.html" role="button" aria-current={['hydroviv', 'cksteele'].includes(page) ? 'page' : undefined}>Design <span className="caret" /></a>
            <div className="nav-drop__panel-wrap"><Glass className="nav-drop__panel" contentClassName="nav-drop__panel-content">
              <a href="hydroviv.html" aria-current={page === 'hydroviv' ? 'page' : undefined}>Hydroviv</a><a href="#">Ascencion</a><a href="#">Glory Be</a><a href="cksteele.html" aria-current={page === 'cksteele' ? 'page' : undefined}>CK Steele Plaza</a><a href="#">Promotional Material</a><a href="#">Misc</a>
            </Glass></div>
          </li>
          <li><a href="about.html" aria-current={page === 'about' ? 'page' : undefined}>About</a></li>
        </ul>
      </div>
      <a href="contact.html" className="nav-cta" aria-current={page === 'contact' ? 'page' : undefined}>Contact</a>
    </Glass>
  </div>;
}

function Footer() {
  return <footer><span>© 2026 Lauren Olivia — loew.fi</span><span><a href="http://instagram.com/lrnolivia">Instagram</a> &nbsp;/&nbsp; <a href="mailto:me@loew.fi">Email</a></span></footer>;
}

function PageHero({ image, eyebrow, title, lede, className = '', soften = false }) {
  return <section className={`page-hero ${className}`}>
    <div className={`photo-fill${soften ? ' photo-fill--soften' : ''} scrim-bottom`} style={{ backgroundImage: `url('${img(image)}')` }} />
    <div className="page-hero-content"><div className="eyebrow on-dark mono"><i />{eyebrow}</div><h1>{title}</h1>{lede && <p className="lede">{lede}</p>}</div>
  </section>;
}

const work = [
  ['avedastudio.html','alex1.jpg','Photo','Aveda Studio','A season of studio beauty work — hair, light, and 44 frames of it.'],
  ['hydroviv.html','Outside.png','Design','Hydroviv','Advertisement, print and marketing material work.'],
  ['cksteele.html','dt_starmetro_final_Page_1.jpg','Design','CK Steele Plaza','A physical mural on the history and future of public transit.'],
  ['#','isles-teaser.jpg','Photo','Isles Ashore','Coastal light, unstyled.'],
  ['#','asc_main.jpg','Design','Ascencion','Brand identity for a Delta × SpaceX passenger flight concept.'],
];

function Home() {
  return <><section className="hero home-hero">
    <div className="photo-fill scrim-top" style={{ backgroundImage: `url('${img('moss.jpg')}')` }} /><div className="grain-line" /><div className="tag-corner mono">LOEW FIDELITY<br />FIELD NOTES — VOL. 04</div>
    <div className="hero-card"><div className="hero-card-inner paper"><div className="eyebrow"><i />tallahassee, fl</div><h1>Twenty years of<br />making <span>things.</span></h1><p className="sub">A collection of design and photography by Lauren White — from personal and college projects to production assets for recording artists and D2C marketing.</p><div className="actions"><a href="avedastudio.html" className="btn-primary">View the work</a><a href="about.html" className="btn-ghost">About Lauren</a></div></div></div>
  </section>
  <section className="work anim-fadeUp"><div className="work-head"><h2>Selected work</h2><p>A mix of photography and design projects — the full archive is split into two tracks in the nav above.</p></div><div className="work-grid">{work.map(([href,image,track,title,desc]) => <a href={href} className="teaser-card" key={title}><div className="teaser-card__frame"><div className="teaser-card__frame-inner"><img src={img(image)} alt="" /></div></div><div className="teaser-card__meta"><span className="teaser-card__track mono">{track}</span><h3 className="teaser-card__title">{title}</h3><p className="teaser-card__desc">{desc}</p></div></a>)}</div></section>
  <section className="tracks"><div className="tracks-inner"><div className="track"><h3>Photo</h3><p>Finished photography — studio beauty work, coastal landscapes, lifestyle sets. Shown full-bleed, with a view switcher on every gallery so you can browse it the way that suits the set.</p><a href="avedastudio.html">Start with Aveda Studio →</a></div><div className="track"><h3>Design</h3><p>Print, brand, and packaging work — presented as case studies, with the artifacts themselves framed like prints on a table rather than cropped into a photo grid.</p><a href="hydroviv.html">Start with Hydroviv →</a></div></div></section></>;
}

function About() {
  return <><PageHero image="moss.jpg" eyebrow="about" title="Lauren White" />
  <main className="article"><aside className="article__sidebar"><dl><dt>Based</dt><dd>Tallahassee, FL</dd><dt>Disciplines</dt><dd>Design, art direction, photography</dd><dt>Selected clients</dt><dd>Hydroviv, Delta (student), Britney Spears / Glory (student)</dd><dt>Contact</dt><dd><a href="mailto:me@loew.fi" className="text-link">me@loew.fi</a></dd></dl><div className="facts-plate"><div className="plate card-tilt"><h4>On the desk right now</h4><ul><li>Aveda Studio, season two</li><li>A print run for a friend's zine</li><li>This website</li></ul></div></div><nav aria-label="On this page"><a href="#story" className="is-active">The short version</a><a href="#practice">How I work</a><a href="#now">What's next</a></nav></aside>
  <div className="article__body"><h1 className="about-title">Twenty years of making things, most of them by hand first.</h1><p className="lede" id="story">I've been making things — collages, zines, posters, then album layouts and brand systems, then whatever a client actually needed — for about twenty years now. Some of it was for college. Some of it was for myself. A good amount of it, lately, is for people who need a system to sell water filters or fill a mural wall downtown.</p><p>I trained as a designer first, which is probably why even the photography leans toward composition and light over spontaneity — the beauty work in Aveda Studio is closer in spirit to the brand plates in Hydroviv than either of them is to a snapshot. I like problems with real constraints: a wall that's already there, a product that already exists, a client with an actual opinion about their own brand.</p><div className="pull"><img src={img('ashelli2+(1).jpg')} alt="Studio portrait from the Aveda Studio series" /></div><h2 id="practice">How I work</h2><p>Most projects start on paper, not because it's precious but because it's faster to throw away. The CK Steele mural went through a dozen thumbnail passes before anyone saw a digital file. The same is mostly true of a shoot — I'd rather over-plan a set and improvise the actual frames than the other way around.</p><p>I still think in terms of print, even for screens — a page, a spread, a plate. It's part of why this site treats design work like objects on a table instead of tiles in a grid.</p><h2 id="now">What's next</h2><p>A second season of studio work with Aveda, and slowly getting the rest of the archive — Glory Be, the Ascencion brand exercise, a decade of miscellaneous print — properly organized here instead of scattered across old drives. If you've got a wall, a brand, or a water filter that needs a system, <a href="contact.html" className="text-link">say hello</a>.</p></div></main></>;
}

const galleryImages = [
  ['alex1.jpg','Aveda Studio — Alex, look 1'],['alex4.jpg','Aveda Studio — Alex, look 2'],['alex6.jpg','Aveda Studio — Alex, look 3'],['ashelli2+(1).jpg','Aveda Studio — Ashelli, look 1','Ashelli — updo detail'],['ashelli4.jpg','Aveda Studio — Ashelli, look 2'],['brittany1.jpg','Aveda Studio — Brittany, look 1'],['brittany3.jpg','Aveda Studio — Brittany, look 2','Brittany — studio light'],['cori1.jpg','Aveda Studio — Cori, look 1'],['cori4.jpg','Aveda Studio — Cori, look 2'],['crystal2.jpg','Aveda Studio — Crystal'],['gabby2.jpg','Aveda Studio — Gabby','Gabby — color work'],['kat3.jpg','Aveda Studio — Kat'],['maria1.jpg','Aveda Studio — Maria, look 1'],['maria3.jpg','Aveda Studio — Maria, look 2'],['nina2.jpg','Aveda Studio — Nina','Nina — braid detail'],['shay5.jpg','Aveda Studio — Shay'],
];
const views = ['grid','natural','strip','story','carousel'];
function ViewIcon({ type }) {
  const paths = { grid:<><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/></>, natural:<><rect x="1" y="1" width="6" height="9"/><rect x="9" y="1" width="6" height="5"/><rect x="9" y="8" width="6" height="7"/></>, strip:<><rect x="1" y="3" width="3" height="10"/><rect x="6" y="3" width="4" height="10"/><rect x="12" y="3" width="3" height="10"/></>, story:<><rect x="2" y="1" width="12" height="6"/><rect x="2" y="9" width="12" height="6"/></>, carousel:<><rect x="3" y="2" width="10" height="12" rx="1"/><path d="M1 8h1.5M13.5 8H15"/></> };
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor">{paths[type]}</svg>;
}
function AvedaStudio() {
  const [view,setView] = useState('grid'); const [current,setCurrent] = useState(0);
  const move = (delta) => setCurrent(i => (i + delta + galleryImages.length) % galleryImages.length);
  return <><PageHero image="alex1.jpg" eyebrow="photo — studio beauty" title="Aveda Studio" lede="A season of studio beauty work — hair, light, and forty-four frames of it, shown here in a representative set of sixteen." />
  <div className="gwrap"><div className="gallery-bar"><p className="gnote">16 of 44 — full set ships with the production build</p><Glass className="view-switch" contentClassName="view-switch__content" options={lens.control} variant="clear" role="group" aria-label="Gallery view">{views.map(item => <button type="button" key={item} onClick={() => setView(item)} aria-pressed={view === item}><ViewIcon type={item}/>{item}</button>)}</Glass></div>
  <div className="gallery" data-view={view}>{galleryImages.map(([src,alt,caption],i) => <figure className={`g-item${i === current ? ' is-active' : ''}`} key={src}><img src={img(src)} alt={alt}/>{caption && <figcaption>{caption}</figcaption>}</figure>)}</div>
  <div className={`carousel-controls${view === 'carousel' ? ' is-active' : ''}`}><button type="button" onClick={() => move(-1)} aria-label="Previous image">‹</button><span className="carousel-controls__count">{current+1} / {galleryImages.length}</span><button type="button" onClick={() => move(1)} aria-label="Next image">›</button></div>
  <div className={`carousel-thumbs${view === 'carousel' ? ' is-active' : ''}`}>{galleryImages.map(([src],i) => <button type="button" key={src} className={i === current ? 'is-active' : ''} onClick={() => setCurrent(i)} aria-label={`Go to image ${i+1}`}><img src={img(src)} alt="" /></button>)}</div></div></>;
}

function Hydroviv() {
  return <><PageHero image="Outside.png" eyebrow="design — print & marketing" title="Hydroviv" lede="Advertisement, print and marketing material work for Hydroviv, a custom water-filtration company." className="hero-grain" soften />
  <main className="article"><CaseSidebar items={[['Client','Hydroviv'],['Role','Design'],['Medium','Print, direct mail, email'],['Deliverables','Trifold brochure, digital ad set']]} links={[['#brochure','The brochure'],['#digital','Digital set']]}/><div className="article__body"><p className="lede">Hydroviv builds water filters customized to a household's actual local water report — the brief called for print and digital material that could make “your water is specifically contaminated” feel useful rather than alarming.</p><h2 id="brochure">The brochure</h2><p>A trifold, meant to work as both a countertop leaflet and a direct-mail piece: one outward-facing panel to stop someone flipping past it, and an interior spread that does the actual explaining once they've opened it.</p><Plate src="Outside.png" caption="Outer spread — cover, QR-code offer panel, and back panel."/><Plate src="Inside.png" caption="Inner spread — the actual filter, spelled out."/><h2 id="digital">Digital set</h2><p>A matching set of digital assets built from the same system — an email header, a vertical social ad, and a pattern tile pulled from the brochure's wave motif for use across the rest of the campaign.</p><div className="plate-pair"><Plate src="desktop-email-template.jpg" caption="Email header"/><Plate src="9-16+USPs.jpg" caption="Vertical social ad"/></div><Plate src="1-191+Pattern.jpg" caption="Wave pattern, extracted for reuse across the campaign." className="plate-narrow"/></div></main></>;
}

function CaseSidebar({ items, links }) { return <aside className="article__sidebar"><dl>{items.map(([dt,dd]) => <div key={dt}><dt>{dt}</dt><dd>{dd}</dd></div>)}</dl><nav aria-label="On this page">{links.map(([href,label],i) => <a href={href} className={i === 0 ? 'is-active' : ''} key={href}>{label}</a>)}</nav></aside>; }
function Plate({ src, caption, className='' }) { return <figure className={`plate ${className}`}><img src={img(src)} alt={caption}/><figcaption>{caption}</figcaption></figure>; }

function CKSteele() {
  const panels = [1,2,4,5,8];
  return <><PageHero image="dt_starmetro_final_Page_7.jpg" eyebrow="design — public mural, college project" title="CK Steele Plaza" lede="A physical mural for Tallahassee's CK Steele Plaza, tracing the history and future of public transportation in the capital city." className="hero-grain ck-hero" />
  <main className="article"><CaseSidebar items={[['Context','College project'],['Site','CK Steele Plaza, Tallahassee'],['Medium','Large-format mural panels'],['Subject','StarMetro transit, past & future']]} links={[['#thenandnow','Then & now'],['#panels','The panel set']]}/><div className="article__body"><p className="lede">The plaza is Tallahassee's central transit hub — the brief was to design a mural that a rider actually waiting for a bus would read, not just glance past. The concept pairs a “past” and “now” illustration of the same route, then unpacks it across a run of transit-shelter panels.</p><h2 id="thenandnow">Then &amp; now</h2><p>Two roundels, same composition, one generation apart — a horse-and-trolley-era capitol scene opposite a modern StarMetro coach.</p><figure className="baPair plate"><div className="baPair-imgs"><div><span className="lbl">Past</span><img src={img('dt_leftpanel_past.png')} alt="Past illustration panel"/></div><div><span className="lbl">Now</span><img src={img('dt_rightpanel_now.png')} alt="Present-day illustration panel"/></div></div><figcaption>Left and right panels of the entry roundel — same layout, a century apart.</figcaption></figure><Plate src="dt_center.jpg" caption="The center pairing that ties the two side panels together." className="plate-center"/><h2 id="panels">The panel set</h2><p>Five additional panels extend the story across the shelter run — each kept at its own natural proportions rather than cropped to a shared grid.</p><div className="panelStrip">{panels.map(n => <Plate key={n} src={`dt_starmetro_final_Page_${n}.jpg`} caption={`Panel 0${n}`}/>)}</div></div></main></>;
}

function Contact() {
  return <section className="hero contact-hero"><div className="photo-fill scrim-full" style={{ backgroundImage:`url('${img('contact-hero.jpg')}')` }}/><div className="grain-line contact-line"/><div className="tag-corner mono">LOEW FIDELITY<br/>GET IN TOUCH</div><div className="contact-panel paper"><div className="eyebrow"><i/>say hello</div><h1>Let's make<br/>something.</h1><p className="sub">Print, brand, or photography — if it's a real problem with a real deadline, I'd like to hear about it.</p><form className="contact-form" action="mailto:me@loew.fi" method="GET" encType="text/plain"><div className="row"><div className="field"><label htmlFor="name">Name</label><input id="name" name="name" required/></div><div className="field"><label htmlFor="email">Email</label><input type="email" id="email" name="email" required/></div></div><div className="field"><label htmlFor="message">What are you working on?</label><textarea id="message" name="body" required/></div><button type="submit">Send it</button></form><div className="direct"><a href="mailto:me@loew.fi">me@loew.fi</a><a href="tel:8505709019">850.570.9019</a><a href="http://instagram.com/lrnolivia">@lrnolivia</a></div></div></section>;
}

const pages = { index: Home, about: About, avedastudio: AvedaStudio, hydroviv: Hydroviv, cksteele: CKSteele, contact: Contact };
const meta = { index:['loew.fi — Lauren White, design & photography','cat-neutral'], about:['About — loew.fi','cat-neutral'], avedastudio:['Aveda Studio — loew.fi','cat-photo'], hydroviv:['Hydroviv — loew.fi','cat-design'], cksteele:['CK Steele Plaza — loew.fi','cat-design'], contact:['Contact — loew.fi','cat-neutral'] };

export default function MockupApp() {
  const page = pageKey(); const Page = pages[page] || Home;
  useLiquidGlassEffects({ cursor:true, spotlight:false, reveal:false, scroll:false });
  useDynamicFrameColors(page);
  useEffect(() => { document.title = (meta[page] || meta.index)[0]; document.body.className = (meta[page] || meta.index)[1]; document.documentElement.classList.add('dark'); document.documentElement.dataset.glassEngine='sohum'; return () => { document.body.className=''; }; }, [page]);
  return <><Navbar page={page}/><Page/><Footer/></>;
}
