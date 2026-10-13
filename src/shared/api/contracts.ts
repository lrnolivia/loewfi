import type { ProjectDocument, ProjectType } from '../content/types';
import type { ValidationIssue } from '../content/validation';
import { parseProjectDocument, validateContentCollection } from '../content/validation';

export const CMS_API_VERSION = 1 as const;
export const CMS_MAX_JSON_BYTES = 1_000_000;
export const CMS_MAX_MEDIA_BYTES = 10_000_000;

export type ApiErrorCode =
  | 'unauthorized'
  | 'method_not_allowed'
  | 'unsupported_media_type'
  | 'invalid_json'
  | 'invalid_media'
  | 'payload_too_large'
  | 'validation_failed'
  | 'not_found'
  | 'conflict'
  | 'storage_unavailable'
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
  maxMediaBytes: number;
  features: {
    contentValidation: true;
    artifactPlanning: true;
    publishedContentRead: true;
    media: boolean;
    drafts: boolean;
    preview: false;
    publishing: false;
  };
};

export type ProjectDraftRecord = {
  draftId: string;
  document: ProjectDocument;
  revision: string;
  basePublishedRevision: string;
  mediaIds: string[];
  updatedAt: string;
  updatedBy: string;
};

export type ProjectDraftSnapshot = { draft: ProjectDraftRecord | null };

export type ProjectDraftSaveInput = {
  document: ProjectDocument;
  expectedRevision: string | null;
  basePublishedRevision: string;
  mediaIds: string[];
};

export type ProjectDraftDeleteResult = { deleted: true; draftId: string };

export type MediaVariant = 'web' | 'full';

export type StagedMediaAsset = {
  stagingId: string;
  assetId: string;
  projectSlug: string;
  projectType: ProjectType;
  variant: MediaVariant;
  targetPath: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  byteLength: number;
  width: number;
  height: number;
  uploadedAt: string;
  uploadedBy: string;
  expiresAt: string;
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
    typeof value.maxMediaBytes !== 'number' ||
    value.features.contentValidation !== true ||
    value.features.artifactPlanning !== true ||
    value.features.publishedContentRead !== true ||
    typeof value.features.media !== 'boolean' ||
    typeof value.features.drafts !== 'boolean' ||
    value.features.preview !== false ||
    value.features.publishing !== false
  ) {
    throw new Error('Invalid CMS capabilities response.');
  }
  return value as CmsCapabilities;
}

export function parseProjectDraftSnapshot(value: unknown): ProjectDraftSnapshot {
  if (!isRecord(value) || (value.draft !== null && !isRecord(value.draft))) {
    throw new Error('Invalid project draft response.');
  }
  return { draft: value.draft === null ? null : parseProjectDraftRecord(value.draft) };
}

export function parseProjectDraftRecord(value: unknown): ProjectDraftRecord {
  if (!isRecord(value)) throw new Error('Invalid project draft response.');
  const mediaIds = value.mediaIds;
  if (
    typeof value.draftId !== 'string' ||
    typeof value.revision !== 'string' ||
    typeof value.basePublishedRevision !== 'string' ||
    typeof value.updatedAt !== 'string' ||
    typeof value.updatedBy !== 'string' ||
    !Array.isArray(mediaIds) ||
    !mediaIds.every((id) => typeof id === 'string')
  ) {
    throw new Error('Invalid project draft response.');
  }
  return {
    draftId: value.draftId,
    revision: value.revision,
    basePublishedRevision: value.basePublishedRevision,
    mediaIds,
    updatedAt: value.updatedAt,
    updatedBy: value.updatedBy,
    document: parseProjectDocument(value.document),
  };
}

export function parseProjectDraftDeleteResult(value: unknown): ProjectDraftDeleteResult {
  if (!isRecord(value) || value.deleted !== true || typeof value.draftId !== 'string') {
    throw new Error('Invalid project draft delete response.');
  }
  return { deleted: true, draftId: value.draftId };
}

export function parseStagedMediaAsset(value: unknown): StagedMediaAsset {
  if (
    !isRecord(value) ||
    typeof value.stagingId !== 'string' ||
    typeof value.assetId !== 'string' ||
    typeof value.projectSlug !== 'string' ||
    !['design', 'photography'].includes(String(value.projectType)) ||
    !['web', 'full'].includes(String(value.variant)) ||
    typeof value.targetPath !== 'string' ||
    !['image/jpeg', 'image/png', 'image/webp'].includes(String(value.contentType)) ||
    !Number.isSafeInteger(value.byteLength) || Number(value.byteLength) < 1 ||
    !Number.isSafeInteger(value.width) || Number(value.width) < 1 ||
    !Number.isSafeInteger(value.height) || Number(value.height) < 1 ||
    typeof value.uploadedAt !== 'string' ||
    typeof value.uploadedBy !== 'string' ||
    typeof value.expiresAt !== 'string'
  ) {
    throw new Error('Invalid staged media response.');
  }
  return value as StagedMediaAsset;
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
