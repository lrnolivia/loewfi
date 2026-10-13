import { useEffect, useRef, useState } from 'react';
import { LiquidGlass } from '@sohumsuthar/liquid-glass';
import { useLiquidGlassEffects } from '@sohumsuthar/liquid-glass/hooks';
import mossImage from '../images/moss.jpg?url';

const links = ['Home', 'About', 'Portfolio', 'Contact'];

const navLens = { bezel: 16, refraction: 1.2, dispersion: 5, radius: 40 };
const menuLens = { bezel: 14, refraction: 1.05, dispersion: 2, radius: 40 };
const gelLens = { bezel: 9, refraction: 0.9, dispersion: 3, radius: 40 };

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
      <LiquidGlass
        macro
        variant="clear"
        dimmed
        lens
        lensOptions={navLens}
        className="nav-pill"
        contentClassName="nav-pill__content"
      >
        <div className="brand">loew.fi</div>
        <ul className="nav-links">
          {links.map((link) => <li key={link}><a href="#">{link}</a></li>)}
        </ul>
        <div className="nav-actions">
          <LiquidGlass interactive variant="clear" className="nav-toggle-gel" contentClassName="gel-button__content">
            <button
              className={`nav-toggle${open ? ' is-open' : ''}`}
              aria-label="Menu"
              aria-expanded={open}
              aria-controls="navDropdown"
              onClick={() => setOpen((value) => !value)}
            >
              <span /><span /><span />
            </button>
          </LiquidGlass>
          <LiquidGlass
            interactive
            variant="clear"
            lens
            lensOptions={gelLens}
            className="nav-cta gel-button gel-button--red gel-button--hover-only"
            contentClassName="gel-button__content"
          >
            <span className="btn-solid__label"><WarningIcon />.workinprogress</span>
          </LiquidGlass>
        </div>
      </LiquidGlass>
      <LiquidGlass
        macro
        variant="clear"
        dimmed
        lens
        lensOptions={menuLens}
        className={`nav-dropdown${open ? ' is-open' : ''}`}
        contentClassName="nav-dropdown__content"
        id="navDropdown"
        role="navigation"
        aria-hidden={!open}
      >
        <ul>
          {links.map((link) => <li key={link}><a href="#" onClick={() => setOpen(false)}>{link}</a></li>)}
        </ul>
      </LiquidGlass>
    </>
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
            <LiquidGlass
              interactive
              variant="clear"
              lens
              lensOptions={gelLens}
              className="send-gel gel-button gel-button--cyan"
              contentClassName="gel-button__content"
            >
              <button type="submit" aria-label="Send" className="gel-button__control">
                <span className="btn-solid__label"><SendIcon /></span>
              </button>
            </LiquidGlass>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  useLiquidGlassEffects({ cursor: true, spotlight: false, reveal: false, scroll: false });

  useEffect(() => {
    document.documentElement.dataset.glassEngine = 'sohum';
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
      delete document.documentElement.dataset.glassEngine;
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateBackgroundScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mobile-bg-scroll', `${window.scrollY}px`);
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
      <img className="scene-background" src={mossImage} alt="" aria-hidden="true" />
      <div className="scene-shade" aria-hidden="true" />
      <div className="scene-grain" aria-hidden="true" />
      <Hero />
      <Navbar />
      <footer>
        <span>© 2026 lauren olivia - loew.fi</span>
        <span><a href="http://instagram.com/lrnolivia">instagram</a> &nbsp;/&nbsp; <a href="mailto:me@loew.fi">email</a></span>
      </footer>
    </>
  );
}
