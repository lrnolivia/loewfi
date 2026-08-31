import { describe, expect, it } from 'vitest';
import { authenticatedRequest, invokeCmsApi } from '../../../src/test/cms-api';
import { onRequest } from './capabilities';

describe('capabilities endpoint', () => {
  it('reports storage-backed features as unavailable when bindings are absent', async () => {
    const response = await invokeCmsApi(onRequest, authenticatedRequest('https://loew.fi/admin/api/capabilities'));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      apiVersion: 1,
      contentSchemaVersion: 1,
      maxMediaBytes: 10_000_000,
      features: {
        contentValidation: true,
        artifactPlanning: true,
        publishedContentRead: true,
        media: false,
        drafts: false,
        preview: false,
        publishing: false,
      },
    });
  });
});
