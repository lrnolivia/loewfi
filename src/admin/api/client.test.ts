import { describe, expect, it } from 'vitest';
import type { ContentCollection } from '../../shared/content/types';
import { fetchCapabilities, fetchWhoAmI, validateContent } from './client';

describe('fetchWhoAmI', () => {
  it('returns a validated Access identity', async () => {
    const result = await fetchWhoAmI({
      fetcher: async () =>
        new Response(
          JSON.stringify({
            ok: true,
            requestId: 'request-1',
            data: {
              email: 'lauren@example.com',
              authentication: 'cloudflare-access',
              accessJwtPresent: true,
              timestamp: '2026-08-30T12:00:00.000Z',
            },
          }),
          { status: 200 },
        ),
    });

    expect(result.email).toBe('lauren@example.com');
    expect(result.accessJwtPresent).toBe(true);
  });

  it('rejects malformed successful responses at the client boundary', async () => {
    await expect(
      fetchWhoAmI({
        fetcher: async () => new Response(JSON.stringify({ ok: true, requestId: 'request-1' }), { status: 200 }),
      }),
    ).rejects.toThrow('Invalid CMS identity response');
  });

  it('preserves the HTTP status on endpoint failures', async () => {
    const request = fetchWhoAmI({
      fetcher: async () => new Response(JSON.stringify({
        ok: false,
        requestId: 'request-2',
        error: {
          code: 'validation_failed',
          message: 'Unavailable',
          issues: [{ path: '$.title', message: 'cannot be empty' }],
        },
      }), { status: 503 }),
    });

    await expect(request).rejects.toMatchObject({
      status: 503,
      code: 'validation_failed',
      requestId: 'request-2',
      issues: [{ path: '$.title', message: 'cannot be empty' }],
    });
  });
});

describe('Milestone 4 API client', () => {
  it('parses capability discovery through the shared envelope', async () => {
    const result = await fetchCapabilities({
      fetcher: async () => Response.json({
        ok: true,
        requestId: 'request-3',
        data: {
          apiVersion: 1,
          contentSchemaVersion: 1,
          maxJsonBytes: 1_000_000,
          maxMediaBytes: 10_000_000,
          features: {
            contentValidation: true,
            artifactPlanning: true,
            publishedContentRead: true,
            media: true,
            drafts: true,
            preview: false,
            publishing: false,
          },
        },
      }),
    });
    expect(result.features).toMatchObject({ contentValidation: true, publishing: false });
  });

  it('posts content as JSON and parses the artifact plan', async () => {
    const content = { projects: [], pages: [], siteConfig: {} } as unknown as ContentCollection;
    let observedInit: RequestInit | undefined;
    const result = await validateContent(content, {
      fetcher: async (_input, init) => {
        observedInit = init;
        return Response.json({
          ok: true,
          requestId: 'request-4',
          data: {
            contentSchemaVersion: 1,
            summary: { projects: 0, pages: 0, projectIds: [], pageIds: [] },
            artifacts: [{
              path: 'generated-preview/renderer.css',
              contentType: 'text/css',
              sourceDocumentId: 'renderer',
              dependencies: [],
            }],
          },
        });
      },
    });
    expect(observedInit).toMatchObject({ method: 'POST', body: JSON.stringify(content) });
    expect(result.artifacts[0].contentType).toBe('text/css');
  });
});
