import type { PublishedContentSnapshot } from '../../../../src/shared/api/contracts';
import { allowMethod, jsonSuccess, requireIdentity } from '../_lib/http';
import { readBundledContent } from '../_lib/bundled-content';
import type { CmsRouteContext } from '../_lib/types';

export function onRequest(context: CmsRouteContext): Response {
  allowMethod(context.request, ['GET']);
  requireIdentity(context.data);
  const snapshot: PublishedContentSnapshot = {
    collection: readBundledContent(),
    revision: context.env.CF_PAGES_COMMIT_SHA || 'local-working-tree',
    source: 'bundled-repository',
  };
  return jsonSuccess(snapshot, context.data.requestId ?? 'missing-request-id');
}
