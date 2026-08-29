import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { LiquidGlass } from 'liquid-glass-web-react';
import { Glass } from '@samasante/liquid-glass';

const links = ['Home', 'About', 'Portfolio', 'Contact'];

const pallavOptics = {
  radius: 'auto',
  strength: 0.18,
  chromaticAberration: 0.82,
  blur: 0.15,
  depth: 16,
  curvature: 0.78,
  splay: 0.9,
  glow: 0.14,
  glowSpread: 0.9,
  glowExponent: 1.8,
  edgeHighlight: 0.32,
  edgeWidth: 2.4,
  edgeExponent: 1.7,
  specular: 0.9,
  specularAngle: 35,
  quality: 512,
};

const samOptics = {
  strength: 0.115,
  depth: 0.78,
  curvature: 0.76,
  splay: 0.45,
  dispersion: 1,
  bend: 0.28,
  bendWidth: 0.2,
  frost: 0.15,
  brightness: 0.035,
  specular: 0.9,
  sheenAngle: 35,
  sheen: 0.22,
  sheenWidth: 2.5,
  sheenFalloff: 1.8,
  glow: 0.12,
  glowSpread: 0.9,
  glowFalloff: 0.65,
};

function useMeasuredBox() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 1, height: 1 });

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, size];
}

function NativeGlass({ engine, source, tone = 'nav' }) {
  const [measureRef, size] = useMeasuredBox();
  const sourceNode = <div className={`glass-source glass-source--${tone}`} />;

  return (
    <div ref={measureRef} className="native-glass-measure" aria-hidden="true">
      {engine === 'pallavag' ? (
        <LiquidGlass
          key="pallavag"
          className="native-glass-layer native-glass--pallav"
          width={size.width}
          height={size.height}
          {...pallavOptics}
          shadow={false}
        >
          {sourceNode}
        </LiquidGlass>
      ) : (
        <Glass
          key="samasante"
          className="native-glass-layer native-glass--sam"
          width={size.width}
          height={size.height}
          radius={Math.min(size.height / 2, size.width / 2)}
          refract={sourceNode}
          behind={source}
          optics={samOptics}
          filterResolution={1}
        />
      )}
    </div>
  );
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

function Navbar({ engine }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="nav-wrap">
      <div className="nav-pill" onPointerMove={trackHighlight} onPointerLeave={clearHighlight}>
        <NativeGlass engine={engine} source="#141410" />
        <PointerHighlight />
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
              <NativeGlass engine={engine} source="rgb(181,71,31)" tone="red" />
              <PointerHighlight />
              <span className="btn-solid__label"><WarningIcon />.workinprogress</span>
            </div>
          </div>
        </div>
      </div>
      <nav className={`nav-dropdown${open ? ' is-open' : ''}`} id="navDropdown">
        <ul>
          {links.map((link) => <li key={link}><a href="#" onClick={() => setOpen(false)}>{link}</a></li>)}
        </ul>
      </nav>
    </div>
  );
}

function Hero({ engine }) {
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
      <div className="bg-photo" />
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
            <button type="submit" aria-label="Send" className="btn-solid" onPointerMove={trackHighlight} onPointerLeave={clearHighlight}>
              <NativeGlass engine={engine} source="#00d9ff" tone="cyan" />
              <PointerHighlight />
              <span className="btn-solid__label"><SendIcon /></span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function EngineSwitch({ engine, onChange }) {
  return (
    <label className="glass-engine-control" title="Switch liquid-glass implementation">
      <span className="glass-engine-control__pallav">Pallav</span>
      <input
        type="checkbox"
        checked={engine === 'samasante'}
        onChange={(event) => onChange(event.target.checked ? 'samasante' : 'pallavag')}
        aria-label={`Liquid glass engine: ${engine === 'pallavag' ? 'Pallav Agarwal' : 'Sam Asante'}`}
      />
      <span className="glass-engine-control__track" aria-hidden="true" />
      <span className="glass-engine-control__sam">Sam</span>
    </label>
  );
}

export default function App() {
  const [engine, setEngine] = useState(() => {
    try { return localStorage.getItem('loew-glass-engine') === 'samasante' ? 'samasante' : 'pallavag'; }
    catch { return 'pallavag'; }
  });

  useEffect(() => {
    document.documentElement.dataset.glassEngine = engine;
    try { localStorage.setItem('loew-glass-engine', engine); } catch { /* private mode */ }
  }, [engine]);

  return (
    <>
      <Navbar engine={engine} />
      <Hero engine={engine} />
      <EngineSwitch engine={engine} onChange={setEngine} />
      <footer>
        <span>© 2026 lauren olivia - loew.fi</span>
        <span><a href="http://instagram.com/lrnolivia">instagram</a> &nbsp;/&nbsp; <a href="mailto:me@loew.fi">email</a></span>
      </footer>
    </>
  );
}
