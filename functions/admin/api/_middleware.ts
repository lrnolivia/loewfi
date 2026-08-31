import { errorResponse, readAccessIdentity, reportUnexpectedApiError, requestId } from './_lib/http';
import type { CmsApiContext } from './_lib/types';

export async function withApiErrors(context: CmsApiContext): Promise<Response> {
  const id = requestId(context.request);
  context.data.requestId = id;
  try {
    return await context.next();
  } catch (error) {
    reportUnexpectedApiError(error, id);
    return errorResponse(error, id);
  }
}

export async function withAccessIdentity(context: CmsApiContext): Promise<Response> {
  context.data.identity = readAccessIdentity(context.request, context.env.CMS_LOCAL_ADMIN_EMAIL);
  return context.next();
}

export const onRequest = [withApiErrors, withAccessIdentity];
