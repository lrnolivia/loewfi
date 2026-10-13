import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(repositoryRoot, 'portfolio', 'assets');
const outputRoot = path.join(repositoryRoot, 'public', 'media');
const widths = [720, 1600];
const sourceExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

async function collectImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectImages(absolutePath);
    return sourceExtensions.has(path.extname(entry.name).toLowerCase()) ? [absolutePath] : [];
  }));
  return nested.flat();
}

function outputPath(sourcePath, width) {
  const relativePath = path.relative(sourceRoot, sourcePath);
  const extension = path.extname(relativePath);
  return path.join(outputRoot, relativePath.slice(0, -extension.length) + `-${width}.webp`);
}

async function isCurrent(sourcePath, targetPath) {
  try {
    const [sourceInfo, targetInfo] = await Promise.all([stat(sourcePath), stat(targetPath)]);
    return targetInfo.mtimeMs >= sourceInfo.mtimeMs && targetInfo.size > 0;
  } catch {
    return false;
  }
}

async function renderVariant(sourcePath, width) {
  const targetPath = outputPath(sourcePath, width);
  if (await isCurrent(sourcePath, targetPath)) return false;
  await mkdir(path.dirname(targetPath), { recursive: true });
  await sharp(sourcePath, { failOn: 'none' })
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 84, effort: 4, smartSubsample: true })
    .toFile(targetPath);
  return true;
}

async function runPool(tasks, concurrency = 6) {
  let cursor = 0;
  const results = [];
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
    while (cursor < tasks.length) {
      const task = tasks[cursor++];
      results.push(await task());
    }
  });
  await Promise.all(workers);
  return results;
}

const sourceImages = await collectImages(sourceRoot);
const tasks = sourceImages.flatMap((sourcePath) => widths.map((width) => () => renderVariant(sourcePath, width)));
const results = await runPool(tasks);
const renderedCount = results.filter(Boolean).length;

console.log(`Portfolio media: ${sourceImages.length} originals, ${tasks.length} responsive variants, ${renderedCount} generated.`);
