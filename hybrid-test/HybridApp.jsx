import { useEffect, useMemo, useRef, useState } from 'react';
import { LiquidGlass as SohumGlass } from '@sohumsuthar/liquid-glass';
import { useLiquidGlassEffects } from '@sohumsuthar/liquid-glass/hooks';
import { LiquidGlass as WebGLGlass } from '../vendor/liquid-glass/ybouane/dist/index.js';
import mossImage from '../images/moss.jpg';

const MODES = ['auto', 'sohum', 'webgl', 'fallback'];
const webglConfig = {
  blurAmount: 0.12,
  refraction: 1.2,
  chromAberration: 0.3,
  edgeHighlight: 0.6,
  specular: 0.12,
  fresnel: 0.48,
  distortion: 0,
  cornerRadius: 40,
  zRadius: 40,
  opacity: 1,
  saturation: 0.32,
  brightness: 0.22,
  shadowOpacity: 0.55,
  shadowSpread: 24,
  bevelMode: 0,
};

function detectRenderer(requested) {
  if (requested !== 'auto') return requested;
  const userAgent = navigator.userAgent;
  const chromium = /Chrom(e|ium)|Edg\//.test(userAgent) && !/OPR\//.test(userAgent);
  const nativeBackdrop = CSS.supports('backdrop-filter', 'blur(2px)') || CSS.supports('-webkit-backdrop-filter', 'blur(2px)');
  if (chromium && nativeBackdrop) return 'sohum';
  try {
    const canvas = document.createElement('canvas');
    if (canvas.getContext('webgl')) return 'webgl';
  } catch {
    // CSS fallback below.
  }
  return 'fallback';
}

function GlassSurface({ renderer, className, children, regular = true, interactive = false }) {
  if (renderer === 'sohum') {
    return (
      <SohumGlass
        macro
        variant={regular ? 'regular' : 'clear'}
        interactive={interactive}
        lens
        lensOptions={{ bezel: 16, refraction: 1.2, dispersion: 5, radius: 40 }}
        className={className}
        contentClassName="hybrid-glass-content"
      >
        {children}
      </SohumGlass>
    );
  }

  return (
    <div
      className={`${className} hybrid-surface ${renderer === 'webgl' ? 'hybrid-webgl-glass' : 'hybrid-css-glass'}`}
      data-config={renderer === 'webgl' ? JSON.stringify(webglConfig) : undefined}
    >
      <div className="hybrid-glass-content">{children}</div>
    </div>
  );
}

function ModeLinks({ requested, active }) {
  return (
    <div className="mode-links" aria-label="Renderer selection">
      {MODES.map((mode) => (
        <a
          key={mode}
          href={`?renderer=${mode}`}
          className={requested === mode ? 'is-selected' : ''}
          aria-current={requested === mode ? 'page' : undefined}
        >
          {mode}
        </a>
      ))}
      <span className="active-renderer">active: {active}</span>
    </div>
  );
}

export default function HybridApp() {
  useLiquidGlassEffects({ cursor: true, spotlight: false, reveal: false, scroll: false });
  const rootRef = useRef(null);
  const backgroundRef = useRef(null);
  const [instance, setInstance] = useState(null);
  const requested = useMemo(() => {
    const value = new URLSearchParams(location.search).get('renderer') || 'auto';
    return MODES.includes(value) ? value : 'auto';
  }, []);
  const renderer = useMemo(() => detectRenderer(requested), [requested]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.dataset.glassEngine = `hybrid-${renderer}`;
    return () => delete document.documentElement.dataset.glassEngine;
  }, [renderer]);

  useEffect(() => {
    if (renderer !== 'webgl' || !rootRef.current) return undefined;
    let live = true;
    let glass = null;
    WebGLGlass.init({
      root: rootRef.current,
      glassElements: rootRef.current.querySelectorAll(':scope > .hybrid-webgl-glass'),
    }).then((created) => {
      if (!live) created.destroy();
      else {
        glass = created;
        setInstance(created);
      }
    }).catch((error) => console.warn('Hybrid WebGL renderer unavailable.', error));
    return () => {
      live = false;
      glass?.destroy();
      setInstance(null);
    };
  }, [renderer]);

  useEffect(() => {
    if (!instance) return undefined;
    let frame = 0;
    const refresh = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => instance.markChanged(backgroundRef.current));
    };
    addEventListener('scroll', refresh, { passive: true });
    addEventListener('resize', refresh, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', refresh);
      removeEventListener('resize', refresh);
    };
  }, [instance]);

  return (
    <main className={`hybrid-scene renderer-${renderer}`} ref={rootRef}>
      <img ref={backgroundRef} className="hybrid-background" src={mossImage} alt="" aria-hidden="true" />
      <div className="hybrid-shade" aria-hidden="true" />
      <div className="hybrid-copy hybrid-copy--top">
        <p className="kicker">renderer abstraction / field test</p>
        <h1>One material API.<br />Two rendering paths.</h1>
        <p>Scroll slowly, fling quickly, resize, and compare the rim and background tracking through each surface.</p>
      </div>

      <GlassSurface renderer={renderer} className="hybrid-nav" regular>
        <strong>loew.fi</strong>
        <ModeLinks requested={requested} active={renderer} />
      </GlassSurface>

      <GlassSurface renderer={renderer} className="hybrid-panel hybrid-panel--one" regular>
        <span className="panel-index">01 / regular</span>
        <h2>Legibility with transmission.</h2>
        <p>The primary bar and this panel share geometry and illumination while the renderer changes underneath.</p>
        <button type="button">Interact</button>
      </GlassSurface>

      <div className="hybrid-copy hybrid-copy--middle">
        <p className="kicker">scroll target</p>
        <h2>Live texture should stay attached to the page.</h2>
      </div>

      <GlassSurface renderer={renderer} className="hybrid-panel hybrid-panel--two" regular={false} interactive>
        <span className="panel-index">02 / clear</span>
        <h2>Stronger lens, lighter frost.</h2>
        <p>This surface exercises refraction, dispersion, pointer illumination, and the browser fallback at once.</p>
        <button type="button">Press the glass</button>
      </GlassSurface>

      <footer className="hybrid-footer">loew.fi liquid glass renderer lab</footer>
    </main>
  );
}
