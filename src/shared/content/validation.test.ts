import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import about from './fixtures/about.json';
import avedastudio from './fixtures/avedastudio.json';
import cksteele from './fixtures/cksteele.json';
import contact from './fixtures/contact.json';
import home from './fixtures/home.json';
import hydroviv from './fixtures/hydroviv.json';
import siteConfig from './fixtures/site-config.json';
import {
  ContentValidationError,
  parseContentDocument,
  parseProjectDocument,
  validateContentCollection,
} from './validation';

const documents: unknown[] = [hydroviv, cksteele, avedastudio, about, home, contact, siteConfig];

function clone<T>(value: T): T {
  return structuredClone(value);
}

describe('canonical content fixtures', () => {
  it.each(documents.map((document) => [String((document as { id: string }).id), document]))(
    'validates %s',
    (_id, document) => {
      expect(parseContentDocument(document)).toBeTruthy();
    },
  );

  it('validates the documents as one referentially consistent collection', () => {
    const collection = validateContentCollection({
      projects: [hydroviv, cksteele, avedastudio],
      pages: [home, about, contact],
      siteConfig,
    });

    expect(collection.projects).toHaveLength(3);
    expect(collection.pages).toHaveLength(3);
  });

  it('references image files that exist in the repository', () => {
    const paths = collectImagePaths(documents);
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      expect(existsSync(resolve(process.cwd(), path)), `Missing fixture image: ${path}`).toBe(true);
    }
  });
});

describe('content validation invariants', () => {
  it('rejects path traversal in media references', () => {
    const invalid = clone(avedastudio);
    invalid.hero.image.web.path = '../private/photo.jpg';
    expect(() => parseProjectDocument(invalid)).toThrow(/safe repository-relative image path/);
  });

  it('rejects unsafe inline-link protocols', () => {
    const invalid = clone(about);
    invalid.body[7].content = [{ type: 'link', text: 'bad link', href: 'javascript:alert(1)' }];
    expect(() => parseContentDocument(invalid)).toThrow(/unsupported URL protocol/);
  });

  it('rejects duplicate stable block ids', () => {
    const invalid = clone(hydroviv);
    invalid.body[1].id = invalid.body[0].id;
    expect(() => parseProjectDocument(invalid)).toThrow(/duplicate block id/);
  });

  it('requires exactly two figures in a figure pair', () => {
    const invalid = clone(hydroviv);
    const pair = invalid.body.find((block) => block.type === 'figure-pair');
    if (!pair || !('figures' in pair) || !Array.isArray(pair.figures)) throw new Error('Fixture pair is missing');
    pair.figures.pop();
    expect(() => parseProjectDocument(invalid)).toThrow(/exactly 2 figures/);
  });

  it('does not allow gallery collection size to undercount included figures', () => {
    const invalid = clone(avedastudio);
    invalid.gallery.collectionSize = 1;
    expect(() => parseProjectDocument(invalid)).toThrow(/cannot be smaller/);
  });

  it('rejects unknown fields instead of silently discarding content', () => {
    const invalid = { ...clone(hydroviv), legacyHtml: '<p>hidden</p>' };
    expect(() => parseProjectDocument(invalid)).toThrow(/unsupported field: legacyHtml/);
  });

  it('rejects site configuration references to unknown projects', () => {
    const invalidConfig = clone(siteConfig);
    invalidConfig.projectOrder.design.push('not-a-project');
    expect(() =>
      validateContentCollection({
        projects: [hydroviv, cksteele, avedastudio],
        pages: [home, about, contact],
        siteConfig: invalidConfig,
      }),
    ).toThrow(/references unknown project not-a-project/);
  });

  it('returns path-aware validation errors', () => {
    const invalid = clone(contact);
    invalid.form.delivery.recipientEmail = 'not-an-email';
    try {
      parseContentDocument(invalid);
      throw new Error('Expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationError);
      expect((error as ContentValidationError).issues[0].path).toBe('$.form.delivery.recipientEmail');
    }
  });
});

function collectImagePaths(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(collectImagePaths);
  if (typeof value !== 'object' || value === null) return [];
  const record = value as Record<string, unknown>;
  const ownPath = typeof record.path === 'string' && /\.(?:avif|gif|jpe?g|png|webp)$/i.test(record.path)
    ? [record.path]
    : [];
  return ownPath.concat(Object.values(record).flatMap(collectImagePaths));
}
