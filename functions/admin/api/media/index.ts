import type { ProjectType } from '../../../../src/shared/content/types';
import { allowMethod, CmsApiError, jsonSuccess, readMediaBody, requireIdentity } from '../_lib/http';
import { requireMediaRepository } from '../_lib/storage';
import type { CmsRouteContext } from '../_lib/types';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

export async function onRequest(context: CmsRouteContext): Promise<Response> {
  allowMethod(context.request, ['GET', 'POST']);
  const identity = requireIdentity(context.data);
  const repository = requireMediaRepository(context.env);
  const url = new URL(context.request.url);

  if (context.request.method === 'GET') {
    const stagingId = url.searchParams.get('id') ?? '';
    const stored = await repository.read(stagingId);
    if (!stored) throw new CmsApiError(404, 'not_found', 'That staged media file was not found or has expired.');
    return new Response(stored.bytes, {
      headers: {
        'cache-control': 'no-store',
        'content-type': stored.asset.contentType,
        'content-length': String(stored.asset.byteLength),
        'x-content-type-options': 'nosniff',
        'x-cms-media-id': stored.asset.stagingId,
      },
    });
  }

  const metadata = parseUploadMetadata(url.searchParams);
  const { bytes, contentType } = await readMediaBody(context.request);
  const asset = await repository.save(bytes, {
    ...metadata,
    targetPath: targetPath(metadata.projectType, metadata.projectSlug, metadata.assetId, metadata.variant, contentType),
    contentType,
    byteLength: bytes.byteLength,
    uploadedBy: identity.email,
  });
  return jsonSuccess(asset, context.data.requestId ?? 'missing-request-id', 201);
}

function parseUploadMetadata(search: URLSearchParams) {
  const projectType = search.get('projectType');
  const projectSlug = search.get('projectSlug') ?? '';
  const assetId = search.get('assetId') ?? '';
  const variant = search.get('variant');
  const width = Number(search.get('width'));
  const height = Number(search.get('height'));

  if (!['design', 'photography'].includes(projectType ?? '')) {
    throw new CmsApiError(400, 'validation_failed', 'Project type must be design or photography.');
  }
  if (!SLUG.test(projectSlug)) throw new CmsApiError(400, 'validation_failed', 'Project slug must be lowercase kebab-case.');
  if (!ID.test(assetId) || !assetId.startsWith(`${projectSlug}-`)) {
    throw new CmsApiError(400, 'validation_failed', 'Asset id must be a stable id prefixed by the project slug.');
  }
  if (!['web', 'full'].includes(variant ?? '')) throw new CmsApiError(400, 'validation_failed', 'Media variant must be web or full.');
  if (!Number.isSafeInteger(width) || width < 1 || width > 30_000 || !Number.isSafeInteger(height) || height < 1 || height > 30_000) {
    throw new CmsApiError(400, 'validation_failed', 'Media dimensions must be positive integers no larger than 30000 pixels.');
  }
  return {
    projectType: projectType as ProjectType,
    projectSlug,
    assetId,
    variant: variant as 'web' | 'full',
    width,
    height,
  };
}

function targetPath(
  projectType: ProjectType,
  projectSlug: string,
  assetId: string,
  variant: 'web' | 'full',
  contentType: 'image/jpeg' | 'image/png' | 'image/webp',
): string {
  const trackFolder = projectType === 'photography' ? 'images' : 'graphics';
  const extension = contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1];
  const suffix = variant === 'full' ? '-full' : '';
  return `portfolio/assets/${trackFolder}/${projectSlug}/${assetId}${suffix}.${extension}`;
}
