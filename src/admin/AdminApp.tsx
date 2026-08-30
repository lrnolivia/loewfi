import { useEffect, useState } from 'react';
import { fetchWhoAmI } from './api/client';
import { Button, Panel, Surface } from './design-system';
import type { WhoAmI } from '../shared/api/whoami';

type IdentityState =
  | { status: 'loading' }
  | { status: 'ready'; identity: WhoAmI }
  | { status: 'error'; message: string };

const sections = ['Overview', 'Projects', 'Pages', 'Media', 'Settings'] as const;

export function AdminApp() {
  const [identity, setIdentity] = useState<IdentityState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    fetchWhoAmI({ signal: controller.signal })
      .then((result) => setIdentity({ status: 'ready', identity: result }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setIdentity({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown identity error',
        });
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/" aria-label="Return to loew.fi">
          loew.fi
        </a>
        <nav aria-label="Control panel">
          {sections.map((section, index) => (
            <button
              className="admin-nav-item"
              type="button"
              aria-current={index === 0 ? 'page' : undefined}
              disabled={index !== 0}
              key={section}
            >
              <span>{section}</span>
              {index !== 0 && <small>Later milestone</small>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <p className="admin-kicker">Control panel foundation</p>
            <h1>Good work deserves a calm workspace.</h1>
          </div>
          <IdentityBadge state={identity} />
        </header>

        <Surface className="welcome-surface">
          <div>
            <p className="admin-kicker">Milestone 1</p>
            <h2>The foundation is ready.</h2>
            <p>
              The admin is now an isolated React and TypeScript application. Content editing,
              drafts, media, preview, and publishing stay intentionally inactive until their
              milestones establish the underlying contracts.
            </p>
          </div>
          <Button disabled>New project</Button>
        </Surface>

        <section className="status-grid" aria-label="Foundation status">
          <Panel title="Admin application" status="Ready">
            Separate Vite entry point at <code>/admin/</code>, with no dependency on the
            temporary public landing-page implementation.
          </Panel>
          <Panel title="CMS API" status="Connected boundary">
            Typed client and Cloudflare Pages Function identity endpoint are in place. No
            publishing or mutation endpoints exist yet.
          </Panel>
          <Panel title="Design material" status="Awaiting handoff">
            Admin features consume local primitives, leaving one seam for the incoming Liquid
            Glass design system without coupling business logic to a renderer.
          </Panel>
        </section>
      </main>
    </div>
  );
}

function IdentityBadge({ state }: { state: IdentityState }) {
  if (state.status === 'loading') {
    return <span className="identity-badge is-loading">Checking access…</span>;
  }

  if (state.status === 'error') {
    return (
      <span className="identity-badge is-error" title={state.message}>
        Identity check unavailable
      </span>
    );
  }

  return (
    <span className={`identity-badge${state.identity.email ? '' : ' is-warning'}`}>
      {state.identity.email ?? 'No Access identity'}
    </span>
  );
}
