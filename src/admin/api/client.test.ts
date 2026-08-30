import { describe, expect, it } from 'vitest';
import { ApiError, fetchWhoAmI } from './client';

describe('fetchWhoAmI', () => {
  it('returns a validated Access identity', async () => {
    const result = await fetchWhoAmI({
      fetcher: async () =>
        new Response(
          JSON.stringify({
            ok: true,
            email: 'lauren@example.com',
            accessJwtPresent: true,
            timestamp: '2026-08-30T12:00:00.000Z',
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
        fetcher: async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
      }),
    ).rejects.toThrow('Invalid CMS identity response');
  });

  it('preserves the HTTP status on endpoint failures', async () => {
    const request = fetchWhoAmI({
      fetcher: async () => new Response('Unavailable', { status: 503 }),
    });

    await expect(request).rejects.toMatchObject({ status: 503 });
  });
});
