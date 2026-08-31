import type { ValidationIssue } from '../content/validation';
import { validateContentCollection } from '../content/validation';

export const CMS_API_VERSION = 1 as const;
export const CMS_MAX_JSON_BYTES = 1_000_000;

export type ApiErrorCode =
  | 'unauthorized'
  | 'method_not_allowed'
  | 'unsupported_media_type'
  | 'invalid_json'
  | 'payload_too_large'
  | 'validation_failed'
  | 'internal_error';

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  requestId: string;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
    issues?: ValidationIssue[];
  };
  requestId: string;
};

export type CmsIdentity = {
  email: string;
  authentication: 'cloudflare-access' | 'local-development';
  accessJwtPresent: boolean;
  timestamp: string;
};

export type CmsCapabilities = {
  apiVersion: typeof CMS_API_VERSION;
  contentSchemaVersion: 1;
  maxJsonBytes: number;
  features: {
    contentValidation: true;
    artifactPlanning: true;
    publishedContentRead: true;
    drafts: false;
    preview: false;
    publishing: false;
  };
};

export type PublishedContentSnapshot = {
  collection: import('../content/types').ContentCollection;
  revision: string;
  source: 'bundled-repository';
};

export type ArtifactPlanItem = {
  path: string;
  contentType: 'text/html' | 'text/css' | 'text/javascript';
  sourceDocumentId: string;
  dependencies: string[];
};

export type ContentValidationResult = {
  contentSchemaVersion: 1;
  summary: {
    projects: number;
    pages: number;
    projectIds: string[];
    pageIds: string[];
  };
  artifacts: ArtifactPlanItem[];
};

export function isApiFailure(value: unknown): value is ApiFailure {
  if (!isRecord(value) || value.ok !== false || typeof value.requestId !== 'string') return false;
  if (!isRecord(value.error)) return false;
  const issuesValid = value.error.issues === undefined || (
    Array.isArray(value.error.issues) &&
    value.error.issues.every((issue) =>
      isRecord(issue) && typeof issue.path === 'string' && typeof issue.message === 'string',
    )
  );
  return typeof value.error.code === 'string' && typeof value.error.message === 'string' && issuesValid;
}

export function parseApiSuccess<T>(value: unknown, parseData: (data: unknown) => T): ApiSuccess<T> {
  if (!isRecord(value) || value.ok !== true || typeof value.requestId !== 'string') {
    throw new Error('Invalid CMS API response envelope.');
  }
  return { ok: true, requestId: value.requestId, data: parseData(value.data) };
}

export function parseCmsCapabilities(value: unknown): CmsCapabilities {
  if (!isRecord(value) || !isRecord(value.features)) {
    throw new Error('Invalid CMS capabilities response.');
  }
  if (
    value.apiVersion !== CMS_API_VERSION ||
    value.contentSchemaVersion !== 1 ||
    typeof value.maxJsonBytes !== 'number' ||
    value.features.contentValidation !== true ||
    value.features.artifactPlanning !== true ||
    value.features.publishedContentRead !== true ||
    value.features.drafts !== false ||
    value.features.preview !== false ||
    value.features.publishing !== false
  ) {
    throw new Error('Invalid CMS capabilities response.');
  }
  return value as CmsCapabilities;
}

export function parseContentValidationResult(value: unknown): ContentValidationResult {
  if (!isRecord(value) || !isRecord(value.summary) || !Array.isArray(value.artifacts)) {
    throw new Error('Invalid content validation response.');
  }
  const validIds = (ids: unknown) => Array.isArray(ids) && ids.every((id) => typeof id === 'string');
  const validArtifacts = value.artifacts.every((artifact) =>
    isRecord(artifact) &&
    typeof artifact.path === 'string' &&
    ['text/html', 'text/css', 'text/javascript'].includes(String(artifact.contentType)) &&
    typeof artifact.sourceDocumentId === 'string' &&
    Array.isArray(artifact.dependencies) &&
    artifact.dependencies.every((dependency) => typeof dependency === 'string'),
  );
  if (
    value.contentSchemaVersion !== 1 ||
    !Number.isInteger(value.summary.projects) ||
    !Number.isInteger(value.summary.pages) ||
    Number(value.summary.projects) < 0 ||
    Number(value.summary.pages) < 0 ||
    !validIds(value.summary.projectIds) ||
    !validIds(value.summary.pageIds) ||
    !validArtifacts
  ) {
    throw new Error('Invalid content validation response.');
  }
  return value as ContentValidationResult;
}

export function parsePublishedContentSnapshot(value: unknown): PublishedContentSnapshot {
  if (
    !isRecord(value) ||
    value.source !== 'bundled-repository' ||
    typeof value.revision !== 'string' ||
    value.revision.trim() === ''
  ) {
    throw new Error('Invalid published content response.');
  }
  return {
    source: 'bundled-repository',
    revision: value.revision,
    collection: validateContentCollection(value.collection),
  };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
