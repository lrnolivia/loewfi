import { describe, expect, it } from 'vitest';
import { authenticatedRequest, invokeCmsApi } from '../../../../src/test/cms-api';
import { onRequest } from './index';

describe('published content endpoint', () => {
  it('returns the validated repository snapshot and revision', async () => {
    const response = await invokeCmsApi(
      onRequest,
      authenticatedRequest('https://loew.fi/admin/api/content'),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      source: 'bundled-repository',
      revision: 'test-revision',
      collection: {
        projects: [
          { id: 'hydroviv' },
          { id: 'cksteele' },
          { id: 'avedastudio' },
        ],
        pages: [{ id: 'home' }, { id: 'about' }, { id: 'contact' }],
      },
    });
  });
});
