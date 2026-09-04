import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { designCatalogSlugs, photoSlugs } from './content/portfolio.js';

const redirectsPath = fileURLToPath(new URL('../../public/_redirects', import.meta.url));
const redirectLines = readFileSync(redirectsPath, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

describe('Cloudflare public-site routing', () => {
  it('keeps /mockup as a one-way redirect to the production React site', () => {
    expect(redirectLines).toContain('/mockup / 301');
    expect(redirectLines).toContain('/mockup/ / 301');
    expect(redirectLines).not.toContain('/ /mockup 301');
  });

  it('rewrites every production route to the React shell', () => {
    const routes = ['photo', 'design', 'about', 'contact', ...photoSlugs, ...designCatalogSlugs];
    for (const route of routes) expect(redirectLines).toContain(`/${route} / 200`);
  });

  it('uses only status codes supported by Cloudflare Pages redirects', () => {
    const supported = new Set(['200', '301', '302', '303', '307', '308']);
    for (const line of redirectLines) {
      const status = line.split(/\s+/).at(-1);
      expect(supported.has(status || '')).toBe(true);
    }
  });
});
