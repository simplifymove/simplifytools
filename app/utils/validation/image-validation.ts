/**
 * Image Validation Utilities
 * Comprehensive validation for all image tools
 * Reuses patterns from video-tools error handling
 */

import {
  ImageToolErrorType,
  IMAGE_ERROR_MESSAGES,
  IMAGE_TOOL_FILE_SIZE_LIMITS,
  IMAGE_DEFAULT_MAX_FILE_SIZE_MB,
  SUPPORTED_IMAGE_FORMATS,
  SUPPORTED_IMAGE_MIME_TYPES,
  IMAGE_VALIDATION_CONSTRAINTS,
} from '@/app/utils/types/errors';

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errorType?: ImageToolErrorType;
}

export interface ImageMetadata {
  width: number;
  height: number;
  mimeType: string;
  hasAlpha: boolean;
  isAnimated: boolean;
}

/**
 * Validate file size with optional tool-specific limits
 */
export function validateImageFileSize(
  file: File,
  toolId?: string
): ValidationResult {
  const maxSizeMB = toolId ? IMAGE_TOOL_FILE_SIZE_LIMITS[toolId] ?? IMAGE_DEFAULT_MAX_FILE_SIZE_MB : IMAGE_DEFAULT_MAX_FILE_SIZE_MB;
  const sizeMB = file.size / (1024 * 1024);

  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `File size must be under ${maxSizeMB}MB. Current: ${sizeMB.toFixed(2)}MB`,
      errorType: ImageToolErrorType.FILE_TOO_LARGE,
    };
  }

  return { valid: true };
}

/**
 * Check if file is empty (0 bytes)
 */
export function validateImageNotEmpty(file: File): ValidationResult {
  if (file.size === 0) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.EMPTY_FILE],
      errorType: ImageToolErrorType.EMPTY_FILE,
    };
  }
  return { valid: true };
}

/**
 * Validate file extension
 */
export function validateImageExtension(filename: string): ValidationResult {
  const ext = ('.' + filename.split('.').pop()?.toLowerCase()).toLowerCase();

  if (!SUPPORTED_IMAGE_FORMATS.includes(ext)) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.UNSUPPORTED_FORMAT],
      errorType: ImageToolErrorType.UNSUPPORTED_FORMAT,
    };
  }

  return { valid: true };
}

/**
 * Validate MIME type
 */
export function validateImageMimeType(file: File): ValidationResult {
  const normalizedMimeType = file.type.toLowerCase();
  
  // Allow common MIME type variations
  const mimeTypeVariations: Record<string, string[]> = {
    'image/jpeg': ['image/jpeg', 'image/jpg'],
    'image/png': ['image/png'],
    'image/webp': ['image/webp'],
    'image/gif': ['image/gif'],
    'image/svg+xml': ['image/svg+xml', 'image/svg'],
    'image/avif': ['image/avif'],
    'image/heic': ['image/heic', 'image/heif'],
    'image/x-icon': ['image/x-icon', 'image/vnd.microsoft.icon'],
    'image/tiff': ['image/tiff', 'image/tif'],
    'image/bmp': ['image/bmp', 'image/x-bmp'],
  };

  // Check against accepted MIME types
  const isValid = SUPPORTED_IMAGE_MIME_TYPES.some(mimeType => {
    const variations = mimeTypeVariations[mimeType] || [mimeType];
    return variations.includes(normalizedMimeType);
  });

  if (!isValid && file.type.length > 0) {
    // Warn but don't fail - some systems report different MIME types
    console.warn(`Unexpected MIME type for ${file.name}: ${file.type}`);
  }

  return { valid: true };
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(
  metadata: Partial<ImageMetadata>
): ValidationResult {
  const { width, height } = metadata;

  if (!width || !height) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.INVALID_DIMENSIONS],
      errorType: ImageToolErrorType.INVALID_DIMENSIONS,
    };
  }

  if (width === 0) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.ZERO_WIDTH],
      errorType: ImageToolErrorType.ZERO_WIDTH,
    };
  }

  if (height === 0) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.ZERO_HEIGHT],
      errorType: ImageToolErrorType.ZERO_HEIGHT,
    };
  }

  if (width < IMAGE_VALIDATION_CONSTRAINTS.MIN_WIDTH || height < IMAGE_VALIDATION_CONSTRAINTS.MIN_HEIGHT) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.INVALID_DIMENSIONS],
      errorType: ImageToolErrorType.INVALID_DIMENSIONS,
    };
  }

  if (width > IMAGE_VALIDATION_CONSTRAINTS.MAX_WIDTH || height > IMAGE_VALIDATION_CONSTRAINTS.MAX_HEIGHT) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.DIMENSIONS_TOO_LARGE],
      errorType: ImageToolErrorType.DIMENSIONS_TOO_LARGE,
    };
  }

  const megapixels = (width * height) / 1000000;
  if (megapixels > IMAGE_VALIDATION_CONSTRAINTS.MAX_MEGAPIXELS) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.DIMENSIONS_TOO_LARGE],
      errorType: ImageToolErrorType.DIMENSIONS_TOO_LARGE,
    };
  }

  return { valid: true };
}

/**
 * Validate resize dimensions
 */
export function validateResizeDimensions(
  targetWidth?: number | string,
  targetHeight?: number | string,
  originalWidth?: number,
  originalHeight?: number
): ValidationResult {
  const width = typeof targetWidth === 'string' ? parseInt(targetWidth, 10) : targetWidth;
  const height = typeof targetHeight === 'string' ? parseInt(targetHeight, 10) : targetHeight;

  if (!width || !height || isNaN(width) || isNaN(height)) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.INVALID_RESIZE_DIMENSIONS],
      errorType: ImageToolErrorType.INVALID_RESIZE_DIMENSIONS,
    };
  }

  if (width === 0 || height === 0) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.ZERO_DIMENSIONS],
      errorType: ImageToolErrorType.ZERO_DIMENSIONS,
    };
  }

  if (width < IMAGE_VALIDATION_CONSTRAINTS.MIN_WIDTH || height < IMAGE_VALIDATION_CONSTRAINTS.MIN_HEIGHT) {
    return {
      valid: false,
      error: 'Width and height must be at least 1 pixel.',
      errorType: ImageToolErrorType.INVALID_RESIZE_DIMENSIONS,
    };
  }

  if (width > IMAGE_VALIDATION_CONSTRAINTS.MAX_WIDTH || height > IMAGE_VALIDATION_CONSTRAINTS.MAX_HEIGHT) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.RESIZE_OUTPUT_TOO_LARGE],
      errorType: ImageToolErrorType.RESIZE_OUTPUT_TOO_LARGE,
    };
  }

  return { valid: true };
}

/**
 * Validate compression quality
 */
export function validateCompressionQuality(quality?: number | string): ValidationResult {
  const q = typeof quality === 'string' ? parseInt(quality, 10) : quality;

  if (q === undefined || isNaN(q)) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.INVALID_QUALITY],
      errorType: ImageToolErrorType.INVALID_QUALITY,
    };
  }

  if (q < 0 || q > 100) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.INVALID_QUALITY],
      errorType: ImageToolErrorType.INVALID_QUALITY,
    };
  }

  return { valid: true };
}

/**
 * Validate crop bounds
 */
export function validateCropBounds(
  x: number | string,
  y: number | string,
  width: number | string,
  height: number | string,
  imageWidth: number,
  imageHeight: number
): ValidationResult {
  const cropX = typeof x === 'string' ? parseInt(x, 10) : x;
  const cropY = typeof y === 'string' ? parseInt(y, 10) : y;
  const cropW = typeof width === 'string' ? parseInt(width, 10) : width;
  const cropH = typeof height === 'string' ? parseInt(height, 10) : height;

  if (isNaN(cropX) || isNaN(cropY) || isNaN(cropW) || isNaN(cropH)) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.INVALID_CROP_BOUNDS],
      errorType: ImageToolErrorType.INVALID_CROP_BOUNDS,
    };
  }

  if (cropX < 0 || cropY < 0 || cropW <= 0 || cropH <= 0) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.INVALID_CROP_BOUNDS],
      errorType: ImageToolErrorType.INVALID_CROP_BOUNDS,
    };
  }

  if (cropX + cropW > imageWidth || cropY + cropH > imageHeight) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.CROP_OUT_OF_RANGE],
      errorType: ImageToolErrorType.CROP_OUT_OF_RANGE,
    };
  }

  return { valid: true };
}

/**
 * Validate watermark opacity
 */
export function validateWatermarkOpacity(opacity?: number | string): ValidationResult {
  const op = typeof opacity === 'string' ? parseFloat(opacity) : opacity;

  if (op === undefined || isNaN(op)) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.INVALID_OPACITY],
      errorType: ImageToolErrorType.INVALID_OPACITY,
    };
  }

  if (op < 0 || op > 100) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.INVALID_OPACITY],
      errorType: ImageToolErrorType.INVALID_OPACITY,
    };
  }

  return { valid: true };
}

/**
 * Validate watermark text
 */
export function validateWatermarkText(text?: string): ValidationResult {
  if (!text || text.trim().length === 0) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.INVALID_WATERMARK_TEXT],
      errorType: ImageToolErrorType.INVALID_WATERMARK_TEXT,
    };
  }

  if (text.length > 500) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.TEXT_TOO_LONG],
      errorType: ImageToolErrorType.TEXT_TOO_LONG,
    };
  }

  return { valid: true };
}

/**
 * Validate watermark scale
 */
export function validateWatermarkScale(scale?: number | string): ValidationResult {
  const s = typeof scale === 'string' ? parseFloat(scale) : scale;

  if (s === undefined || isNaN(s)) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.INVALID_WATERMARK_SCALE],
      errorType: ImageToolErrorType.INVALID_WATERMARK_SCALE,
    };
  }

  if (s < 0.1 || s > 10) {
    return {
      valid: false,
      error: 'Watermark scale must be between 0.1 and 10.',
      errorType: ImageToolErrorType.INVALID_WATERMARK_SCALE,
    };
  }

  return { valid: true };
}

/**
 * Validate QR code text
 */
export function validateQRCodeText(text?: string): ValidationResult {
  if (!text || text.trim().length === 0) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.EMPTY_QR_TEXT],
      errorType: ImageToolErrorType.EMPTY_QR_TEXT,
    };
  }

  if (text.length > 2953) { // QR code theoretical limit
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.QR_TEXT_TOO_LONG],
      errorType: ImageToolErrorType.QR_TEXT_TOO_LONG,
    };
  }

  return { valid: true };
}

/**
 * Validate QR code URL
 */
export function validateQRCodeURL(url: string): ValidationResult {
  try {
    // Test if it's a valid URL format
    new URL(url);
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.INVALID_QR_URL],
      errorType: ImageToolErrorType.INVALID_QR_URL,
    };
  }
}

/**
 * Validate GIF parameters
 */
export function validateGifParameters(
  frameCount?: number,
  duration?: number
): ValidationResult {
  if (frameCount !== undefined && frameCount < 2) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.INVALID_GIF_FRAMES],
      errorType: ImageToolErrorType.INVALID_GIF_FRAMES,
    };
  }

  if (frameCount !== undefined && frameCount > 1000) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.GIF_FRAME_LIMIT_EXCEEDED],
      errorType: ImageToolErrorType.GIF_FRAME_LIMIT_EXCEEDED,
    };
  }

  if (duration !== undefined && duration > 600) { // 10 minutes max
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.INVALID_GIF_DURATION],
      errorType: ImageToolErrorType.INVALID_GIF_DURATION,
    };
  }

  return { valid: true };
}

/**
 * Validate AI prompt
 */
export function validateAIPrompt(prompt?: string): ValidationResult {
  if (!prompt || prompt.trim().length === 0) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.INVALID_PROMPT],
      errorType: ImageToolErrorType.INVALID_PROMPT,
    };
  }

  if (prompt.length > 1000) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.PROMPT_TOO_LONG],
      errorType: ImageToolErrorType.PROMPT_TOO_LONG,
    };
  }

  return { valid: true };
}

/**
 * Check if image has transparency
 */
export function imageHasTransparency(metadata: Partial<ImageMetadata>): boolean {
  return metadata.hasAlpha === true;
}

/**
 * Check if image is animated
 */
export function imageIsAnimated(metadata: Partial<ImageMetadata>): boolean {
  return metadata.isAnimated === true;
}

/**
 * Validate transparency support for format
 */
export function validateTransparencySupport(
  format: string,
  hasAlpha: boolean
): ValidationResult {
  // Formats that don't support transparency
  const opaqueFormats = ['jpg', 'jpeg', 'bmp'];
  
  const ext = format.toLowerCase().replace('.', '').split('?')[0];
  
  if (hasAlpha && opaqueFormats.includes(ext)) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.UNSUPPORTED_TRANSPARENCY],
      errorType: ImageToolErrorType.UNSUPPORTED_TRANSPARENCY,
    };
  }

  return { valid: true };
}

/**
 * Validate animated image support for operation
 */
export function validateAnimatedImageSupport(
  isAnimated: boolean,
  operationSupportsAnimated: boolean
): ValidationResult {
  if (isAnimated && !operationSupportsAnimated) {
    return {
      valid: false,
      error: IMAGE_ERROR_MESSAGES[ImageToolErrorType.INVALID_ANIMATED_FORMAT],
      errorType: ImageToolErrorType.INVALID_ANIMATED_FORMAT,
    };
  }

  return { valid: true };
}
