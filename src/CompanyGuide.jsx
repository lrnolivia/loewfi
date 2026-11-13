import { useState } from 'react';
import mossImage from '../images/terra-prime/moss.png?url';
import { checkedDate, phases, sources, itemIds } from './company-guide-data.js';
import { readProgress, saveProgress, clearProgress } from './company-guide-progress.js';

function readSaved() {
  try { return readProgress(window.localStorage); } catch { return { checked: {}, available: false }; }
}
function SourceLinks({ ids }) {
  return <p className="guide-sources">{ids.map((id) => <a key={id} href={sources[id].url} rel="noreferrer">{sources[id].label} <span aria-hidden="true">↗</span></a>)}<span>Checked {checkedDate}</span></p>;
}

export default function CompanyGuide() {
  const [initial] = useState(readSaved);
  const [checked, setChecked] = useState(initial.checked);
  const [available, setAvailable] = useState(initial.available);
  const [message, setMessage] = useState('');
  const count = itemIds.filter((id) => checked[id]).length;
  const toggle = (id) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    let saved = false;
    try { saved = saveProgress(window.localStorage, next); } catch { /* Device-only fallback. */ }
    setAvailable(saved);
    setMessage('');
  };
  const reset = () => {
    if (!window.confirm('Reset all checklist progress in this browser? This cannot be undone.')) return;
    setChecked({});
    let cleared = false;
    try { cleared = clearProgress(window.localStorage); } catch { /* Device-only fallback. */ }
    setAvailable(cleared);
    setMessage(cleared ? 'Progress reset in this browser.' : 'Progress reset for this visit. Browser storage could not be cleared; older saved checks may return after reload.');
  };

  return (
    <div className="company-guide">
      <a className="guide-skip" href="#guide-content">Skip to guide</a>
      <header className="guide-header">
        <div className="accent-rail" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className="guide-header-row"><a className="brand" href="/">loew.fi</a><span className="guide-meta">Field Notes / Company Guide</span><a className="guide-home" href="/">Back to the front door <span aria-hidden="true">↗</span></a></div>
      </header>
      <main id="guide-content" tabIndex={-1}>
        <section className="guide-intro" aria-labelledby="guide-title">
          <img src={mossImage} alt="" aria-hidden="true" className="guide-moss" />
          <div className="guide-intro-copy"><p className="guide-kicker">A little structure for the big ideas</p><h1 id="guide-title">making loew<br />fidelity official</h1><p className="guide-deck">One company. Room for every idea.<br />A practical path from “someday” to ready.</p><p className="guide-meta">Florida / one owner / adult-audience apps<br />Sources checked November 13, 2026</p></div>
        </section>
        <div className="guide-body">
          <aside className="guide-notice"><strong>A link for your own reference.</strong><p>This page is unlisted and asks search engines not to index it. It is not private or password-protected: anyone with the URL can open it. No formation, trademark clearance or store enrollment is confirmed here.</p></aside>
          <section className="guide-costs" aria-labelledby="cost-title">
            <div><p className="guide-kicker">Start small</p><h2 id="cost-title">what to budget</h2><p className="guide-muted">Pay for the next step, when you need it.</p></div>
            <div className="guide-cost-grid">
              <article><p className="guide-price">$125<span>to form</span></p><h3>Florida LLC</h3><p>$100 articles + $25 agent designation. Agent services cost extra.</p><SourceLinks ids={['fees']} /></article>
              <article><p className="guide-price">$0<span>direct from the IRS</span></p><h3>EIN</h3><p>After formation. Skip paid application services.</p><SourceLinks ids={['ein']} /></article>
              <article><p className="guide-price">$138.75<span>each report year</span></p><h3>Annual report</h3><p>January 1–May 1. Generally $400 extra after May 1.</p><SourceLinks ids={['fees', 'supplement', 'report']} /></article>
            </div>
            <div className="guide-store-budget"><p><strong>$249 if you also join both stores:</strong> $125 formation + Apple $99/year + Google Play $25 once. Stores can wait.</p><p className="guide-muted">Not an all-in launch budget. Excludes agent/address services, optional filings and ads, taxes, insurance, hosting, payment fees and operations. Apple renews annually.</p><SourceLinks ids={['appleFee', 'play']} /></div>
          </section>
          <section className="guide-progress" aria-labelledby="progress-title">
            <div><h2 id="progress-title">your next small steps</h2><p>Checks save only in this browser on this device. Clearing browser data removes them. Checking a box submits nothing and does not complete an official filing.</p></div>
            <div className="guide-progress-tools"><span role="status" aria-live="polite">{count} / {itemIds.length} checked</span><progress aria-label="Checklist progress" value={count} max={itemIds.length} /><button type="button" onClick={reset}>Reset progress</button></div>
            {!available && <p className="guide-storage-note" role="status">Browser storage is unavailable. You can still use the checklist for this visit; changes may not survive reload.</p>}
            {message && <p role="status" className="guide-storage-note">{message}</p>}
          </section>
          <nav className="guide-phase-links" aria-label="Guide phases">{phases.map((phase, i) => <a key={phase.id} href={`#${phase.id}`}><span>0{i + 1}</span>{phase.title}</a>)}</nav>
          {phases.map((phase, i) => (
            <section className="guide-phase" id={phase.id} key={phase.id} aria-labelledby={`${phase.id}-title`}>
              <div className="guide-phase-heading"><p className="guide-phase-number">0{i + 1}</p><div><h2 id={`${phase.id}-title`}>{phase.title}</h2><p>{phase.note}</p></div></div>
              <ul className="guide-checklist">{phase.items.map((item) => <li key={item.id} className={checked[item.id] ? 'is-checked' : ''}>
                <div className="guide-check-title"><input id={`check-${item.id}`} type="checkbox" checked={Boolean(checked[item.id])} onChange={() => toggle(item.id)} /><label htmlFor={`check-${item.id}`}>{item.title}</label></div>
                <div className="guide-item-content"><p>{item.body}</p><details><summary>A little more detail</summary><p>{item.detail}</p></details><SourceLinks ids={item.refs} />{item.id === 'names' && <p className="guide-extra-link"><a href="https://search.sunbiz.org/Inquiry/CorporationSearch/ByName" rel="noreferrer">Search Sunbiz business records ↗</a></p>}{item.id === 'file' && <p className="guide-extra-link"><a href="https://dos.fl.gov/sunbiz/start-business/efile/fl-llc/instructions" rel="noreferrer">Open official Sunbiz filing instructions ↗</a></p>}</div>
              </li>)}</ul>
            </section>
          ))}
          <footer className="guide-end"><p className="guide-kicker">Make it real, one step at a time.</p><h2>Keep the ideas.<br />Give them a home.</h2><p>Educational guidance, not legal, tax or financial advice. Requirements change. Verify current fees and rules with the linked official sources before acting, and seek qualified advice for the actual business.</p><p className="guide-muted">Florida fee and timing claims were checked against state statutes. Sunbiz guidance pages blocked automated reads; re-open its filing instructions before filing. This guide collects no notes or personal information and adds no tracking.</p><button type="button" className="guide-print" onClick={() => window.print()}>Print this guide</button><a href="#guide-title">Back to top ↑</a></footer>
        </div>
      </main>
      <footer className="guide-footer"><a href="/">loew.fi / Field Notes</a><span>Company guide · {checkedDate}</span></footer>
    </div>
  );
}
