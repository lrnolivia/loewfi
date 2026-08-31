import { describe, expect, it } from 'vitest';
import { cropRect, formatBytes, normalizedAssetId } from './prepare-image';

describe('browser media preparation helpers', () => {
  it('computes bounded focal crops for supported presentation ratios', () => {
    expect(cropRect(2000, 1000, 'square', 1, 0.5)).toEqual({ x: 1000, y: 0, width: 1000, height: 1000 });
    expect(cropRect(1000, 2000, 'landscape', 0.5, 0)).toEqual({ x: 0, y: 0, width: 1000, height: 562.5 });
    expect(cropRect(1200, 800, 'original')).toEqual({ x: 0, y: 0, width: 1200, height: 800 });
  });

  it('normalizes asset ids into the project namespace', () => {
    expect(normalizedAssetId('new-work', 'gallery-frame-2')).toBe('new-work-frame-2');
    expect(normalizedAssetId('hydroviv', 'hydroviv-hero')).toBe('hydroviv-hero');
    expect(normalizedAssetId('new-work', '../BAD file')).toBe('new-work-bad-file');
  });

  it('formats upload comparisons readably', () => {
    expect(formatBytes(900)).toBe('900 B');
    expect(formatBytes(2500)).toBe('2.5 KB');
    expect(formatBytes(2_500_000)).toBe('2.5 MB');
  });
});
