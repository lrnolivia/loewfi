import { describe, expect, it } from 'vitest';
import hydroviv from '../../../../src/shared/content/fixtures/hydroviv.json';
import type { ProjectDraftRecord } from '../../../../src/shared/api/contracts';
import { authenticatedRequest, invokeCmsApi } from '../../../../src/test/cms-api';
import { MemoryKv } from '../../../../src/test/memory-kv';
import type { CmsRouteContext, CmsRouteHandler } from '../_lib/types';
import { onRequest } from './[draftId]';

const draftHandler = (draftId: string): CmsRouteHandler => (context: CmsRouteContext) =>
  onRequest({ ...context, params: { draftId } });

describe('project drafts endpoint', () => {
  it('saves, reads, conflict-checks, and removes a validated project draft', async () => {
    const kv = new MemoryKv();
    const url = 'https://loew.fi/admin/api/drafts/existing:hydroviv';
    const input = {
      document: hydroviv,
      expectedRevision: null,
      basePublishedRevision: 'published-1',
      mediaIds: [],
    };
    const savedResponse = await invokeCmsApi(
      draftHandler('existing:hydroviv'),
      authenticatedRequest(url, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) }),
      { CMS_DRAFTS: kv },
    );
    const saved = (await savedResponse.json()).data as ProjectDraftRecord;
    expect(savedResponse.status).toBe(200);
    expect(saved.document.title).toBe('Hydroviv');

    const readResponse = await invokeCmsApi(draftHandler('existing:hydroviv'), authenticatedRequest(url), { CMS_DRAFTS: kv });
    expect((await readResponse.json()).data.draft.revision).toBe(saved.revision);

    const conflictResponse = await invokeCmsApi(
      draftHandler('existing:hydroviv'),
      authenticatedRequest(url, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) }),
      { CMS_DRAFTS: kv },
    );
    expect(conflictResponse.status).toBe(409);
    expect((await conflictResponse.json()).error.code).toBe('conflict');

    const deleteResponse = await invokeCmsApi(
      draftHandler('existing:hydroviv'),
      authenticatedRequest(url, { method: 'DELETE', headers: { 'if-match': saved.revision } }),
      { CMS_DRAFTS: kv },
    );
    expect(deleteResponse.status).toBe(200);
    expect((await deleteResponse.json()).data.deleted).toBe(true);
  });

  it('rejects invalid canonical content instead of storing it server-side', async () => {
    const kv = new MemoryKv();
    const invalid = { ...hydroviv, slug: 'Bad Slug' };
    const response = await invokeCmsApi(
      draftHandler('existing:hydroviv'),
      authenticatedRequest('https://loew.fi/admin/api/drafts/existing:hydroviv', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ document: invalid, expectedRevision: null, basePublishedRevision: 'published-1', mediaIds: [] }),
      }),
      { CMS_DRAFTS: kv },
    );
    expect(response.status).toBe(422);
    expect((await response.json()).error.issues[0].path).toBe('$.slug');
  });
});
