export const CONTENT_SCHEMA_VERSION = 1 as const;

export type SchemaVersion = typeof CONTENT_SCHEMA_VERSION;
export type ProjectType = 'design' | 'photography';
export type TextMark = 'emphasis' | 'strong';

export type TextRun = {
  type: 'text';
  text: string;
  marks?: TextMark[];
};

export type LinkRun = {
  type: 'link';
  text: string;
  href: string;
  marks?: TextMark[];
};

export type RichText = Array<TextRun | LinkRun>;

export type AssetVariant = {
  path: string;
  width?: number;
  height?: number;
};

export type ImageAsset = {
  assetId: string;
  alt: string;
  web: AssetVariant;
  full?: AssetVariant;
};

export type Figure = {
  image: ImageAsset;
  caption?: RichText;
};

export type Hero = {
  image: ImageAsset;
  focalPoint: { x: number; y: number };
  tone: 'natural' | 'muted-photo' | 'softened-artwork';
  attachment: 'scroll' | 'fixed';
};

export type MetadataItem = {
  id: string;
  label: string;
  value: RichText;
};

type BlockBase = { id: string };

export type HeadlineBlock = BlockBase & {
  type: 'headline';
  content: RichText;
};

export type ParagraphBlock = BlockBase & {
  type: 'paragraph';
  content: RichText;
  treatment?: 'standard' | 'lede';
};

export type HeadingBlock = BlockBase & {
  type: 'heading';
  text: string;
};

export type FigureBlock = BlockBase & {
  type: 'figure';
  figure: Figure;
  layout: 'full' | 'narrow' | 'centered';
};

export type FigurePairBlock = BlockBase & {
  type: 'figure-pair';
  figures: [Figure, Figure];
};

export type ComparisonBlock = BlockBase & {
  type: 'comparison';
  before: Figure & { label: string };
  after: Figure & { label: string };
  caption?: RichText;
};

export type FigureStripBlock = BlockBase & {
  type: 'figure-strip';
  figures: Figure[];
};

export type ImageBreakBlock = BlockBase & {
  type: 'image-break';
  image: ImageAsset;
};

export type ContentBlock =
  | HeadlineBlock
  | ParagraphBlock
  | HeadingBlock
  | FigureBlock
  | FigurePairBlock
  | ComparisonBlock
  | FigureStripBlock
  | ImageBreakBlock;

type DocumentBase = {
  schemaVersion: SchemaVersion;
  id: string;
  slug: string;
  title: string;
};

type ProjectBase = DocumentBase & {
  kind: 'project';
  projectType: ProjectType;
  eyebrow: string;
  summary: RichText;
  hero: Hero;
};

export type DesignProject = ProjectBase & {
  projectType: 'design';
  metadata: MetadataItem[];
  body: ContentBlock[];
};

export type PhotographyProject = ProjectBase & {
  projectType: 'photography';
  gallery: {
    collectionSize: number;
    figures: Figure[];
  };
};

export type ProjectDocument = DesignProject | PhotographyProject;

export type HomePage = DocumentBase & {
  kind: 'page';
  pageType: 'home';
  hero: Hero & {
    eyebrow: string;
    headline: RichText;
    introduction: RichText;
    actions: Array<{ id: string; label: string; href: string }>;
  };
  selectedProjectSlugs: string[];
  trackIntroductions: Array<{
    projectType: ProjectType;
    title: string;
    description: RichText;
    actionLabel: string;
  }>;
};

export type AboutPage = DocumentBase & {
  kind: 'page';
  pageType: 'about';
  personName: string;
  hero: Hero;
  metadata: MetadataItem[];
  sidebarWidget?: { title: string; items: string[] };
  body: ContentBlock[];
};

export type ContactPage = DocumentBase & {
  kind: 'page';
  pageType: 'contact';
  hero: Hero;
  eyebrow: string;
  headline: RichText;
  introduction: RichText;
  form: {
    delivery: {
      type: 'mailto';
      recipientEmail: string;
      subject: string;
    };
    messageLabel: string;
    submitLabel: string;
  };
  directLinks: Array<{
    id: string;
    label: string;
    href: string;
  }>;
};

export type PageDocument = HomePage | AboutPage | ContactPage;

export type SiteConfigDocument = {
  schemaVersion: SchemaVersion;
  kind: 'site-config';
  id: 'site';
  site: {
    title: string;
    baseUrl: string;
    locale: string;
    ownerName: string;
    footerCopyright: string;
  };
  tracks: Array<{
    projectType: ProjectType;
    label: string;
  }>;
  projectOrder: Record<ProjectType, string[]>;
  contact: {
    email: string;
    phone: string;
    instagramUrl: string;
  };
};

export type ContentDocument = ProjectDocument | PageDocument | SiteConfigDocument;

export type ContentCollection = {
  projects: ProjectDocument[];
  pages: PageDocument[];
  siteConfig: SiteConfigDocument;
};
