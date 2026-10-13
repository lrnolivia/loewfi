import type { ContentCollection, ContentDocument } from '../../../../src/shared/content/types';
import type { GeneratedArtifact } from '../../../../src/renderer/types';

export type ContentKey = {
  kind: ContentDocument['kind'];
  id: string;
};

export type VersionedDraft = {
  key: ContentKey;
  document: ContentDocument;
  revision: string;
  updatedAt: string;
  updatedBy: string;
};

export interface PublishedContentSource {
  read(): Promise<{ collection: ContentCollection; revision: string }>;
}

export interface DraftRepository {
  read(key: ContentKey): Promise<VersionedDraft | null>;
  save(input: {
    key: ContentKey;
    document: ContentDocument;
    expectedRevision: string | null;
    actorEmail: string;
  }): Promise<VersionedDraft>;
  remove(input: { key: ContentKey; expectedRevision: string; actorEmail: string }): Promise<void>;
}

export interface ArtifactRenderer {
  render(collection: ContentCollection): GeneratedArtifact[];
}

export interface Publisher {
  publish(input: {
    collection: ContentCollection;
    artifacts: GeneratedArtifact[];
    expectedPublishedRevision: string;
    actorEmail: string;
  }): Promise<{ revision: string; commitUrl: string; deploymentUrl?: string }>;
}

export type CmsServices = {
  publishedContent: PublishedContentSource;
  drafts: DraftRepository;
  renderer: ArtifactRenderer;
  publisher: Publisher;
};
