import { useEffect, useRef, useState } from 'react';
import { LiquidGlass } from '@ybouane/liquidglass';

const links = ['Home', 'About', 'Portfolio', 'Contact'];

const navGlass = {
  blurAmount: 0.075, refraction: 0.86, chromAberration: 0.18,
  edgeHighlight: 0.12, specular: 0.14, fresnel: 1.15, distortion: 0.012,
  cornerRadius: 100, zRadius: 46, opacity: 1, saturation: 0.08,
  tintStrength: 0, brightness: 0.04, shadowOpacity: 0.28,
  shadowSpread: 13, shadowOffsetY: 3,
};

const menuGlass = {
  ...navGlass, blurAmount: 0.12, refraction: 0.68, chromAberration: 0.11,
  edgeHighlight: 0.08, specular: 0.08, cornerRadius: 20, zRadius: 20,
  brightness: -0.06, shadowOpacity: 0.48, shadowSpread: 18, shadowOffsetY: 8,
};

const buttonGlass = {
  blurAmount: 0.055, refraction: 0.92, chromAberration: 0.22,
  edgeHighlight: 0.18, specular: 0.22, fresnel: 1.2, distortion: 0.018,
  cornerRadius: 40, zRadius: 26, opacity: 1, saturation: 0.2,
  tintStrength: 0, brightness: 0.08, shadowOpacity: 0.24,
  shadowSpread: 9, shadowOffsetY: 2, button: true,
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

  return (
    <>
      <div
        className="nav-pill ybouane-glass"
        data-liquid-glass
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
        className={`nav-dropdown ybouane-glass${open ? ' is-open' : ''}`}
        id="navDropdown"
        data-liquid-glass
        data-config={JSON.stringify(menuGlass)}
        aria-hidden={!open}
      >
        <div className="glass-grain" aria-hidden="true" />
        <ul>
          {links.map((link) => <li key={link}><a href="#" onClick={() => setOpen(false)}>{link}</a></li>)}
        </ul>
      </nav>
    </>
  );
}

function Hero() {
  const surfaceRef = useRef(null);
  const formRef = useRef(null);
  const sendRef = useRef(null);
  const canTilt = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(pointer: fine)').matches;

  useEffect(() => {
    if (!formRef.current || !sendRef.current) return undefined;
    return initLiquidGlass({
      root: formRef.current,
      glassElements: [sendRef.current],
      defaults: buttonGlass,
    });
  }, []);

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
          <form ref={formRef} className="notify" action="mailto:me@loew.fi" method="GET" encType="text/plain">
            <input type="hidden" name="subject" value="A word of encouragement — loew.fi" />
            <input type="text" name="body" placeholder="Talk to me nice..." required />
            <button
              ref={sendRef}
              type="submit"
              aria-label="Send"
              className="btn-solid ybouane-glass"
              data-config={JSON.stringify(buttonGlass)}
              onPointerMove={trackHighlight}
              onPointerLeave={clearHighlight}
            >
              <PointerHighlight />
              <span className="glass-grain" aria-hidden="true" />
              <span className="btn-solid__label"><SendIcon /></span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const pageGlassRef = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.glassEngine = 'ybouane';
    const root = document.getElementById('root');
    if (!root) return undefined;
    const glassElements = Array.from(root.children).filter((element) => element.hasAttribute('data-liquid-glass'));
    return initLiquidGlass({
      root,
      glassElements,
      defaults: navGlass,
      onReady: (instance) => { pageGlassRef.current = instance; },
    });
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateBackgroundScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mobile-bg-scroll', `${window.scrollY}px`);
        const hero = document.querySelector('.hero');
        if (hero) pageGlassRef.current?.markChanged(hero);
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
