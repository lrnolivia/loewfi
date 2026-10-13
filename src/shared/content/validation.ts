import {
  CONTENT_SCHEMA_VERSION,
  type AboutPage,
  type AssetVariant,
  type ComparisonBlock,
  type ContactPage,
  type ContentBlock,
  type ContentCollection,
  type ContentDocument,
  type DesignProject,
  type Figure,
  type Hero,
  type HomePage,
  type ImageAsset,
  type MetadataItem,
  type PageDocument,
  type PhotographyProject,
  type ProjectDocument,
  type ProjectType,
  type RichText,
  type SiteConfigDocument,
  type TextMark,
} from './types.js';

export type ValidationIssue = { path: string; message: string };

export class ContentValidationError extends Error {
  constructor(readonly issues: ValidationIssue[]) {
    super(issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n'));
    this.name = 'ContentValidationError';
  }
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IMAGE_PATH = /\.(?:avif|gif|jpe?g|png|webp)$/i;
const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

export function parseContentDocument(value: unknown): ContentDocument {
  const record = asRecord(value, '$');
  assertSchemaVersion(record.schemaVersion, '$.schemaVersion');
  const kind = asString(record.kind, '$.kind');

  if (kind === 'project') return parseProjectDocument(record);
  if (kind === 'page') return parsePageDocument(record);
  if (kind === 'site-config') return parseSiteConfigDocument(record);
  fail('$.kind', 'must be project, page, or site-config');
}

export function parseProjectDocument(value: unknown): ProjectDocument {
  const record = asRecord(value, '$');
  assertSchemaVersion(record.schemaVersion, '$.schemaVersion');
  literal(record.kind, 'project', '$.kind');
  const projectType = projectTypeValue(record.projectType, '$.projectType');

  const base = {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    kind: 'project' as const,
    id: idValue(record.id, '$.id'),
    slug: slugValue(record.slug, '$.slug'),
    title: nonEmptyString(record.title, '$.title'),
    projectType,
    eyebrow: nonEmptyString(record.eyebrow, '$.eyebrow'),
    summary: richText(record.summary, '$.summary'),
    hero: hero(record.hero, '$.hero'),
  };

  if (base.id !== base.slug) fail('$.id', 'project id must match its slug');

  if (projectType === 'design') {
    exactKeys(record, [...Object.keys(base), 'metadata', 'body'], '$');
    const body = blocks(record.body, '$.body');
    requireUnique(body.map((block) => block.id), '$.body', 'block id');
    return {
      ...base,
      projectType: 'design',
      metadata: metadata(record.metadata, '$.metadata'),
      body,
    } satisfies DesignProject;
  }

  exactKeys(record, [...Object.keys(base), 'gallery'], '$');
  const galleryRecord = asRecord(record.gallery, '$.gallery');
  exactKeys(galleryRecord, ['collectionSize', 'figures'], '$.gallery');
  const figures = figureArray(galleryRecord.figures, '$.gallery.figures', 1);
  const collectionSize = positiveInteger(galleryRecord.collectionSize, '$.gallery.collectionSize');
  if (collectionSize < figures.length) {
    fail('$.gallery.collectionSize', 'cannot be smaller than the number of included figures');
  }
  return {
    ...base,
    projectType: 'photography',
    gallery: { collectionSize, figures },
  } satisfies PhotographyProject;
}

export function parsePageDocument(value: unknown): PageDocument {
  const record = asRecord(value, '$');
  assertSchemaVersion(record.schemaVersion, '$.schemaVersion');
  literal(record.kind, 'page', '$.kind');
  const pageType = asString(record.pageType, '$.pageType');

  if (pageType === 'home') return homePage(record);
  if (pageType === 'about') return aboutPage(record);
  if (pageType === 'contact') return contactPage(record);
  fail('$.pageType', 'must be home, about, or contact');
}

export function parseSiteConfigDocument(value: unknown): SiteConfigDocument {
  const record = asRecord(value, '$');
  exactKeys(record, ['schemaVersion', 'kind', 'id', 'site', 'tracks', 'projectOrder', 'contact'], '$');
  assertSchemaVersion(record.schemaVersion, '$.schemaVersion');
  literal(record.kind, 'site-config', '$.kind');
  literal(record.id, 'site', '$.id');

  const site = asRecord(record.site, '$.site');
  exactKeys(site, ['title', 'baseUrl', 'locale', 'ownerName', 'footerCopyright'], '$.site');
  const baseUrl = urlValue(site.baseUrl, '$.site.baseUrl', new Set(['https:']));

  const tracks = asArray(record.tracks, '$.tracks').map((item, index) => {
    const track = asRecord(item, `$.tracks[${index}]`);
    exactKeys(track, ['projectType', 'label'], `$.tracks[${index}]`);
    return {
      projectType: projectTypeValue(track.projectType, `$.tracks[${index}].projectType`),
      label: nonEmptyString(track.label, `$.tracks[${index}].label`),
    };
  });
  requireUnique(tracks.map((track) => track.projectType), '$.tracks', 'project type');
  if (tracks.length !== 2) fail('$.tracks', 'must configure design and photography exactly once');

  const projectOrder = asRecord(record.projectOrder, '$.projectOrder');
  exactKeys(projectOrder, ['design', 'photography'], '$.projectOrder');
  const order = {
    design: slugArray(projectOrder.design, '$.projectOrder.design'),
    photography: slugArray(projectOrder.photography, '$.projectOrder.photography'),
  };
  requireUnique([...order.design, ...order.photography], '$.projectOrder', 'project slug');

  const contact = asRecord(record.contact, '$.contact');
  exactKeys(contact, ['email', 'phone', 'instagramUrl'], '$.contact');

  return {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    kind: 'site-config',
    id: 'site',
    site: {
      title: nonEmptyString(site.title, '$.site.title'),
      baseUrl,
      locale: nonEmptyString(site.locale, '$.site.locale'),
      ownerName: nonEmptyString(site.ownerName, '$.site.ownerName'),
      footerCopyright: nonEmptyString(site.footerCopyright, '$.site.footerCopyright'),
    },
    tracks,
    projectOrder: order,
    contact: {
      email: emailValue(contact.email, '$.contact.email'),
      phone: nonEmptyString(contact.phone, '$.contact.phone'),
      instagramUrl: urlValue(contact.instagramUrl, '$.contact.instagramUrl', new Set(['https:'])),
    },
  };
}

export function validateContentCollection(collection: unknown): ContentCollection {
  const record = asRecord(collection, '$');
  exactKeys(record, ['projects', 'pages', 'siteConfig'], '$');
  const projects = asArray(record.projects, '$.projects').map(parseProjectDocument);
  const pages = asArray(record.pages, '$.pages').map(parsePageDocument);
  const siteConfig = parseSiteConfigDocument(record.siteConfig);

  requireUnique(projects.map((project) => project.slug), '$.projects', 'project slug');
  requireUnique(pages.map((page) => page.slug), '$.pages', 'page slug');

  for (const required of ['home', 'about', 'contact']) {
    if (!pages.some((page) => page.pageType === required && page.slug === required)) {
      fail('$.pages', `must contain the ${required} singleton page`);
    }
  }

  const projectBySlug = new Map(projects.map((project) => [project.slug, project]));
  const ordered = [...siteConfig.projectOrder.design, ...siteConfig.projectOrder.photography];
  for (const slug of ordered) {
    if (!projectBySlug.has(slug)) fail('$.siteConfig.projectOrder', `references unknown project ${slug}`);
  }
  for (const project of projects) {
    const expectedOrder = siteConfig.projectOrder[project.projectType];
    if (!expectedOrder.includes(project.slug)) {
      fail('$.siteConfig.projectOrder', `does not include ${project.slug} in ${project.projectType}`);
    }
    const wrongType: ProjectType = project.projectType === 'design' ? 'photography' : 'design';
    if (siteConfig.projectOrder[wrongType].includes(project.slug)) {
      fail('$.siteConfig.projectOrder', `${project.slug} is ordered under the wrong project type`);
    }
  }

  const home = pages.find((page): page is HomePage => page.pageType === 'home');
  if (home) {
    for (const slug of home.selectedProjectSlugs) {
      if (!projectBySlug.has(slug)) fail('$.pages.home.selectedProjectSlugs', `references unknown project ${slug}`);
    }
  }

  return { projects, pages, siteConfig };
}

function homePage(record: Record<string, unknown>): HomePage {
  exactKeys(
    record,
    ['schemaVersion', 'kind', 'pageType', 'id', 'slug', 'title', 'hero', 'selectedProjectSlugs', 'trackIntroductions'],
    '$',
  );
  const base = pageBase(record, 'home');
  const heroRecord = asRecord(record.hero, '$.hero');
  exactKeys(
    heroRecord,
    ['image', 'focalPoint', 'tone', 'attachment', 'eyebrow', 'headline', 'introduction', 'actions'],
    '$.hero',
  );
  const heroBase = hero(heroRecord, '$.hero', true);
  const actions = asArray(heroRecord.actions, '$.hero.actions').map((item, index) => {
    const action = asRecord(item, `$.hero.actions[${index}]`);
    exactKeys(action, ['id', 'label', 'href'], `$.hero.actions[${index}]`);
    return {
      id: idValue(action.id, `$.hero.actions[${index}].id`),
      label: nonEmptyString(action.label, `$.hero.actions[${index}].label`),
      href: linkValue(action.href, `$.hero.actions[${index}].href`),
    };
  });
  if (actions.length === 0) fail('$.hero.actions', 'must contain at least one action');
  requireUnique(actions.map((action) => action.id), '$.hero.actions', 'action id');
  const trackIntroductions = asArray(record.trackIntroductions, '$.trackIntroductions').map((item, index) => {
    const track = asRecord(item, `$.trackIntroductions[${index}]`);
    exactKeys(track, ['projectType', 'title', 'description', 'actionLabel'], `$.trackIntroductions[${index}]`);
    return {
      projectType: projectTypeValue(track.projectType, `$.trackIntroductions[${index}].projectType`),
      title: nonEmptyString(track.title, `$.trackIntroductions[${index}].title`),
      description: richText(track.description, `$.trackIntroductions[${index}].description`),
      actionLabel: nonEmptyString(track.actionLabel, `$.trackIntroductions[${index}].actionLabel`),
    };
  });
  if (trackIntroductions.length !== 2) {
    fail('$.trackIntroductions', 'must describe design and photography exactly once');
  }
  requireUnique(trackIntroductions.map((track) => track.projectType), '$.trackIntroductions', 'project type');
  const selectedProjectSlugs = slugArray(record.selectedProjectSlugs, '$.selectedProjectSlugs');
  if (selectedProjectSlugs.length === 0) {
    fail('$.selectedProjectSlugs', 'must contain at least one selected project');
  }
  return {
    ...base,
    pageType: 'home',
    hero: {
      ...heroBase,
      eyebrow: nonEmptyString(heroRecord.eyebrow, '$.hero.eyebrow'),
      headline: richText(heroRecord.headline, '$.hero.headline'),
      introduction: richText(heroRecord.introduction, '$.hero.introduction'),
      actions,
    },
    selectedProjectSlugs,
    trackIntroductions,
  };
}

function aboutPage(record: Record<string, unknown>): AboutPage {
  exactKeys(
    record,
    ['schemaVersion', 'kind', 'pageType', 'id', 'slug', 'title', 'personName', 'hero', 'metadata', 'sidebarWidget', 'body'],
    '$',
  );
  const base = pageBase(record, 'about');
  const body = blocks(record.body, '$.body');
  requireUnique(body.map((block) => block.id), '$.body', 'block id');
  let sidebarWidget: AboutPage['sidebarWidget'];
  if (record.sidebarWidget !== undefined) {
    const widget = asRecord(record.sidebarWidget, '$.sidebarWidget');
    exactKeys(widget, ['title', 'items'], '$.sidebarWidget');
    const items = asArray(widget.items, '$.sidebarWidget.items').map((item, index) =>
      nonEmptyString(item, `$.sidebarWidget.items[${index}]`),
    );
    if (items.length === 0) fail('$.sidebarWidget.items', 'must contain at least one item');
    sidebarWidget = { title: nonEmptyString(widget.title, '$.sidebarWidget.title'), items };
  }
  return {
    ...base,
    pageType: 'about',
    personName: nonEmptyString(record.personName, '$.personName'),
    hero: hero(record.hero, '$.hero'),
    metadata: metadata(record.metadata, '$.metadata'),
    ...(sidebarWidget ? { sidebarWidget } : {}),
    body,
  };
}

function contactPage(record: Record<string, unknown>): ContactPage {
  exactKeys(
    record,
    ['schemaVersion', 'kind', 'pageType', 'id', 'slug', 'title', 'hero', 'eyebrow', 'headline', 'introduction', 'form', 'directLinks'],
    '$',
  );
  const base = pageBase(record, 'contact');
  const form = asRecord(record.form, '$.form');
  exactKeys(form, ['delivery', 'messageLabel', 'submitLabel'], '$.form');
  const delivery = asRecord(form.delivery, '$.form.delivery');
  exactKeys(delivery, ['type', 'recipientEmail', 'subject'], '$.form.delivery');
  literal(delivery.type, 'mailto', '$.form.delivery.type');
  const directLinks = asArray(record.directLinks, '$.directLinks').map((item, index) => {
    const link = asRecord(item, `$.directLinks[${index}]`);
    exactKeys(link, ['id', 'label', 'href'], `$.directLinks[${index}]`);
    return {
      id: idValue(link.id, `$.directLinks[${index}].id`),
      label: nonEmptyString(link.label, `$.directLinks[${index}].label`),
      href: linkValue(link.href, `$.directLinks[${index}].href`),
    };
  });
  if (directLinks.length === 0) fail('$.directLinks', 'must contain at least one direct contact link');
  requireUnique(directLinks.map((link) => link.id), '$.directLinks', 'link id');
  return {
    ...base,
    pageType: 'contact',
    hero: hero(record.hero, '$.hero'),
    eyebrow: nonEmptyString(record.eyebrow, '$.eyebrow'),
    headline: richText(record.headline, '$.headline'),
    introduction: richText(record.introduction, '$.introduction'),
    form: {
      delivery: {
        type: 'mailto',
        recipientEmail: emailValue(delivery.recipientEmail, '$.form.delivery.recipientEmail'),
        subject: nonEmptyString(delivery.subject, '$.form.delivery.subject'),
      },
      messageLabel: nonEmptyString(form.messageLabel, '$.form.messageLabel'),
      submitLabel: nonEmptyString(form.submitLabel, '$.form.submitLabel'),
    },
    directLinks,
  };
}

function pageBase(record: Record<string, unknown>, expected: 'home' | 'about' | 'contact') {
  assertSchemaVersion(record.schemaVersion, '$.schemaVersion');
  literal(record.kind, 'page', '$.kind');
  literal(record.pageType, expected, '$.pageType');
  const id = idValue(record.id, '$.id');
  const slug = slugValue(record.slug, '$.slug');
  if (id !== expected || slug !== expected) {
    fail('$.id', `${expected} page id and slug must both be ${expected}`);
  }
  return {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    kind: 'page' as const,
    id,
    slug,
    title: nonEmptyString(record.title, '$.title'),
  };
}

function blocks(value: unknown, path: string): ContentBlock[] {
  const result = asArray(value, path).map((item, index) => block(item, `${path}[${index}]`));
  if (result.length === 0) fail(path, 'must contain at least one block');
  return result;
}

function block(value: unknown, path: string): ContentBlock {
  const record = asRecord(value, path);
  const id = idValue(record.id, `${path}.id`);
  const type = asString(record.type, `${path}.type`);
  if (type === 'headline') {
    exactKeys(record, ['id', 'type', 'content'], path);
    return { id, type, content: richText(record.content, `${path}.content`) };
  }
  if (type === 'paragraph') {
    exactKeys(record, ['id', 'type', 'content', 'treatment'], path);
    const treatment = record.treatment === undefined
      ? undefined
      : enumValue(record.treatment, ['standard', 'lede'] as const, `${path}.treatment`);
    return {
      id,
      type,
      content: richText(record.content, `${path}.content`),
      ...(treatment ? { treatment } : {}),
    };
  }
  if (type === 'heading') {
    exactKeys(record, ['id', 'type', 'text'], path);
    return { id, type, text: nonEmptyString(record.text, `${path}.text`) };
  }
  if (type === 'figure') {
    exactKeys(record, ['id', 'type', 'figure', 'layout'], path);
    return {
      id,
      type,
      figure: figure(record.figure, `${path}.figure`),
      layout: enumValue(record.layout, ['full', 'narrow', 'centered'] as const, `${path}.layout`),
    };
  }
  if (type === 'figure-pair') {
    exactKeys(record, ['id', 'type', 'figures'], path);
    const figures = figureArray(record.figures, `${path}.figures`, 2, 2);
    return { id, type, figures: [figures[0], figures[1]] };
  }
  if (type === 'comparison') return comparisonBlock(record, path, id);
  if (type === 'figure-strip') {
    exactKeys(record, ['id', 'type', 'figures'], path);
    return { id, type, figures: figureArray(record.figures, `${path}.figures`, 2) };
  }
  if (type === 'image-break') {
    exactKeys(record, ['id', 'type', 'image'], path);
    return { id, type, image: imageAsset(record.image, `${path}.image`) };
  }
  fail(`${path}.type`, 'is not a supported block type');
}

function comparisonBlock(record: Record<string, unknown>, path: string, id: string): ComparisonBlock {
  exactKeys(record, ['id', 'type', 'before', 'after', 'caption'], path);
  const labeled = (value: unknown, childPath: string) => {
    const item = asRecord(value, childPath);
    const base = figure(item, childPath, true);
    return { ...base, label: nonEmptyString(item.label, `${childPath}.label`) };
  };
  return {
    id,
    type: 'comparison',
    before: labeled(record.before, `${path}.before`),
    after: labeled(record.after, `${path}.after`),
    ...(record.caption === undefined ? {} : { caption: richText(record.caption, `${path}.caption`) }),
  };
}

function metadata(value: unknown, path: string): MetadataItem[] {
  const result = asArray(value, path).map((item, index) => {
    const itemPath = `${path}[${index}]`;
    const record = asRecord(item, itemPath);
    exactKeys(record, ['id', 'label', 'value'], itemPath);
    return {
      id: idValue(record.id, `${itemPath}.id`),
      label: nonEmptyString(record.label, `${itemPath}.label`),
      value: richText(record.value, `${itemPath}.value`),
    };
  });
  requireUnique(result.map((item) => item.id), path, 'metadata id');
  return result;
}

function hero(value: unknown, path: string, extended = false): Hero {
  const record = asRecord(value, path);
  exactKeys(
    record,
    extended
      ? ['image', 'focalPoint', 'tone', 'attachment', 'eyebrow', 'headline', 'introduction', 'actions']
      : ['image', 'focalPoint', 'tone', 'attachment'],
    path,
  );
  const focalPoint = asRecord(record.focalPoint, `${path}.focalPoint`);
  exactKeys(focalPoint, ['x', 'y'], `${path}.focalPoint`);
  return {
    image: imageAsset(record.image, `${path}.image`),
    focalPoint: {
      x: rangeNumber(focalPoint.x, `${path}.focalPoint.x`, 0, 1),
      y: rangeNumber(focalPoint.y, `${path}.focalPoint.y`, 0, 1),
    },
    tone: enumValue(record.tone, ['natural', 'muted-photo', 'softened-artwork'] as const, `${path}.tone`),
    attachment: enumValue(record.attachment, ['scroll', 'fixed'] as const, `${path}.attachment`),
  };
}

function figure(value: unknown, path: string, allowLabel = false): Figure {
  const record = asRecord(value, path);
  exactKeys(record, allowLabel ? ['image', 'caption', 'label'] : ['image', 'caption'], path);
  return {
    image: imageAsset(record.image, `${path}.image`),
    ...(record.caption === undefined ? {} : { caption: richText(record.caption, `${path}.caption`) }),
  };
}

function figureArray(value: unknown, path: string, min: number, max = Number.POSITIVE_INFINITY): Figure[] {
  const result = asArray(value, path).map((item, index) => figure(item, `${path}[${index}]`));
  if (result.length < min || result.length > max) {
    fail(path, `must contain ${min === max ? `exactly ${min}` : `at least ${min}`} figures`);
  }
  return result;
}

function imageAsset(value: unknown, path: string): ImageAsset {
  const record = asRecord(value, path);
  exactKeys(record, ['assetId', 'alt', 'web', 'full'], path);
  return {
    assetId: idValue(record.assetId, `${path}.assetId`),
    alt: nonEmptyString(record.alt, `${path}.alt`),
    web: assetVariant(record.web, `${path}.web`),
    ...(record.full === undefined ? {} : { full: assetVariant(record.full, `${path}.full`) }),
  };
}

function assetVariant(value: unknown, path: string): AssetVariant {
  const record = asRecord(value, path);
  exactKeys(record, ['path', 'width', 'height'], path);
  const result: AssetVariant = { path: imagePath(record.path, `${path}.path`) };
  if ((record.width === undefined) !== (record.height === undefined)) {
    fail(path, 'width and height must be provided together');
  }
  if (record.width !== undefined) {
    result.width = positiveInteger(record.width, `${path}.width`);
    result.height = positiveInteger(record.height, `${path}.height`);
  }
  return result;
}

function richText(value: unknown, path: string): RichText {
  const nodes = asArray(value, path).map((item, index) => {
    const nodePath = `${path}[${index}]`;
    const record = asRecord(item, nodePath);
    const type = asString(record.type, `${nodePath}.type`);
    const marks = record.marks === undefined
      ? undefined
      : marksValue(record.marks, `${nodePath}.marks`);
    if (type === 'text') {
      exactKeys(record, ['type', 'text', 'marks'], nodePath);
      return {
        type,
        text: nonEmptyString(record.text, `${nodePath}.text`),
        ...(marks ? { marks } : {}),
      } as const;
    }
    if (type === 'link') {
      exactKeys(record, ['type', 'text', 'href', 'marks'], nodePath);
      return {
        type,
        text: nonEmptyString(record.text, `${nodePath}.text`),
        href: linkValue(record.href, `${nodePath}.href`),
        ...(marks ? { marks } : {}),
      } as const;
    }
    fail(`${nodePath}.type`, 'must be text or link');
  });
  if (nodes.length === 0) fail(path, 'must contain at least one inline node');
  return nodes;
}

function marksValue(value: unknown, path: string): TextMark[] {
  const marks = asArray(value, path).map((mark, index) =>
    enumValue(mark, ['emphasis', 'strong'] as const, `${path}[${index}]`),
  );
  requireUnique(marks, path, 'mark');
  if (marks.length === 0) fail(path, 'cannot be empty when provided');
  return marks;
}

function imagePath(value: unknown, path: string): string {
  const result = nonEmptyString(value, path);
  if (result.startsWith('/') || result.includes('..') || result.includes('\\') || !IMAGE_PATH.test(result)) {
    fail(path, 'must be a safe repository-relative image path');
  }
  return result;
}

function linkValue(value: unknown, path: string): string {
  const result = nonEmptyString(value, path);
  if (result.startsWith('/')) {
    if (result.includes('..') || result.startsWith('//')) fail(path, 'must be a safe internal path');
    return result;
  }
  let parsed: URL;
  try { parsed = new URL(result); }
  catch { fail(path, 'must be an absolute safe URL or root-relative internal path'); }
  if (!SAFE_LINK_PROTOCOLS.has(parsed.protocol)) fail(path, 'uses an unsupported URL protocol');
  return result;
}

function urlValue(value: unknown, path: string, protocols: Set<string>): string {
  const result = nonEmptyString(value, path);
  let parsed: URL;
  try { parsed = new URL(result); }
  catch { fail(path, 'must be a valid absolute URL'); }
  if (!protocols.has(parsed.protocol)) fail(path, 'uses an unsupported URL protocol');
  return result;
}

function slugArray(value: unknown, path: string): string[] {
  const result = asArray(value, path).map((item, index) => slugValue(item, `${path}[${index}]`));
  requireUnique(result, path, 'slug');
  return result;
}

function slugValue(value: unknown, path: string): string {
  const result = nonEmptyString(value, path);
  if (!SLUG.test(result)) fail(path, 'must be a lowercase kebab-case slug');
  return result;
}

function idValue(value: unknown, path: string): string {
  const result = nonEmptyString(value, path);
  if (!ID.test(result)) fail(path, 'must be a lowercase kebab-case stable id');
  return result;
}

function emailValue(value: unknown, path: string): string {
  const result = nonEmptyString(value, path);
  if (!EMAIL.test(result)) fail(path, 'must be a valid email address');
  return result;
}

function projectTypeValue(value: unknown, path: string): ProjectType {
  return enumValue(value, ['design', 'photography'] as const, path);
}

function assertSchemaVersion(value: unknown, path: string): void {
  if (value !== CONTENT_SCHEMA_VERSION) fail(path, `must equal ${CONTENT_SCHEMA_VERSION}`);
}

function positiveInteger(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) {
    fail(path, 'must be a positive integer');
  }
  return value;
}

function rangeNumber(value: unknown, path: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    fail(path, `must be between ${min} and ${max}`);
  }
  return value;
}

function nonEmptyString(value: unknown, path: string): string {
  const result = asString(value, path);
  if (result.trim() === '') fail(path, 'cannot be empty');
  return result;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== 'string') fail(path, 'must be a string');
  return value;
}

function asArray(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) fail(path, 'must be an array');
  return value;
}

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(path, 'must be an object');
  }
  return value as Record<string, unknown>;
}

function literal<T extends string>(value: unknown, expected: T, path: string): T {
  if (value !== expected) fail(path, `must equal ${expected}`);
  return expected;
}

function enumValue<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  path: string,
): T[number] {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    fail(path, `must be one of ${allowed.join(', ')}`);
  }
  return value as T[number];
}

function exactKeys(record: Record<string, unknown>, allowed: string[], path: string): void {
  const extras = Object.keys(record).filter((key) => !allowed.includes(key));
  if (extras.length) {
    fail(path, `contains unsupported field${extras.length === 1 ? '' : 's'}: ${extras.join(', ')}`);
  }
}

function requireUnique(values: string[], path: string, label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) fail(path, `contains duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

function fail(path: string, message: string): never {
  throw new ContentValidationError([{ path, message }]);
}
