import type { ContentCollection, PageDocument, ProjectDocument } from '../shared/content/types.js';
import { validateContentCollection } from '../shared/content/validation.js';
import { uniqueSorted } from './assets.js';
import { renderAbout, renderContact, renderHome, renderProject } from './pages.js';
import { GALLERY_SCRIPT, RENDERER_STYLES } from './styles.js';
import type { GeneratedArtifact, RenderContext, ValidatedSite } from './types.js';

const RUNTIME_DEPENDENCIES = [
  'mockup/dynamic-color.js',
  'mockup/shared.css',
  'mockup/sohum-glass.css',
  'mockup/sohum-glass.js',
];

export function renderSite(input: {
  projects: unknown[];
  pages: unknown[];
  siteConfig: unknown;
}): GeneratedArtifact[] {
  const collection = validateContentCollection(input);
  const site = indexSite(collection);
  const artifacts: GeneratedArtifact[] = [
    {
      path: 'generated-preview/renderer.css',
      contentType: 'text/css',
      content: `${RENDERER_STYLES.trim()}\n`,
      sourceDocumentId: 'renderer',
      dependencies: ['mockup/shared.css', 'mockup/sohum-glass.css'],
    },
    {
      path: 'generated-preview/gallery-switcher.js',
      contentType: 'text/javascript',
      content: `${GALLERY_SCRIPT.trim()}\n`,
      sourceDocumentId: 'renderer',
      dependencies: [],
    },
  ];

  for (const pageType of ['home', 'about', 'contact'] as const) {
    const page = site.pagesByType.get(pageType);
    if (!page) throw new Error(`Validated collection is missing ${pageType}`);
    artifacts.push(renderPageArtifact(page, site));
  }

  for (const projectType of ['photography', 'design'] as const) {
    for (const slug of site.siteConfig.projectOrder[projectType]) {
      const project = site.projectsBySlug.get(slug);
      if (!project) throw new Error(`Validated collection is missing ${slug}`);
      artifacts.push(renderProjectArtifact(project, site));
    }
  }

  assertUniqueArtifactPaths(artifacts);
  return artifacts;
}

function renderPageArtifact(page: PageDocument, site: ValidatedSite): GeneratedArtifact {
  const artifactPath = `generated-preview/${page.slug}.html`;
  const context = renderContext(site, artifactPath);
  const content = page.pageType === 'home'
    ? renderHome(page, context)
    : page.pageType === 'about'
      ? renderAbout(page, context)
      : renderContact(page, context);
  const dependencySources = page.pageType === 'home'
    ? [page, ...page.selectedProjectSlugs.map((slug) => site.projectsBySlug.get(slug))]
    : page;
  return htmlArtifact(artifactPath, content, page.id, dependencySources, false);
}

function renderProjectArtifact(project: ProjectDocument, site: ValidatedSite): GeneratedArtifact {
  const artifactPath = `generated-preview/${project.slug}.html`;
  const context = renderContext(site, artifactPath);
  return htmlArtifact(
    artifactPath,
    renderProject(project, context),
    project.id,
    project,
    project.projectType === 'photography',
  );
}

function htmlArtifact(
  path: string,
  content: string,
  sourceDocumentId: string,
  source: unknown,
  gallery: boolean,
): GeneratedArtifact {
  return {
    path,
    contentType: 'text/html',
    content,
    sourceDocumentId,
    dependencies: uniqueSorted([
      ...RUNTIME_DEPENDENCIES,
      'generated-preview/renderer.css',
      ...(gallery ? ['generated-preview/gallery-switcher.js'] : []),
      ...collectImagePaths(source),
    ]),
  };
}

function renderContext(site: ValidatedSite, artifactPath: string): RenderContext {
  return {
    artifactPath,
    siteConfig: site.siteConfig,
    projectsBySlug: site.projectsBySlug,
    pagesByType: site.pagesByType,
  };
}

function indexSite(collection: ContentCollection): ValidatedSite {
  return {
    ...collection,
    projectsBySlug: new Map(collection.projects.map((project) => [project.slug, project])),
    pagesByType: new Map(collection.pages.map((page) => [page.pageType, page])),
  };
}

function collectImagePaths(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(collectImagePaths);
  if (typeof value !== 'object' || value === null) return [];
  const record = value as Record<string, unknown>;
  const ownPath = typeof record.path === 'string' && /\.(?:avif|gif|jpe?g|png|webp)$/i.test(record.path)
    ? [record.path]
    : [];
  return ownPath.concat(Object.values(record).flatMap(collectImagePaths));
}

function assertUniqueArtifactPaths(artifacts: GeneratedArtifact[]): void {
  const paths = new Set<string>();
  for (const artifact of artifacts) {
    if (paths.has(artifact.path)) throw new Error(`Duplicate generated artifact path: ${artifact.path}`);
    paths.add(artifact.path);
  }
}
