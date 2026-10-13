import type { ContentCollection, ProjectDocument, ProjectType, RichText } from '../../../shared/content/types';

export type ProjectFilter = 'all' | ProjectType;

export function richTextToPlainText(value: RichText): string {
  return value.map((node) => node.text).join('');
}

export function orderedProjects(collection: ContentCollection): ProjectDocument[] {
  const bySlug = new Map(collection.projects.map((project) => [project.slug, project]));
  const orderedSlugs = [
    ...collection.siteConfig.projectOrder.photography,
    ...collection.siteConfig.projectOrder.design,
  ];
  return orderedSlugs.flatMap((slug) => {
    const project = bySlug.get(slug);
    return project ? [project] : [];
  });
}

export function filterProjects(
  projects: ProjectDocument[],
  query: string,
  filter: ProjectFilter,
): ProjectDocument[] {
  const needle = normalizeSearch(query);
  return projects.filter((project) => {
    if (filter !== 'all' && project.projectType !== filter) return false;
    if (!needle) return true;
    return [project.title, project.eyebrow, richTextToPlainText(project.summary), project.slug]
      .some((value) => normalizeSearch(value).includes(needle));
  });
}

function normalizeSearch(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function projectItemCount(project: ProjectDocument): number {
  return project.projectType === 'design' ? project.body.length : project.gallery.collectionSize;
}

export function projectItemLabel(project: ProjectDocument): string {
  return project.projectType === 'design' ? 'content blocks' : 'gallery frames';
}

export function collectionAssetCount(collection: ContentCollection): number {
  const assetIds = new Set<string>();
  visit(collection, (record) => {
    if (typeof record.assetId === 'string') assetIds.add(record.assetId);
  });
  return assetIds.size;
}

function visit(value: unknown, callback: (record: Record<string, unknown>) => void): void {
  if (Array.isArray(value)) {
    value.forEach((item) => visit(item, callback));
    return;
  }
  if (typeof value !== 'object' || value === null) return;
  const record = value as Record<string, unknown>;
  callback(record);
  Object.values(record).forEach((item) => visit(item, callback));
}
