import { describe, expect, it } from 'vitest';
import { onRequestGet } from './whoami';

describe('whoami Pages Function', () => {
  it('returns the Cloudflare Access identity without exposing the JWT', async () => {
    const request = new Request('https://loew.fi/admin/api/whoami', {
      headers: {
        'Cf-Access-Authenticated-User-Email': 'lauren@example.com',
        'Cf-Access-Jwt-Assertion': 'secret-token',
      },
    });

    const response = await onRequestGet({ request });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(body).toMatchObject({
      ok: true,
      email: 'lauren@example.com',
      accessJwtPresent: true,
    });
    expect(JSON.stringify(body)).not.toContain('secret-token');
  });
});
