import { describe, expect, it } from 'vitest';
import { authenticatedRequest, invokeCmsApi } from '../../../../src/test/cms-api';
import { MemoryKv } from '../../../../src/test/memory-kv';
import { onRequest } from './index';

describe('media staging endpoint', () => {
  it('stores authenticated binary media with a safe canonical target path', async () => {
    const kv = new MemoryKv();
    const query = new URLSearchParams({
      projectType: 'photography',
      projectSlug: 'new-work',
      assetId: 'new-work-01',
      variant: 'web',
      width: '1600',
      height: '1200',
    });
    const response = await invokeCmsApi(
      onRequest,
      authenticatedRequest(`https://loew.fi/admin/api/media?${query}`, {
        method: 'POST',
        headers: { 'content-type': 'image/webp' },
        body: new Uint8Array([82, 73, 70, 70]),
      }),
      { CMS_MEDIA: kv },
    );
    const asset = (await response.json()).data;
    expect(response.status).toBe(201);
    expect(asset.targetPath).toBe('portfolio/assets/images/new-work/new-work-01.webp');
    expect(asset.byteLength).toBe(4);

    const readResponse = await invokeCmsApi(
      onRequest,
      authenticatedRequest(`https://loew.fi/admin/api/media?id=${asset.stagingId}`),
      { CMS_MEDIA: kv },
    );
    expect(readResponse.status).toBe(200);
    expect(readResponse.headers.get('content-type')).toBe('image/webp');
    expect(Array.from(new Uint8Array(await readResponse.arrayBuffer()))).toEqual([82, 73, 70, 70]);
  });

  it('rejects unsafe asset naming', async () => {
    const kv = new MemoryKv();
    const response = await invokeCmsApi(
      onRequest,
      authenticatedRequest('https://loew.fi/admin/api/media?projectType=design&projectSlug=safe&assetId=../bad&variant=web&width=1&height=1', {
        method: 'POST',
        headers: { 'content-type': 'image/webp' },
        body: new Uint8Array([1]),
      }),
      { CMS_MEDIA: kv },
    );
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe('validation_failed');
  });
});
