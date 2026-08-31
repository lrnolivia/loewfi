import type {
  ProjectDraftRecord,
  StagedMediaAsset,
} from '../../../../src/shared/api/contracts';
import type { ProjectDocument } from '../../../../src/shared/content/types';
import { CmsApiError } from './http';
import type { CmsApiEnv, CmsKvNamespace } from './types';

const DRAFT_ID = /^[a-z0-9]+(?:[-:][a-z0-9]+)*$/;
const MEDIA_TTL_SECONDS = 60 * 60 * 24 * 30;

export class KvProjectDraftRepository {
  constructor(private readonly kv: CmsKvNamespace) {}

  async read(draftId: string): Promise<ProjectDraftRecord | null> {
    assertDraftId(draftId);
    const raw = await this.kv.get(draftKey(draftId));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ProjectDraftRecord;
    } catch {
      throw new CmsApiError(500, 'internal_error', 'The stored draft could not be read.');
    }
  }

  async save(input: {
    draftId: string;
    document: ProjectDocument;
    expectedRevision: string | null;
    basePublishedRevision: string;
    mediaIds: string[];
    actorEmail: string;
  }): Promise<ProjectDraftRecord> {
    assertDraftId(input.draftId);
    const current = await this.read(input.draftId);
    if ((current?.revision ?? null) !== input.expectedRevision) {
      throw new CmsApiError(409, 'conflict', 'This draft changed elsewhere. Reload it before saving again.');
    }
    const record: ProjectDraftRecord = {
      draftId: input.draftId,
      document: input.document,
      revision: crypto.randomUUID(),
      basePublishedRevision: input.basePublishedRevision,
      mediaIds: [...new Set(input.mediaIds)],
      updatedAt: new Date().toISOString(),
      updatedBy: input.actorEmail,
    };
    await this.kv.put(draftKey(input.draftId), JSON.stringify(record));
    return record;
  }

  async remove(draftId: string, expectedRevision: string): Promise<void> {
    const current = await this.read(draftId);
    if (!current) return;
    if (current.revision !== expectedRevision) {
      throw new CmsApiError(409, 'conflict', 'This draft changed elsewhere. Reload it before discarding.');
    }
    await this.kv.delete(draftKey(draftId));
  }
}

export class KvStagedMediaRepository {
  constructor(private readonly kv: CmsKvNamespace) {}

  async save(bytes: ArrayBuffer, metadata: Omit<StagedMediaAsset, 'stagingId' | 'uploadedAt' | 'expiresAt'>): Promise<StagedMediaAsset> {
    const stagingId = crypto.randomUUID();
    const uploadedAt = new Date();
    const expiresAt = new Date(uploadedAt.getTime() + MEDIA_TTL_SECONDS * 1000);
    const asset: StagedMediaAsset = {
      ...metadata,
      stagingId,
      uploadedAt: uploadedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
    await this.kv.put(mediaKey(stagingId), bytes, { expirationTtl: MEDIA_TTL_SECONDS, metadata: asset });
    return asset;
  }

  async read(stagingId: string): Promise<{ bytes: ArrayBuffer; asset: StagedMediaAsset } | null> {
    assertUuid(stagingId);
    const stored = await this.kv.getWithMetadata<StagedMediaAsset>(mediaKey(stagingId), 'arrayBuffer');
    if (!stored.value || !stored.metadata) return null;
    return { bytes: stored.value, asset: stored.metadata };
  }
}

export function requireDraftRepository(env: CmsApiEnv): KvProjectDraftRepository {
  if (!env.CMS_DRAFTS) {
    throw new CmsApiError(503, 'storage_unavailable', 'Draft storage is not configured for this environment.');
  }
  return new KvProjectDraftRepository(env.CMS_DRAFTS);
}

export function requireMediaRepository(env: CmsApiEnv): KvStagedMediaRepository {
  if (!env.CMS_MEDIA) {
    throw new CmsApiError(503, 'storage_unavailable', 'Media staging is not configured for this environment.');
  }
  return new KvStagedMediaRepository(env.CMS_MEDIA);
}

function draftKey(draftId: string): string {
  return `draft:project:${draftId}`;
}

function mediaKey(stagingId: string): string {
  return `media:staged:${stagingId}`;
}

function assertDraftId(value: string): void {
  if (!DRAFT_ID.test(value)) throw new CmsApiError(400, 'validation_failed', 'Draft id must be lowercase and URL-safe.');
}

function assertUuid(value: string): void {
  if (!/^[0-9a-f-]{36}$/i.test(value)) throw new CmsApiError(400, 'validation_failed', 'Media staging id is invalid.');
}
