import { describe, expect, it } from 'vitest';
import { authenticatedRequest, invokeCmsApi } from '../../../src/test/cms-api';
import { readAccessIdentity } from './_lib/http';
import { onRequest } from './whoami';

describe('CMS API authentication pipeline', () => {
  it('returns the Access identity in the standard envelope without exposing the JWT', async () => {
    const response = await invokeCmsApi(onRequest, new Request('https://loew.fi/admin/api/whoami', {
      headers: {
        'Cf-Access-Authenticated-User-Email': 'lauren@example.com',
        'Cf-Access-Jwt-Assertion': 'secret-token',
        'Cf-Ray': 'request-123-IAD',
      },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-request-id')).toBe('request');
    expect(body).toMatchObject({
      ok: true,
      requestId: 'request',
      data: { email: 'lauren@example.com', accessJwtPresent: true },
    });
    expect(JSON.stringify(body)).not.toContain('secret-token');
  });

  it('rejects requests missing either Access identity header', async () => {
    const response = await invokeCmsApi(onRequest, new Request('https://loew.fi/admin/api/whoami'));
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: { code: 'unauthorized' },
    });
  });

  it('returns a JSON 405 with the allowed method', async () => {
    const response = await invokeCmsApi(onRequest, authenticatedRequest('https://loew.fi/admin/api/whoami', {
      method: 'POST',
    }));
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET');
  });

  it('allows an explicit local identity only on a loopback hostname', () => {
    expect(readAccessIdentity(new Request('http://localhost/admin/api/whoami'), 'local@loew.fi')).toMatchObject({
      email: 'local@loew.fi',
      authentication: 'local-development',
      accessJwtPresent: false,
    });
    expect(() => readAccessIdentity(new Request('https://loew.fi/admin/api/whoami'), 'local@loew.fi')).toThrow(
      'Cloudflare Access identity',
    );
  });
});
