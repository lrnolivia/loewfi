import { describe, expect, it } from 'vitest';
import about from '../../../../src/shared/content/fixtures/about.json';
import avedastudio from '../../../../src/shared/content/fixtures/avedastudio.json';
import cksteele from '../../../../src/shared/content/fixtures/cksteele.json';
import contact from '../../../../src/shared/content/fixtures/contact.json';
import home from '../../../../src/shared/content/fixtures/home.json';
import hydroviv from '../../../../src/shared/content/fixtures/hydroviv.json';
import siteConfig from '../../../../src/shared/content/fixtures/site-config.json';
import { CMS_MAX_JSON_BYTES } from '../../../../src/shared/api/contracts';
import { authenticatedRequest, invokeCmsApi } from '../../../../src/test/cms-api';
import { onRequest } from './validate';

const validCollection = {
  projects: [hydroviv, cksteele, avedastudio],
  pages: [home, about, contact],
  siteConfig,
};

describe('content validation endpoint', () => {
  it('validates the collection and returns an artifact plan without rendered content', async () => {
    const response = await invokeCmsApi(onRequest, jsonRequest(validCollection));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.summary).toEqual({
      projects: 3,
      pages: 3,
      projectIds: ['hydroviv', 'cksteele', 'avedastudio'],
      pageIds: ['home', 'about', 'contact'],
    });
    expect(body.data.artifacts).toHaveLength(8);
    expect(body.data.artifacts.map((artifact: { path: string }) => artifact.path)).toContain(
      'generated-preview/hydroviv.html',
    );
    expect(JSON.stringify(body.data.artifacts)).not.toContain('<!doctype html>');
  });

  it('returns path-addressable validation issues', async () => {
    const invalid = structuredClone(validCollection);
    invalid.projects[0].slug = '../escape';
    const response = await invokeCmsApi(onRequest, jsonRequest(invalid));
    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body).toMatchObject({
      ok: false,
      error: {
        code: 'validation_failed',
        issues: [{ path: '$.slug', message: 'must be a lowercase kebab-case slug' }],
      },
    });
  });

  it('rejects malformed JSON and incorrect media types', async () => {
    const malformed = await invokeCmsApi(onRequest, authenticatedRequest(
      'https://loew.fi/admin/api/content/validate',
      { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' },
    ));
    expect(malformed.status).toBe(400);

    const wrongType = await invokeCmsApi(onRequest, authenticatedRequest(
      'https://loew.fi/admin/api/content/validate',
      { method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}' },
    ));
    expect(wrongType.status).toBe(415);
  });

  it('rejects announced oversized bodies without reading them', async () => {
    const response = await invokeCmsApi(onRequest, authenticatedRequest(
      'https://loew.fi/admin/api/content/validate',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': String(CMS_MAX_JSON_BYTES + 1),
        },
        body: '{}',
      },
    ));
    expect(response.status).toBe(413);
  });
});

function jsonRequest(body: unknown): Request {
  return authenticatedRequest('https://loew.fi/admin/api/content/validate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}
