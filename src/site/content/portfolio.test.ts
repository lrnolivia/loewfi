import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  designCatalogSlugs,
  featuredSlugs,
  photographyProjects,
  photoSlugs,
  projectCatalog,
} from './portfolio.js';

const assetRoot = fileURLToPath(new URL('../../../portfolio/assets/', import.meta.url));

describe('public portfolio catalog', () => {
  it('keeps every route slug unique and represented in the catalog', () => {
    const allSlugs = [...photoSlugs, ...designCatalogSlugs];
    expect(new Set(allSlugs).size).toBe(allSlugs.length);
    expect(Object.keys(projectCatalog).sort()).toEqual([...allSlugs].sort());
  });

  it('references only source assets that exist in the canonical portfolio archive', () => {
    const projects = Object.values(projectCatalog) as Array<{ cover: string; images?: string[] }>;
    const sourceAssets = projects.flatMap((project) => project.images || [project.cover]);
    const missing = sourceAssets.filter((relativePath) => !existsSync(`${assetRoot}${relativePath}`));
    expect(missing).toEqual([]);
  });

  it('keeps collection sizes synchronized with the real archive', () => {
    expect(Object.fromEntries(Object.entries(photographyProjects).map(([slug, project]) => [slug, project.images.length]))).toEqual({
      avedalife: 42,
      avedastudio: 44,
      islesashore: 10,
      magnoliafields: 10,
      leavesleos: 11,
    });
  });

  it('features only valid production projects', () => {
    const catalog = projectCatalog as Record<string, unknown>;
    expect(featuredSlugs.every((slug) => Boolean(catalog[slug]))).toBe(true);
  });
});
