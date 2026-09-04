const numberedImages = (directory, prefix, count, extensions = {}) => Array.from({ length: count }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');
  return `${directory}/${prefix}-${number}.${extensions[index + 1] || 'jpg'}`;
});

export const photographyProjects = {
  avedalife: {
    title: 'Aveda Lifestyle',
    eyebrow: 'Photo — lifestyle',
    description: 'Aveda Institute Tallahassee Masters Photoshoot, 2018.',
    images: numberedImages('images/avedalife', 'avedalife', 42),
  },
  avedastudio: {
    title: 'Aveda Studio',
    eyebrow: 'Photo — studio beauty',
    description: 'A season of studio beauty work — hair, light, and forty-four frames.',
    images: numberedImages('images/avedastudio', 'avedastudio', 44),
    captions: { 4: 'Ashelli — updo detail', 11: 'Brittany — studio light', 22: 'Gabby — color work', 30: 'Nina — braid detail' },
  },
  islesashore: {
    title: 'Isles Ashore',
    eyebrow: 'Photo — landscape',
    description: 'St. George Island, Florida.',
    images: numberedImages('images/islesashore', 'islesashore', 10),
  },
  magnoliafields: {
    title: 'Magnolia Fields',
    eyebrow: 'Photo — landscape',
    description: 'Maclay Gardens and Lake Jackson, Florida.',
    images: numberedImages('images/magnoliafields', 'magnoliafields', 10),
  },
  leavesleos: {
    title: 'Leaves & Leos',
    eyebrow: 'Photo — portrait',
    description: 'Photoshoot with Steven Frasier.',
    images: numberedImages('images/leavesleos', 'leavesleos', 11),
  },
};

export const designArchiveProjects = {
  'delta-ascencion': {
    title: 'Ascencion',
    eyebrow: 'Design — brand extension',
    description: 'College brand expansion project imagining low-earth-orbit passenger space flight through a Delta × SpaceX partnership named Ascencion.',
    metadata: [['Context', 'College project'], ['Concept', 'Delta × SpaceX'], ['Collection', '19 artifacts']],
    images: numberedImages('graphics/delta-ascencion', 'delta-ascencion', 19),
  },
  glorybe: {
    title: 'Glory Be',
    eyebrow: 'Design — publication & typography',
    description: 'A magazine-style lyric book and album booklet for a ninth studio album — an exploration in publication design and typography.',
    metadata: [['Context', 'College project'], ['Medium', 'Lyric book / album booklet'], ['Collection', '16 artifacts']],
    images: numberedImages('graphics/glorybe', 'glorybe', 16),
  },
  promotional: {
    title: 'Promotional Material',
    eyebrow: 'Design — promotional',
    description: 'Assorted promotional materials for sports and entertainment events, across physical and digital media.',
    metadata: [['Collection', 'Promotional design'], ['Media', 'Physical & digital'], ['Artifacts', '6']],
    images: numberedImages('graphics/promotional', 'promotional', 6, { 5: 'png', 6: 'png' }),
  },
  misc: {
    title: 'Misc',
    eyebrow: 'Design — freelance archive',
    description: 'Uncategorized freelance graphic design with a focus on pop culture and celebrities.',
    metadata: [['Collection', 'Freelance archive'], ['Focus', 'Pop culture & celebrities'], ['Artifacts', '7']],
    images: numberedImages('graphics/misc', 'misc', 7),
  },
};

export const photoSlugs = Object.keys(photographyProjects);
export const designSlugs = ['hydroviv', 'cksteele', ...Object.keys(designArchiveProjects)];

export const projectCatalog = {
  ...Object.fromEntries(Object.entries(photographyProjects).map(([slug, project]) => [slug, {
    ...project,
    slug,
    track: 'Photo',
    cover: project.images[0],
  }])),
  hydroviv: {
    slug: 'hydroviv',
    track: 'Design',
    title: 'Hydroviv',
    eyebrow: 'Design — print & marketing',
    description: 'Advertisement, print and marketing material for a custom water-filtration company.',
    cover: 'graphics/hydroviv/hydroviv-01.png',
  },
  cksteele: {
    slug: 'cksteele',
    track: 'Design',
    title: 'CK Steele Plaza',
    eyebrow: 'Design — public mural',
    description: 'A mural tracing the history and future of public transportation in Tallahassee.',
    cover: 'graphics/cksteele/cksteele-07.jpg',
  },
  ...Object.fromEntries(Object.entries(designArchiveProjects).map(([slug, project]) => [slug, {
    ...project,
    slug,
    track: 'Design',
    cover: project.images[0],
  }])),
};

export const designCatalogSlugs = ['hydroviv', 'delta-ascencion', 'glorybe', 'cksteele', 'promotional', 'misc'];
export const featuredSlugs = ['avedastudio', 'hydroviv', 'cksteele', 'islesashore', 'delta-ascencion', 'glorybe'];

export const portfolioNavigation = [
  {
    slug: 'photo',
    label: 'Photo',
    allLabel: 'All photography',
    projectSlugs: photoSlugs,
  },
  {
    slug: 'design',
    label: 'Design',
    allLabel: 'All design',
    projectSlugs: designCatalogSlugs,
  },
];
