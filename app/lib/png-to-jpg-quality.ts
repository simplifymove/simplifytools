export const PNG_TO_JPG_DEFAULT_QUALITY = 90;
export const PNG_TO_JPG_MIN_QUALITY = 10;
export const PNG_TO_JPG_MAX_QUALITY = 100;

export function normalizePngToJpgQuality(value?: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return PNG_TO_JPG_DEFAULT_QUALITY;
  }

  return Math.min(
    PNG_TO_JPG_MAX_QUALITY,
    Math.max(PNG_TO_JPG_MIN_QUALITY, value),
  );
}
