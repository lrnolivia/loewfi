import type {
  ContentCollection,
  ContentDocument,
  PageDocument,
  ProjectDocument,
  SiteConfigDocument,
} from '../shared/content/types.js';

export type ArtifactContentType = 'text/css' | 'text/html' | 'text/javascript';

export type GeneratedArtifact = {
  path: string;
  contentType: ArtifactContentType;
  content: string;
  sourceDocumentId: ContentDocument['id'] | 'renderer';
  dependencies: string[];
};

export type RenderContext = {
  artifactPath: string;
  siteConfig: SiteConfigDocument;
  projectsBySlug: ReadonlyMap<string, ProjectDocument>;
  pagesByType: ReadonlyMap<PageDocument['pageType'], PageDocument>;
};

export type ValidatedSite = ContentCollection & {
  projectsBySlug: ReadonlyMap<string, ProjectDocument>;
  pagesByType: ReadonlyMap<PageDocument['pageType'], PageDocument>;
};
