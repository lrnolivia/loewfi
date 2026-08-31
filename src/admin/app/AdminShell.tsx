import type { PropsWithChildren } from 'react';
import type { WhoAmI } from '../../shared/api/whoami';
import { adminHref, type AdminRoute } from './router';

const navigation = [
  { label: 'Dashboard', href: adminHref('/'), section: 'dashboard', ready: true },
  { label: 'Projects', href: adminHref('/projects'), section: 'projects', ready: true },
  { label: 'Pages', href: '#', section: 'pages', ready: false },
  { label: 'Media', href: '#', section: 'media', ready: false },
  { label: 'Settings', href: '#', section: 'settings', ready: false },
] as const;

export function AdminShell({
  route,
  identity,
  children,
}: PropsWithChildren<{ route: AdminRoute; identity: WhoAmI }>) {
  const active = route.name === 'dashboard' ? 'dashboard' : route.name.includes('project') ? 'projects' : '';
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__top">
          <a className="admin-brand" href="/" aria-label="Return to loew.fi">loew.fi</a>
          <span className="admin-version">CMS / 01</span>
        </div>
        <nav aria-label="Control panel">
          {navigation.map((item) => item.ready ? (
            <a
              className="admin-nav-item"
              href={item.href}
              aria-current={active === item.section ? 'page' : undefined}
              key={item.label}
            >
              <span>{item.label}</span><i aria-hidden="true" />
            </a>
          ) : (
            <span className="admin-nav-item is-disabled" aria-disabled="true" key={item.label}>
              <span>{item.label}</span><small>Later</small>
            </span>
          ))}
        </nav>
        <div className="admin-sidebar__identity">
          <span className="identity-dot" aria-hidden="true" />
          <div><small>Signed in</small><span>{identity.email}</span></div>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
