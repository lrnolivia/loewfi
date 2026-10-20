import { useEffect, useRef, useState } from 'react';
import mossImage from '../images/terra-prime/moss.png?url';
import statusDot from '../images/terra-prime/status-dot.svg?url';
import './landing.css';

const links = ['Main', 'Photo', 'Design', 'Software', 'About', 'Contact'];

function AccentRail({ className = '' }) {
  return <div className={`accent-rail ${className}`} aria-hidden="true"><i /><i /><i /><i /><i /></div>;
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const closeOutside = (event) => {
      if (!navRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOutside);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOutside);
    };
  }, [open]);

  const navLinks = (mobile = false) => links.map((link) => (
    <li key={link}><a className={`nav-item nav-item--${link.toLowerCase()}`} href="#" tabIndex={mobile && !open ? -1 : undefined} onClick={() => setOpen(false)}>{link}</a></li>
  ));

  return (
    <header className="site-header" ref={navRef}>
      <div className="nav-container">
        <AccentRail />
        <nav className="nav-content" aria-label="Main navigation">
          <div className="brand-block">
            <a className="brand" href="#" onClick={() => setOpen(false)}>loew.fi</a>
            <div className="nav-meta"><span>Loew Fidelity / Field Notes — Vol. 01</span><span>2026</span></div>
          </div>
          <ul className="nav-links">{navLinks()}</ul>
          <button ref={toggleRef} className={`nav-toggle${open ? ' is-open' : ''}`} aria-label={open ? 'Close menu' : 'Menu'} aria-expanded={open} aria-controls="navDropdown" onClick={() => setOpen((value) => !value)}>
            <span /><span /><span />
          </button>
        </nav>
        <nav className="nav-dropdown" id="navDropdown" aria-label="Mobile navigation" hidden={!open}>
          <ul>{navLinks(true)}</ul>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  const cardRef = useRef(null);
  const resetCard = () => cardRef.current?.style.removeProperty('transform');
  const handleCardMove = (event) => {
    const card = cardRef.current;
    if (!card || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(pointer: fine)').matches) return;
    if (event.target.closest('.notify')) {
      resetCard();
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `scale(1.015) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg)`;
  };

  return (
    <main className="hero">
      <div className="card-position" onMouseMove={handleCardMove} onMouseLeave={resetCard}>
        <section className="construction-card" ref={cardRef} aria-labelledby="landing-title">
          <div className="construction-status">
            <div className="status-rule" aria-hidden="true" />
            <div className="eyebrow"><img src={statusDot} alt="" width="8" height="8" />Currently under construction</div>
          </div>
          <h1 id="landing-title">Good things<br />are coming.</h1>
          <p className="sub">A girl, her dreams, delusions and her work gathered into one place. Send a word of encouragement while I work!</p>
          <form className="notify" action="mailto:me@loew.fi" method="GET" encType="text/plain">
            <input type="hidden" name="subject" value="A word of encouragement — loew.fi" />
            <label className="sr-only" htmlFor="encouragement">Your word of encouragement</label>
            <input id="encouragement" type="text" name="body" placeholder="Talk to me nice..." required aria-describedby="email-note" />
            <button type="submit"><span className="send-check" aria-hidden="true">✓</span>Send</button>
          </form>
          <p className="email-note" id="email-note">Opens your email app with a message to me@loew.fi.</p>
        </section>
      </div>
      <aside className="scene-notes"><p>Loew.fi / Work in progress</p><p>A temporary front door while the portfolio is rebuilt.</p></aside>
    </main>
  );
}

export default function App() {
  return (
    <div className="landing">
      <img className="scene-background" src={mossImage} alt="" aria-hidden="true" fetchPriority="high" />
      <div className="scene-shade" aria-hidden="true" />
      <Navbar />
      <Hero />
      <footer className="site-footer">
        <span>© 2026 Lauren Olivia — loew.fi</span>
        <span className="footer-links"><a href="http://instagram.com/lrnolivia">Instagram</a><span aria-hidden="true">/</span><a href="mailto:me@loew.fi">Email</a></span>
      </footer>
    </div>
  );
}
