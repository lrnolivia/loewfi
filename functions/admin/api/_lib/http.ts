import {
  CMS_MAX_JSON_BYTES,
  type ApiErrorCode,
  type ApiFailure,
  type ApiSuccess,
  type CmsIdentity,
} from '../../../../src/shared/api/contracts';
import { ContentValidationError } from '../../../../src/shared/content/validation';
import type { CmsApiData } from './types';

export class CmsApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly issues?: ContentValidationError['issues'],
    readonly headers?: HeadersInit,
  ) {
    super(message);
    this.name = 'CmsApiError';
  }
}

export function requestId(request: Request): string {
  return request.headers.get('cf-ray')?.split('-')[0] || crypto.randomUUID();
}

export function readAccessIdentity(request: Request, localAdminEmail?: string): CmsIdentity {
  const email = request.headers.get('Cf-Access-Authenticated-User-Email')?.trim();
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (email && jwt) {
    return {
      email,
      authentication: 'cloudflare-access',
      accessJwtPresent: true,
      timestamp: new Date().toISOString(),
    };
  }
  const hostname = new URL(request.url).hostname;
  if (localAdminEmail && ['localhost', '127.0.0.1', '::1'].includes(hostname)) {
    return {
      email: localAdminEmail,
      authentication: 'local-development',
      accessJwtPresent: false,
      timestamp: new Date().toISOString(),
    };
  }
  throw new CmsApiError(401, 'unauthorized', 'A valid Cloudflare Access identity is required.');
}

export function requireIdentity(data: CmsApiData): CmsIdentity {
  if (!data.identity) {
    throw new CmsApiError(401, 'unauthorized', 'A valid Cloudflare Access identity is required.');
  }
  return data.identity;
}

export function allowMethod(request: Request, allowed: string[]): void {
  if (!allowed.includes(request.method)) {
    throw new CmsApiError(
      405,
      'method_not_allowed',
      `Use ${allowed.join(' or ')} for this endpoint.`,
      undefined,
      { allow: allowed.join(', ') },
    );
  }
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    throw new CmsApiError(415, 'unsupported_media_type', 'Content-Type must be application/json.');
  }
  const announcedLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(announcedLength) && announcedLength > CMS_MAX_JSON_BYTES) {
    throw new CmsApiError(413, 'payload_too_large', `JSON bodies are limited to ${CMS_MAX_JSON_BYTES} bytes.`);
  }
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > CMS_MAX_JSON_BYTES) {
    throw new CmsApiError(413, 'payload_too_large', `JSON bodies are limited to ${CMS_MAX_JSON_BYTES} bytes.`);
  }
  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new CmsApiError(400, 'invalid_json', 'The request body is not valid JSON.');
  }
}

export function jsonSuccess<T>(data: T, requestIdValue: string, status = 200): Response {
  return jsonResponse<ApiSuccess<T>>({ ok: true, data, requestId: requestIdValue }, status, requestIdValue);
}

export function errorResponse(error: unknown, requestIdValue: string): Response {
  const normalized = normalizeError(error);
  const body: ApiFailure = {
    ok: false,
    error: {
      code: normalized.code,
      message: normalized.message,
      ...(normalized.issues ? { issues: normalized.issues } : {}),
    },
    requestId: requestIdValue,
  };
  return jsonResponse(body, normalized.status, requestIdValue, normalized.headers);
}

export function reportUnexpectedApiError(error: unknown, requestIdValue: string): void {
  if (error instanceof CmsApiError || error instanceof ContentValidationError) return;
  console.error('Unexpected CMS API error', { requestId: requestIdValue, error });
}

function normalizeError(error: unknown): CmsApiError {
  if (error instanceof CmsApiError) return error;
  if (error instanceof ContentValidationError) {
    return new CmsApiError(422, 'validation_failed', 'Canonical content validation failed.', error.issues);
  }
  return new CmsApiError(500, 'internal_error', 'The CMS API could not complete the request.');
}

function jsonResponse<T>(
  body: T,
  status: number,
  requestIdValue: string,
  extraHeaders: HeadersInit = {},
): Response {
  return Response.json(body, {
    status,
    headers: {
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      'x-request-id': requestIdValue,
      ...extraHeaders,
    },
  });
}
