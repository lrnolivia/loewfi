import { describe, expect, it } from 'vitest';
import about from '../../../shared/content/fixtures/about.json';
import avedastudio from '../../../shared/content/fixtures/avedastudio.json';
import cksteele from '../../../shared/content/fixtures/cksteele.json';
import contact from '../../../shared/content/fixtures/contact.json';
import home from '../../../shared/content/fixtures/home.json';
import hydroviv from '../../../shared/content/fixtures/hydroviv.json';
import siteConfig from '../../../shared/content/fixtures/site-config.json';
import { validateContentCollection } from '../../../shared/content/validation';
import { collectionAssetCount, filterProjects, orderedProjects, projectItemCount } from './project-model';

const collection = validateContentCollection({
  projects: [hydroviv, cksteele, avedastudio],
  pages: [home, about, contact],
  siteConfig,
});

describe('project management view model', () => {
  it('uses configured public navigation order', () => {
    expect(orderedProjects(collection).map((project) => project.slug)).toEqual([
      'avedastudio',
      'hydroviv',
      'cksteele',
    ]);
  });

  it('filters by track and searches rich-text summaries', () => {
    const projects = orderedProjects(collection);
    expect(filterProjects(projects, '', 'design')).toHaveLength(2);
    expect(filterProjects(projects, 'water filtration', 'all').map((project) => project.slug)).toEqual(['hydroviv']);
    expect(filterProjects(projects, 'STUDIO BEAUTY', 'photography').map((project) => project.slug)).toEqual(['avedastudio']);
  });

  it('reports track-specific item counts and unique referenced assets', () => {
    expect(projectItemCount(collection.projects[0])).toBe(9);
    expect(projectItemCount(collection.projects[2])).toBe(44);
    expect(collectionAssetCount(collection)).toBeGreaterThan(10);
  });
});
