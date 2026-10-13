import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSite } from '../src/renderer/site.js';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const fixtureRoot = resolve(repositoryRoot, 'src/shared/content/fixtures');
const outputRoot = resolve(repositoryRoot, 'generated-preview');

assertOwnedOutputDirectory(outputRoot);

const [hydroviv, cksteele, avedastudio, home, about, contact, siteConfig] = await Promise.all([
  readJson('hydroviv.json'),
  readJson('cksteele.json'),
  readJson('avedastudio.json'),
  readJson('home.json'),
  readJson('about.json'),
  readJson('contact.json'),
  readJson('site-config.json'),
]);

const artifacts = renderSite({
  projects: [hydroviv, cksteele, avedastudio],
  pages: [home, about, contact],
  siteConfig,
});

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

for (const artifact of artifacts) {
  const target = resolve(repositoryRoot, artifact.path);
  assertWithinOutput(target);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, artifact.content, 'utf8');
}

await writeFile(
  resolve(outputRoot, 'manifest.json'),
  `${JSON.stringify(artifacts.map(({ content, ...artifact }) => ({ ...artifact, bytes: Buffer.byteLength(content) })), null, 2)}\n`,
  'utf8',
);

console.log(`Rendered ${artifacts.length} deterministic artifacts to generated-preview/.`);

async function readJson(name: string): Promise<unknown> {
  return JSON.parse(await readFile(resolve(fixtureRoot, name), 'utf8')) as unknown;
}

function assertOwnedOutputDirectory(path: string): void {
  if (path !== resolve(repositoryRoot, 'generated-preview')) {
    throw new Error('Refusing to clean an unexpected renderer output directory.');
  }
}

function assertWithinOutput(path: string): void {
  const child = relative(outputRoot, path);
  if (child.startsWith(`..${sep}`) || child === '..') {
    throw new Error(`Renderer artifact escaped the output directory: ${path}`);
  }
}
