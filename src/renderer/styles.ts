export const RENDERER_STYLES = `
.page-hero{position:relative;height:52vh;min-height:380px;overflow:hidden}
.page-hero--gallery{height:58vh;min-height:420px}
.page-hero--about{height:46vh;min-height:340px}
.page-hero .photo-fill{background-position:var(--hero-x,50%) var(--hero-y,50%);background-attachment:var(--hero-attachment,scroll)}
.page-hero .photo-fill--muted{filter:grayscale(.1) brightness(.78) contrast(1.05)}
.page-hero-content{position:relative;z-index:5;height:100%;display:flex;flex-direction:column;justify-content:flex-end;max-width:var(--container);margin:0 auto;padding:0 var(--gutter) var(--space-4)}
.page-hero h1{font-size:clamp(38px,5.5vw,64px);margin:0 0 10px;letter-spacing:-.02em}
.page-hero .lede{font-size:15.5px;color:var(--cream-dim);max-width:56ch;margin:0}
.article{padding-top:var(--space-6);padding-bottom:var(--space-6)}
.article__sidebar dd a,.article__body a{color:var(--cream);text-decoration:underline}
.pull{margin:var(--space-5) 0;position:relative;aspect-ratio:16/8;overflow:hidden;border-radius:var(--radius-card)}
.pull img{width:100%;height:100%;object-fit:cover;filter:grayscale(.15)}
.facts-plate{margin-top:var(--space-4)}
.facts-plate .plate{padding:18px 18px 20px}
.facts-plate h4{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#7a6b45;margin:0 0 10px}
.facts-plate ul{margin:0;padding:0;list-style:none}
.facts-plate li{font-size:13.5px;color:#3e3b33;padding:6px 0;border-top:1px solid var(--line-on-cream)}
.facts-plate li:first-child{border-top:0}
.baPair{margin:var(--space-4) 0}
.baPair-imgs{display:grid;grid-template-columns:1fr 1fr;gap:2px}
.baPair-imgs>div{position:relative}
.baPair-imgs img{width:100%;display:block}
.baPair-imgs .lbl{position:absolute;top:10px;left:10px;font:10px 'Space Mono',monospace;letter-spacing:.08em;text-transform:uppercase;background:rgba(20,20,16,.75);color:var(--cream);padding:4px 9px;border-radius:100px}
.baPair.plate{padding:16px 16px 0}.baPair figcaption{padding:12px 0 16px}
.panelStrip{display:grid;grid-template-columns:repeat(var(--strip-cols,3),1fr);gap:10px;margin:var(--space-4) 0}
.panelStrip .plate{padding:8px 8px 10px}.panelStrip figcaption{font-size:9.5px}
.plate--narrow{max-width:420px}.plate--centered{max-width:640px;margin-left:auto!important;margin-right:auto!important}
.gwrap{max-width:1520px;margin:0 auto;padding:var(--space-6) var(--gutter)}
.gnote{font:11px 'Space Mono',monospace;color:var(--cream-dim);margin:0 0 4px}
.hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;padding-top:calc(var(--nav-height) + 8px)}
.hero .tag-corner{position:absolute;top:calc(var(--nav-top) + 8px);right:var(--gutter);z-index:2}
.hero-card{position:relative;z-index:10;max-width:560px;margin-left:auto;margin-right:var(--gutter);text-align:left}
.hero-card-inner{padding:44px 40px 40px;border-radius:var(--radius-card)}
.hero-card h1{font-size:clamp(36px,4.6vw,62px);line-height:1.02;margin:0 0 20px;letter-spacing:-.02em}
.hero-card .sub{font-size:15px;line-height:1.6;color:#3e3b33;max-width:440px;margin:0 0 30px}
.hero-card .actions{display:flex;gap:14px;flex-wrap:wrap}
.work{max-width:var(--container);margin:0 auto;padding:var(--space-6) var(--gutter)}
.work-head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-bottom:var(--space-5);flex-wrap:wrap}
.work-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:40px 28px}
.tracks{background:var(--ink-soft);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.tracks-inner{max-width:var(--container);margin:0 auto;padding:var(--space-6) var(--gutter);display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5)}
.track p{font-size:15px;line-height:1.65;color:#dad5c8;max-width:46ch}
.contact-panel{position:relative;z-index:10;max-width:640px;width:calc(100% - 2 * var(--gutter));margin:0 auto;padding:52px 48px;border-radius:var(--radius-card)}
.contact-panel .eyebrow{justify-content:center}
.contact-panel h1{text-align:center;font-size:clamp(32px,4.4vw,50px);margin:0 0 14px}
.contact-panel .sub{text-align:center;font-size:15px;line-height:1.6;color:#3e3b33;max-width:46ch;margin:0 auto 36px}
.contact-form{display:flex;flex-direction:column;gap:14px}.contact-form .row{display:flex;gap:14px}.contact-form .field{flex:1}
.contact-form label{display:block;font:10px 'Space Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:#7a6b45;margin-bottom:6px}
.contact-form input,.contact-form textarea{width:100%;border:0;background:#dcd5c3;padding:13px 16px;font:14px 'Space Grotesk',sans-serif;color:var(--ink);outline:none;border-radius:10px}
.contact-form textarea{min-height:110px;resize:vertical}
.direct{display:flex;justify-content:center;gap:26px;margin-top:30px;padding-top:24px;border-top:1px solid var(--line-on-cream);font:12px 'Space Mono',monospace}
@media(max-width:900px){.work-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:760px){.panelStrip{grid-template-columns:repeat(2,1fr)}.tracks-inner{grid-template-columns:1fr}}
@media(max-width:640px){.contact-panel{padding:38px 26px}.contact-form .row,.direct{flex-direction:column}.direct{gap:10px;align-items:center}}
@media(max-width:560px){.work-grid{grid-template-columns:1fr}}
`;

export const GALLERY_SCRIPT = `
(() => {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  const buttons = [...document.querySelectorAll('[data-set-view]')];
  const items = [...gallery.querySelectorAll('.g-item')];
  const controls = document.getElementById('carouselControls');
  const count = document.getElementById('carouselCount');
  if (!items.length || !controls || !count) return;
  let current = 0;
  const show = (index) => {
    current = (index + items.length) % items.length;
    items.forEach((item, itemIndex) => item.classList.toggle('is-active', itemIndex === current));
    count.textContent = (current + 1) + ' / ' + items.length;
  };
  document.getElementById('prevBtn')?.addEventListener('click', () => show(current - 1));
  document.getElementById('nextBtn')?.addEventListener('click', () => show(current + 1));
  buttons.forEach((button) => button.addEventListener('click', () => {
    const view = button.dataset.setView;
    if (!view) return;
    gallery.dataset.view = view;
    buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    controls.classList.toggle('is-active', view === 'carousel');
    if (view === 'carousel') show(current);
  }));
})();
`;
