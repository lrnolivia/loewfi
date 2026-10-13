export function relativeAssetUrl(artifactPath: string, repositoryPath: string): string {
  const from = artifactPath.split('/').slice(0, -1);
  const to = repositoryPath.split('/');
  let shared = 0;
  while (shared < from.length && shared < to.length && from[shared] === to[shared]) shared += 1;
  const relative = [...from.slice(shared).map(() => '..'), ...to.slice(shared)].join('/');
  return relative.startsWith('.') ? relative : `./${relative}`;
}

export function uniqueSorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}
