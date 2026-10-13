import type { ContentValidationResult } from '../../../../src/shared/api/contracts';
import { CONTENT_SCHEMA_VERSION } from '../../../../src/shared/content/types';
import { validateContentCollection } from '../../../../src/shared/content/validation';
import { renderSite } from '../../../../src/renderer/site';
import { allowMethod, jsonSuccess, readJsonBody, requireIdentity } from '../_lib/http';
import type { CmsRouteContext } from '../_lib/types';

export async function onRequest(context: CmsRouteContext): Promise<Response> {
  allowMethod(context.request, ['POST']);
  requireIdentity(context.data);
  const input = await readJsonBody(context.request);
  const collection = validateContentCollection(input);
  const artifacts = renderSite(collection).map(({ content: _content, ...artifact }) => artifact);
  const result: ContentValidationResult = {
    contentSchemaVersion: CONTENT_SCHEMA_VERSION,
    summary: {
      projects: collection.projects.length,
      pages: collection.pages.length,
      projectIds: collection.projects.map((project) => project.id),
      pageIds: collection.pages.map((page) => page.id),
    },
    artifacts,
  };
  return jsonSuccess(result, context.data.requestId ?? 'missing-request-id');
}
