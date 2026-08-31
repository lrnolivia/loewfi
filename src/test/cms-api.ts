import { withAccessIdentity, withApiErrors } from '../../functions/admin/api/_middleware';
import type { CmsApiData, CmsRouteHandler } from '../../functions/admin/api/_lib/types';

export async function invokeCmsApi(handler: CmsRouteHandler, request: Request): Promise<Response> {
  const data: CmsApiData = {};
  const env = { CF_PAGES_COMMIT_SHA: 'test-revision' };
  return withApiErrors({
    request,
    data,
    env,
    next: () => withAccessIdentity({
      request,
      data,
      env,
      next: async () => handler({ request, data, env }),
    }),
  });
}

export function authenticatedRequest(url: string, init: RequestInit = {}): Request {
  const headers = new Headers(init.headers);
  headers.set('Cf-Access-Authenticated-User-Email', 'lauren@example.com');
  headers.set('Cf-Access-Jwt-Assertion', 'secret-token');
  headers.set('Cf-Ray', 'request-123-IAD');
  return new Request(url, { ...init, headers });
}
