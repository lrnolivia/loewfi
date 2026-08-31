import {
  CONTENT_SCHEMA_VERSION,
  type ContentBlock,
  type DesignProject,
  type Figure,
  type Hero,
  type ImageAsset,
  type PhotographyProject,
} from '../../../shared/content/types';

export type ContentBlockType = ContentBlock['type'];

export function createImageAsset(assetId = 'project-image'): ImageAsset {
  return {
    assetId,
    alt: 'Moss-covered tree canopy placeholder',
    web: { path: 'images/moss.jpg' },
  };
}

export function createFigure(assetId = 'project-image'): Figure {
  return { image: createImageAsset(assetId) };
}

export function createHero(): Hero {
  return {
    image: createImageAsset('project-hero'),
    focalPoint: { x: 0.5, y: 0.5 },
    tone: 'natural',
    attachment: 'scroll',
  };
}

export function createContentBlock(type: ContentBlockType, id: string): ContentBlock {
  if (type === 'headline') {
    return { id, type, content: [{ type: 'text', text: 'Add a headline.' }] };
  }
  if (type === 'paragraph') {
    return { id, type, content: [{ type: 'text', text: 'Add project copy.' }], treatment: 'standard' };
  }
  if (type === 'heading') return { id, type, text: 'Add a section heading' };
  if (type === 'figure') return { id, type, figure: createFigure(`${id}-image`), layout: 'full' };
  if (type === 'figure-pair') {
    return { id, type, figures: [createFigure(`${id}-left`), createFigure(`${id}-right`)] };
  }
  if (type === 'comparison') {
    return {
      id,
      type,
      before: { ...createFigure(`${id}-before`), label: 'Before' },
      after: { ...createFigure(`${id}-after`), label: 'After' },
    };
  }
  if (type === 'figure-strip') {
    return { id, type, figures: [createFigure(`${id}-1`), createFigure(`${id}-2`)] };
  }
  return { id, type, image: createImageAsset(`${id}-image`) };
}

export function createDesignProjectTemplate(): DesignProject {
  return {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    kind: 'project',
    projectType: 'design',
    id: 'untitled-design-project',
    slug: 'untitled-design-project',
    title: 'Untitled design project',
    eyebrow: 'Design — project type',
    summary: [{ type: 'text', text: 'Add a concise project summary.' }],
    hero: createHero(),
    metadata: [
      { id: 'client', label: 'Client', value: [{ type: 'text', text: 'Client name' }] },
      { id: 'role', label: 'Role', value: [{ type: 'text', text: 'Design' }] },
    ],
    body: [
      {
        id: 'introduction',
        type: 'paragraph',
        treatment: 'lede',
        content: [{ type: 'text', text: 'Start the project story here.' }],
      },
    ],
  };
}

export function createPhotographyProjectTemplate(): PhotographyProject {
  return {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    kind: 'project',
    projectType: 'photography',
    id: 'untitled-photography-project',
    slug: 'untitled-photography-project',
    title: 'Untitled photography project',
    eyebrow: 'Photo — collection type',
    summary: [{ type: 'text', text: 'Add a concise collection summary.' }],
    hero: createHero(),
    gallery: {
      collectionSize: 1,
      figures: [
        {
          image: {
            assetId: 'gallery-frame',
            alt: 'Moss-covered tree canopy placeholder',
            web: { path: 'images/moss.jpg' },
          },
        },
      ],
    },
  };
}
