import { useEffect, useState } from 'react';

export type AdminRoute =
  | { name: 'dashboard' }
  | { name: 'projects' }
  | { name: 'project'; slug: string }
  | { name: 'project-editor'; slug: string }
  | { name: 'new-project' }
  | { name: 'new-project-editor'; projectType: 'design' | 'photography' }
  | { name: 'not-found' };

export function parseAdminHash(hash: string): AdminRoute {
  const path = hash.replace(/^#/, '').replace(/\/+$/, '') || '/';
  if (path === '/') return { name: 'dashboard' };
  if (path === '/projects') return { name: 'projects' };
  if (path === '/projects/new') return { name: 'new-project' };
  if (path === '/projects/new/design') return { name: 'new-project-editor', projectType: 'design' };
  if (path === '/projects/new/photography') return { name: 'new-project-editor', projectType: 'photography' };
  const editorMatch = path.match(/^\/projects\/([a-z0-9]+(?:-[a-z0-9]+)*)\/edit$/);
  if (editorMatch) return { name: 'project-editor', slug: editorMatch[1] };
  const match = path.match(/^\/projects\/([a-z0-9]+(?:-[a-z0-9]+)*)$/);
  return match ? { name: 'project', slug: match[1] } : { name: 'not-found' };
}

export function adminHref(path: '/' | '/projects' | '/projects/new' | `/projects/${string}`): string {
  return `#${path}`;
}

export function useAdminRoute(): AdminRoute {
  const [route, setRoute] = useState(() => parseAdminHash(window.location.hash));
  useEffect(() => {
    const update = () => setRoute(parseAdminHash(window.location.hash));
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return route;
}
