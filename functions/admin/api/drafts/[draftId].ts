import type {
  ProjectDraftDeleteResult,
  ProjectDraftSaveInput,
  ProjectDraftSnapshot,
} from '../../../../src/shared/api/contracts';
import { isRecord } from '../../../../src/shared/api/contracts';
import { parseProjectDocument } from '../../../../src/shared/content/validation';
import { allowMethod, CmsApiError, jsonSuccess, readJsonBody, requireIdentity } from '../_lib/http';
import { requireDraftRepository } from '../_lib/storage';
import type { CmsRouteContext } from '../_lib/types';

type DraftRouteContext = CmsRouteContext & { params: { draftId?: string | string[] } };

export async function onRequest(context: DraftRouteContext): Promise<Response> {
  allowMethod(context.request, ['GET', 'PUT', 'DELETE']);
  const identity = requireIdentity(context.data);
  const repository = requireDraftRepository(context.env);
  const draftId = routeDraftId(context.params.draftId);

  if (context.request.method === 'GET') {
    const result: ProjectDraftSnapshot = { draft: await repository.read(draftId) };
    return jsonSuccess(result, context.data.requestId ?? 'missing-request-id');
  }

  if (context.request.method === 'DELETE') {
    const expectedRevision = context.request.headers.get('if-match')?.trim();
    if (!expectedRevision) throw new CmsApiError(400, 'validation_failed', 'If-Match must contain the draft revision.');
    await repository.remove(draftId, expectedRevision);
    const result: ProjectDraftDeleteResult = { deleted: true, draftId };
    return jsonSuccess(result, context.data.requestId ?? 'missing-request-id');
  }

  const input = parseSaveInput(await readJsonBody(context.request));
  const record = await repository.save({
    draftId,
    document: input.document,
    expectedRevision: input.expectedRevision,
    basePublishedRevision: input.basePublishedRevision,
    mediaIds: input.mediaIds,
    actorEmail: identity.email,
  });
  return jsonSuccess(record, context.data.requestId ?? 'missing-request-id');
}

function parseSaveInput(value: unknown): ProjectDraftSaveInput {
  if (!isRecord(value)) throw new CmsApiError(400, 'validation_failed', 'Draft input must be an object.');
  if (value.expectedRevision !== null && typeof value.expectedRevision !== 'string') {
    throw new CmsApiError(400, 'validation_failed', 'Expected revision must be a string or null.');
  }
  if (typeof value.basePublishedRevision !== 'string' || value.basePublishedRevision.trim() === '') {
    throw new CmsApiError(400, 'validation_failed', 'Base published revision is required.');
  }
  if (!Array.isArray(value.mediaIds) || !value.mediaIds.every((id) => typeof id === 'string')) {
    throw new CmsApiError(400, 'validation_failed', 'Media ids must be an array of strings.');
  }
  return {
    document: parseProjectDocument(value.document),
    expectedRevision: value.expectedRevision,
    basePublishedRevision: value.basePublishedRevision,
    mediaIds: value.mediaIds,
  };
}

function routeDraftId(value: string | string[] | undefined): string {
  if (typeof value !== 'string' || value === '') throw new CmsApiError(400, 'validation_failed', 'Draft id is required.');
  try {
    return decodeURIComponent(value);
  } catch {
    throw new CmsApiError(400, 'validation_failed', 'Draft id is not valid URL encoding.');
  }
}
