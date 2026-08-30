import { posix } from 'node:path';

export function relativeAssetUrl(artifactPath: string, repositoryPath: string): string {
  const fromDirectory = posix.dirname(artifactPath);
  const relative = posix.relative(fromDirectory, repositoryPath);
  return relative.startsWith('.') ? relative : `./${relative}`;
}

export function uniqueSorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}
