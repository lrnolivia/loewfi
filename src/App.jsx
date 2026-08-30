import { useEffect, useRef, useState } from 'react';
import { LiquidGlass } from '@ybouane/liquidglass';

const links = ['Home', 'About', 'Portfolio', 'Contact'];

const navGlass = {
  blurAmount: 0.045, refraction: 0.56, chromAberration: 0.045,
  edgeHighlight: 0.1, specular: 0.1, fresnel: 0.9, distortion: 0.004,
  cornerRadius: 100, zRadius: 28, opacity: 0.96, saturation: 0.04,
  tintStrength: 0, brightness: 0.025, shadowOpacity: 0.24,
  shadowSpread: 11, shadowOffsetY: 3,
};

const menuGlass = {
  ...navGlass, blurAmount: 0.075, refraction: 0.44, chromAberration: 0.035,
  edgeHighlight: 0.07, specular: 0.06, cornerRadius: 20, zRadius: 16,
  brightness: -0.06, shadowOpacity: 0.48, shadowSpread: 18, shadowOffsetY: 8,
};

function initLiquidGlass({ root, glassElements, defaults, onReady }) {
  let disposed = false;
  let instance;

  const start = async () => {
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const created = await LiquidGlass.init({ root, glassElements, defaults });
      if (disposed) {
        created.destroy();
        return;
      }
      instance = created;
      onReady?.(created);
    } catch (error) {
      console.warn('Liquid glass could not start; CSS fallback remains active.', error);
    }
  };

  start();
  return () => {
    disposed = true;
    instance?.destroy();
    onReady?.(null);
  };
}

function PointerHighlight() {
  return <span className="glass-pointer-highlight" aria-hidden="true" />;
}

function trackHighlight(event) {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--shine-x', `${(event.clientX - rect.left).toFixed(1)}px`);
  event.currentTarget.style.setProperty('--shine-y', `${(event.clientY - rect.top).toFixed(1)}px`);
}

function clearHighlight(event) {
  event.currentTarget.style.removeProperty('--shine-x');
  event.currentTarget.style.removeProperty('--shine-y');
}

function WarningIcon() {
  return (
    <svg className="btn-solid__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 21 19.5H3L12 3.5Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M12 9.7v4.6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.15" fill="currentColor" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="btn-solid__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 3 3 10.8l7.3 2.9L13.2 21 21 3Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M10.3 13.7 21 3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const sourceRef = useRef(null);
  const navRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const source = sourceRef.current;
    const nav = navRef.current;
    const menu = menuRef.current;
    if (!root || !source || !nav || !menu) return undefined;

    const image = new Image();
    let instance = null;
    let cleanupGlass = null;
    let disposed = false;
    let frame = 0;

    const drawSource = (scrollY = window.scrollY) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!image.naturalWidth || disposed) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = window.innerWidth;
        const height = window.innerHeight;
        const mobile = window.matchMedia('(max-width: 760px)').matches;
        source.width = Math.round(width * dpr);
        source.height = Math.round(height * dpr);
        source.style.width = `${width}px`;
        source.style.height = `${height}px`;

        const context = source.getContext('2d');
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, width, height);
        context.filter = 'grayscale(55%) brightness(94%) contrast(105%)';

        const sceneHeight = mobile ? height * 1.32 : height;
        const scale = Math.max(width / image.naturalWidth, sceneHeight / image.naturalHeight);
        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;
        const drawX = (width - drawWidth) / 2;
        const drawY = (height - drawHeight) / 2 - (mobile ? scrollY * 0.42 : 0);
        context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
        context.filter = 'none';

        const shade = context.createLinearGradient(0, height, 0, 0);
        shade.addColorStop(0, 'rgba(0,0,0,.55)');
        shade.addColorStop(0.18, 'rgba(20,20,16,.48)');
        shade.addColorStop(0.55, 'rgba(20,20,16,.14)');
        shade.addColorStop(1, 'rgba(20,20,16,.32)');
        context.fillStyle = shade;
        context.fillRect(0, 0, width, height);
        instance?.markChanged(source);
      });
    };

    const onBackgroundScroll = (event) => drawSource(event.detail?.scrollY ?? window.scrollY);
    const onResize = () => drawSource();

    const start = async () => {
      image.src = '/images/moss.jpg';
      try { await image.decode(); } catch { /* load event fallback below */ }
      if (disposed || !image.naturalWidth) return;
      drawSource();
      cleanupGlass = initLiquidGlass({
        root,
        glassElements: [nav, menu],
        defaults: navGlass,
        onReady: (created) => { instance = created; },
      });
      if (disposed) cleanupGlass();
    };

    image.addEventListener('load', () => drawSource(), { once: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('loew-background-scroll', onBackgroundScroll);
    start();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      cleanupGlass?.();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('loew-background-scroll', onBackgroundScroll);
    };
  }, []);

  return (
    <div className="nav-glass-root" ref={rootRef}>
      <canvas className="nav-glass-source" ref={sourceRef} aria-hidden="true" />
      <div
        ref={navRef}
        className="nav-pill ybouane-glass"
        data-config={JSON.stringify(navGlass)}
        onPointerMove={trackHighlight}
        onPointerLeave={clearHighlight}
      >
        <PointerHighlight />
        <div className="glass-grain" aria-hidden="true" />
        <div className="nav-pill__content">
          <div className="brand">loew.fi</div>
          <ul className="nav-links">
            {links.map((link) => <li key={link}><a href="#">{link}</a></li>)}
          </ul>
          <div className="nav-actions">
            <button
              className={`nav-toggle${open ? ' is-open' : ''}`}
              aria-label="Menu"
              aria-expanded={open}
              aria-controls="navDropdown"
              onClick={() => setOpen((value) => !value)}
            >
              <span /><span /><span />
            </button>
            <div className="nav-cta btn-solid" onPointerMove={trackHighlight} onPointerLeave={clearHighlight}>
              <PointerHighlight />
              <span className="btn-solid__label"><WarningIcon />.workinprogress</span>
            </div>
          </div>
        </div>
      </div>
      <nav
        ref={menuRef}
        className={`nav-dropdown ybouane-glass${open ? ' is-open' : ''}`}
        id="navDropdown"
        data-config={JSON.stringify(menuGlass)}
        aria-hidden={!open}
      >
        <div className="glass-grain" aria-hidden="true" />
        <ul>
          {links.map((link) => <li key={link}><a href="#" onClick={() => setOpen(false)}>{link}</a></li>)}
        </ul>
      </nav>
    </div>
  );
}

function Hero() {
  const surfaceRef = useRef(null);
  const canTilt = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(pointer: fine)').matches;

  const handleCardMove = (event) => {
    const surface = surfaceRef.current;
    if (!surface || !canTilt()) return;
    if (event.target.closest('.notify')) {
      surface.style.removeProperty('transform');
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    surface.style.transform = `scale(1.015) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg)`;
  };

  return (
    <section className="hero">
      <div className="bg-scroll-layer" aria-hidden="true">
        <div className="bg-photo" />
      </div>
      <div className="grain-line" />
      <div className="tag-corner mono">LOEW FIDELITY<br />FIELD NOTES — VOL. 01</div>
      <div className="hero-tag-mobile mono">LOEW FIDELITY<br />FIELD NOTES — VOL. 01</div>
      <div className="card" onMouseMove={handleCardMove} onMouseLeave={() => surfaceRef.current?.style.removeProperty('transform')}>
        <div className="card-surface" ref={surfaceRef} />
        <div className="card-content">
          <div className="eyebrow"><i />currently under construction</div>
          <h1>Good things<br />are <span>coming.</span></h1>
          <p className="sub">A girl, her dreams, delusions and her work gathered into one place. Send a word of encouragement while I work!</p>
          <form className="notify" action="mailto:me@loew.fi" method="GET" encType="text/plain">
            <input type="hidden" name="subject" value="A word of encouragement — loew.fi" />
            <input type="text" name="body" placeholder="Talk to me nice..." required />
            <button
              type="submit"
              aria-label="Send"
              className="btn-solid"
              onPointerMove={trackHighlight}
              onPointerLeave={clearHighlight}
            >
              <PointerHighlight />
              <span className="btn-solid__label"><SendIcon /></span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  useEffect(() => {
    document.documentElement.dataset.glassEngine = 'ybouane';
    let frame = 0;
    const updateBackgroundScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mobile-bg-scroll', `${window.scrollY}px`);
        window.dispatchEvent(new CustomEvent('loew-background-scroll', { detail: { scrollY: window.scrollY } }));
      });
    };

    updateBackgroundScroll();
    window.addEventListener('scroll', updateBackgroundScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateBackgroundScroll);
      document.documentElement.style.removeProperty('--mobile-bg-scroll');
    };
  }, []);

  return (
    <>
      <Hero />
      <Navbar />
      <footer>
        <span>© 2026 lauren olivia - loew.fi</span>
        <span><a href="http://instagram.com/lrnolivia">instagram</a> &nbsp;/&nbsp; <a href="mailto:me@loew.fi">email</a></span>
      </footer>
    </>
  );
}
