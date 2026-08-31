import type { ContentCollection } from '../../shared/content/types';
import type { ProjectType } from '../../shared/content/types';
import type { ValidationIssue } from '../../shared/content/validation';
import {
  isApiFailure,
  parseApiSuccess,
  parseCmsCapabilities,
  parseContentValidationResult,
  parsePublishedContentSnapshot,
  parseProjectDraftDeleteResult,
  parseProjectDraftRecord,
  parseProjectDraftSnapshot,
  parseStagedMediaAsset,
  type ApiErrorCode,
  type CmsCapabilities,
  type ContentValidationResult,
  type PublishedContentSnapshot,
  type MediaVariant,
  type ProjectDraftDeleteResult,
  type ProjectDraftRecord,
  type ProjectDraftSaveInput,
  type StagedMediaAsset,
} from '../../shared/api/contracts';
import { parseWhoAmI, type WhoAmI } from '../../shared/api/whoami';

type RequestOptions = {
  signal?: AbortSignal;
  fetcher?: typeof fetch;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: ApiErrorCode,
    readonly requestId?: string,
    readonly issues?: ValidationIssue[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchWhoAmI(options: RequestOptions = {}): Promise<WhoAmI> {
  return requestJson('/admin/api/whoami', parseWhoAmI, options, {
    headers: { accept: 'application/json' },
  });
}

export async function fetchCapabilities(options: RequestOptions = {}): Promise<CmsCapabilities> {
  return requestJson('/admin/api/capabilities', parseCmsCapabilities, options, {
    headers: { accept: 'application/json' },
  });
}

export async function fetchPublishedContent(
  options: RequestOptions = {},
): Promise<PublishedContentSnapshot> {
  return requestJson('/admin/api/content', parsePublishedContentSnapshot, options, {
    headers: { accept: 'application/json' },
  });
}

export async function validateContent(
  content: ContentCollection,
  options: RequestOptions = {},
): Promise<ContentValidationResult> {
  return requestJson('/admin/api/content/validate', parseContentValidationResult, options, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify(content),
  });
}

export async function fetchProjectDraft(
  draftId: string,
  options: RequestOptions = {},
): Promise<ProjectDraftRecord | null> {
  const result = await requestJson(`/admin/api/drafts/${encodeURIComponent(draftId)}`, parseProjectDraftSnapshot, options, {
    headers: { accept: 'application/json' },
  });
  return result.draft;
}

export async function saveProjectDraft(
  draftId: string,
  input: ProjectDraftSaveInput,
  options: RequestOptions = {},
): Promise<ProjectDraftRecord> {
  return requestJson(`/admin/api/drafts/${encodeURIComponent(draftId)}`, parseProjectDraftRecord, options, {
    method: 'PUT',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function deleteProjectDraft(
  draftId: string,
  expectedRevision: string,
  options: RequestOptions = {},
): Promise<ProjectDraftDeleteResult> {
  return requestJson(`/admin/api/drafts/${encodeURIComponent(draftId)}`, parseProjectDraftDeleteResult, options, {
    method: 'DELETE',
    headers: { accept: 'application/json', 'if-match': expectedRevision },
  });
}

export type StageMediaInput = {
  blob: Blob;
  projectType: ProjectType;
  projectSlug: string;
  assetId: string;
  variant: MediaVariant;
  width: number;
  height: number;
};

export async function stageMedia(input: StageMediaInput, options: RequestOptions = {}): Promise<StagedMediaAsset> {
  const query = new URLSearchParams({
    projectType: input.projectType,
    projectSlug: input.projectSlug,
    assetId: input.assetId,
    variant: input.variant,
    width: String(input.width),
    height: String(input.height),
  });
  return requestJson(`/admin/api/media?${query}`, parseStagedMediaAsset, options, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': input.blob.type },
    body: input.blob,
  });
}

export function stagedMediaUrl(stagingId: string): string {
  return `/admin/api/media?id=${encodeURIComponent(stagingId)}`;
}

async function requestJson<T>(
  path: string,
  parseData: (value: unknown) => T,
  options: RequestOptions,
  init: RequestInit,
): Promise<T> {
  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher(path, { ...init, signal: options.signal });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError('The CMS API returned invalid JSON.', response.status);
  }

  if (!response.ok) {
    if (isApiFailure(body)) {
      throw new ApiError(
        body.error.message,
        response.status,
        body.error.code,
        body.requestId,
        body.error.issues,
      );
    }
    throw new ApiError('The CMS API request failed.', response.status);
  }

  try {
    return parseApiSuccess(body, parseData).data;
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : 'The CMS API response was invalid.',
      response.status,
    );
  }
}
