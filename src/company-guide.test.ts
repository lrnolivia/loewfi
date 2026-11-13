import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { readProgress, saveProgress, clearProgress, storageKey } from './company-guide-progress.js';
import { itemIds, phases, sources } from './company-guide-data.js';

function memoryStorage() {
  const data = new Map<string, string>();
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); }, removeItem: (key: string) => { data.delete(key); } };
}
describe('device-only guide progress', () => {
  it('persists only known checked items, restores them, and resets its own key', () => {
    const storage = memoryStorage();
    storage.setItem('unrelated', 'keep');
    expect(saveProgress(storage, { names: true, file: false, privateNotes: true })).toBe(true);
    expect(readProgress(storage)).toEqual({ checked: { names: true }, available: true });
    expect(storage.getItem(storageKey)).not.toContain('privateNotes');
    expect(clearProgress(storage)).toBe(true);
    expect(readProgress(storage).checked).toEqual({});
    expect(storage.getItem('unrelated')).toBe('keep');
  });
  it('rejects unknown versions, unexpected shapes and truthy non-booleans', () => {
    const storage = memoryStorage();
    for (const value of [null, [], { version: 2, checked: { names: true } }, { version: 1, checked: [] }]) {
      storage.setItem(storageKey, JSON.stringify(value));
      expect(readProgress(storage).checked).toEqual({});
    }
    storage.setItem(storageKey, JSON.stringify({ version: 1, checked: { names: 'true', file: true, unknown: true } }));
    expect(readProgress(storage).checked).toEqual({ file: true });
  });
  it('keeps the checklist usable when saved JSON is corrupt or storage throws', () => {
    const storage = memoryStorage();
    storage.setItem(storageKey, '{bad');
    expect(readProgress(storage)).toEqual({ checked: {}, available: false });
    const denied = { getItem() { throw Error('denied'); }, setItem() { throw Error('quota'); }, removeItem() { throw Error('denied'); } };
    expect(readProgress(denied)).toEqual({ checked: {}, available: false });
    expect(saveProgress(denied, { names: true })).toBe(false);
    expect(clearProgress(denied)).toBe(false);
  });
});
describe('unlisted guide delivery', () => {
  const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
  it('delivers noindex before scripts, without changing homepage indexing or sitemap', () => {
    expect(read('company-guide/index.html')).toContain('content="noindex,nofollow,noarchive"');
    expect(read('index.html')).toContain('content="index,follow"');
    expect(read('public/_headers')).toContain('/company-guide\n  X-Robots-Tag: noindex');
    expect(read('public/sitemap.xml')).not.toContain('company-guide');
    expect(read('src/App.jsx')).not.toContain('company-guide');
    expect(read('vite.config.js')).toContain("'_headers'");
    expect(read('vite.config.js')).toContain("./company-guide/index.html");
  });
  it('gives every stable checklist item valid official citations and unique local progress identity', () => {
    expect(new Set(itemIds).size).toBe(itemIds.length);
    expect(phases.map((phase) => phase.title)).toEqual(['before filing', 'form the company', 'before launch', 'keep it current']);
    for (const item of phases.flatMap((phase) => phase.items)) {
      expect(item.refs.length).toBeGreaterThan(0);
      for (const ref of item.refs) {
        const url = new URL(sources[ref as keyof typeof sources].url);
        expect(url.protocol).toBe('https:');
        expect(url.hostname).toMatch(/(^|\.)(fl\.us|fl\.gov|floridarevenue\.com|irs\.gov|fincen\.gov|uspto\.gov|talgov\.com|apple\.com|google\.com)$/);
      }
    }
  });
});
