export type CropAspect = 'original' | 'square' | 'portrait' | 'landscape';

export type CropRect = { x: number; y: number; width: number; height: number };

export type PreparedImage = {
  source: File;
  sourceWidth: number;
  sourceHeight: number;
  web: Blob;
  webWidth: number;
  webHeight: number;
};

export type PrepareImageOptions = {
  maxWidth: number;
  quality: number;
  cropAspect: CropAspect;
  focusX: number;
  focusY: number;
};

export function cropRect(
  width: number,
  height: number,
  aspect: CropAspect,
  focusX = 0.5,
  focusY = 0.5,
): CropRect {
  if (aspect === 'original') return { x: 0, y: 0, width, height };
  const ratio = aspect === 'square' ? 1 : aspect === 'portrait' ? 4 / 5 : 16 / 9;
  const sourceRatio = width / height;
  const cropWidth = sourceRatio > ratio ? height * ratio : width;
  const cropHeight = sourceRatio > ratio ? height : width / ratio;
  return {
    x: clamp((width * focusX) - cropWidth / 2, 0, width - cropWidth),
    y: clamp((height * focusY) - cropHeight / 2, 0, height - cropHeight),
    width: cropWidth,
    height: cropHeight,
  };
}

export function normalizedAssetId(projectSlug: string, currentAssetId: string): string {
  const cleaned = currentAssetId
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^(?:project|gallery)-/, '');
  if (cleaned.startsWith(`${projectSlug}-`)) return cleaned;
  return `${projectSlug}-${cleaned || 'image'}`;
}

export async function prepareImage(file: File, options: PrepareImageOptions): Promise<PreparedImage> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPEG, PNG, or WebP image.');
  }
  const bitmap = await createImageBitmap(file);
  try {
    const crop = cropRect(bitmap.width, bitmap.height, options.cropAspect, options.focusX, options.focusY);
    const scale = Math.min(1, options.maxWidth / crop.width);
    const webWidth = Math.max(1, Math.round(crop.width * scale));
    const webHeight = Math.max(1, Math.round(crop.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = webWidth;
    canvas.height = webHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not prepare the image canvas.');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, 0, webWidth, webHeight);
    const web = await canvasBlob(canvas, 'image/webp', options.quality);
    return {
      source: file,
      sourceWidth: bitmap.width,
      sourceHeight: bitmap.height,
      web,
      webWidth,
      webHeight,
    };
  } finally {
    bitmap.close();
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1_000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('The optimized image could not be created.')), type, quality);
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
