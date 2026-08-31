import {
  CMS_API_VERSION,
  CMS_MAX_JSON_BYTES,
  type CmsCapabilities,
} from '../../../src/shared/api/contracts';
import { CONTENT_SCHEMA_VERSION } from '../../../src/shared/content/types';
import { allowMethod, jsonSuccess, requireIdentity } from './_lib/http';
import type { CmsRouteContext } from './_lib/types';

export function onRequest(context: CmsRouteContext): Response {
  allowMethod(context.request, ['GET']);
  requireIdentity(context.data);
  const capabilities: CmsCapabilities = {
    apiVersion: CMS_API_VERSION,
    contentSchemaVersion: CONTENT_SCHEMA_VERSION,
    maxJsonBytes: CMS_MAX_JSON_BYTES,
    features: {
      contentValidation: true,
      artifactPlanning: true,
      publishedContentRead: true,
      drafts: false,
      preview: false,
      publishing: false,
    },
  };
  return jsonSuccess(capabilities, context.data.requestId ?? 'missing-request-id');
}
