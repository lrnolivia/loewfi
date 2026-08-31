import { describe, expect, it } from 'vitest';
import { adminHref, parseAdminHash } from './router';

describe('admin hash router', () => {
  it('maps the supported CMS routes', () => {
    expect(parseAdminHash('')).toEqual({ name: 'dashboard' });
    expect(parseAdminHash('#/projects/')).toEqual({ name: 'projects' });
    expect(parseAdminHash('#/projects/new')).toEqual({ name: 'new-project' });
    expect(parseAdminHash('#/projects/new/design')).toEqual({ name: 'new-project-editor', projectType: 'design' });
    expect(parseAdminHash('#/projects/new/photography')).toEqual({ name: 'new-project-editor', projectType: 'photography' });
    expect(parseAdminHash('#/projects/cksteele')).toEqual({ name: 'project', slug: 'cksteele' });
    expect(parseAdminHash('#/projects/cksteele/edit')).toEqual({ name: 'project-editor', slug: 'cksteele' });
  });

  it('rejects unsafe and unknown paths', () => {
    expect(parseAdminHash('#/projects/../secret')).toEqual({ name: 'not-found' });
    expect(parseAdminHash('#/projects/new/video')).toEqual({ name: 'not-found' });
    expect(parseAdminHash('#/settings')).toEqual({ name: 'not-found' });
  });

  it('creates stable internal links', () => {
    expect(adminHref('/projects/hydroviv')).toBe('#/projects/hydroviv');
  });
});
