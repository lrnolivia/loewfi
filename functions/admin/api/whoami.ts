import { allowMethod, jsonSuccess, requireIdentity } from './_lib/http';
import type { CmsRouteContext } from './_lib/types';

export function onRequest(context: CmsRouteContext): Response {
  allowMethod(context.request, ['GET']);
  const identity = requireIdentity(context.data);
  return jsonSuccess(identity, context.data.requestId ?? 'missing-request-id');
}
