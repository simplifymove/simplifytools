/**
 * Image Tool Error Handler
 * Reuses patterns from video tools error handling
 * Provides centralized error creation and handling for image tools
 */

import { ToolError, ImageToolErrorType, IMAGE_ERROR_MESSAGES, IMAGE_ERROR_REPORTING_EXCLUSIONS } from '@/app/utils/types/errors';

/**
 * Create a standardized image tool error
 */
export function createImageToolError(
  type: ImageToolErrorType,
  toolId: string,
  toolName: string,
  details?: Record<string, any>,
  fileMeta?: ToolError['fileMeta'],
  customUserMessage?: string
): ToolError {
  return {
    type,
    message: IMAGE_ERROR_MESSAGES[type],
    userFriendlyMessage: customUserMessage || IMAGE_ERROR_MESSAGES[type],
    details,
    timestamp: new Date(),
    toolId,
    toolName,
    fileMeta,
  };
}

/**
 * Log and handle image tool error
 * Follows the same pattern as video tools
 */
export async function handleImageToolError(
  error: ToolError,
  additionalContext?: {
    userAgent?: string;
    url?: string;
    isLoggedIn?: boolean;
    stackTrace?: string;
  }
): Promise<void> {
  const isValidationError = IMAGE_ERROR_REPORTING_EXCLUSIONS.includes(error.type as ImageToolErrorType);

  // Always log to console in development with detailed information
  if (process.env.NODE_ENV === 'development') {
    const logData = {
      type: error.type,
      message: error.message,
      userMessage: error.userFriendlyMessage,
      toolId: error.toolId,
      toolName: error.toolName,
      timestamp: error.timestamp.toISOString(),
      details: error.details || {},
      fileMeta: error.fileMeta || {},
      additionalContext,
    };

    if (isValidationError) {
      console.warn(`[${error.toolId}] Validation: ${error.userFriendlyMessage}`);
    } else {
      console.error(`[${error.toolId}] Error: ${error.type} - ${JSON.stringify(logData, null, 2)}`);
    }
  }

  // Log to external service if configured (Sentry, LogRocket, etc.)
  if (typeof window !== 'undefined' && (window as any).errorReporting) {
    (window as any).errorReporting.captureException(error);
  }

  // Server-side email reporting is handled by API routes only
}

/**
 * Parse API error responses from image processing endpoints
 */
export function parseImageApiError(response: any): { type: ImageToolErrorType; message: string } {
  if (!response) {
    return {
      type: ImageToolErrorType.API_ERROR,
      message: IMAGE_ERROR_MESSAGES[ImageToolErrorType.API_ERROR],
    };
  }

  // Sharp errors
  if (response.message && response.message.toLowerCase().includes('sharp')) {
    return {
      type: ImageToolErrorType.SHARP_FAILED,
      message: IMAGE_ERROR_MESSAGES[ImageToolErrorType.SHARP_FAILED],
    };
  }

  // ImageMagick errors
  if (response.message && (response.message.toLowerCase().includes('imagemagick') || response.message.toLowerCase().includes('convert'))) {
    return {
      type: ImageToolErrorType.IMAGEMAGICK_FAILED,
      message: IMAGE_ERROR_MESSAGES[ImageToolErrorType.IMAGEMAGICK_FAILED],
    };
  }

  // Canvas errors
  if (response.message && response.message.toLowerCase().includes('canvas')) {
    return {
      type: ImageToolErrorType.CANVAS_FAILED,
      message: IMAGE_ERROR_MESSAGES[ImageToolErrorType.CANVAS_FAILED],
    };
  }

  // Timeout errors
  if (response.message && (response.message.toLowerCase().includes('timeout') || response.message.toLowerCase().includes('timed out'))) {
    return {
      type: ImageToolErrorType.PROCESSING_TIMEOUT,
      message: IMAGE_ERROR_MESSAGES[ImageToolErrorType.PROCESSING_TIMEOUT],
    };
  }

  // Memory errors
  if (response.message && (response.message.toLowerCase().includes('memory') || response.message.toLowerCase().includes('heap') || response.message.toLowerCase().includes('enospc'))) {
    return {
      type: ImageToolErrorType.MEMORY_ERROR,
      message: IMAGE_ERROR_MESSAGES[ImageToolErrorType.MEMORY_ERROR],
    };
  }

  // Network errors
  if (response.message && response.message.toLowerCase().includes('network')) {
    return {
      type: ImageToolErrorType.NETWORK_ERROR,
      message: IMAGE_ERROR_MESSAGES[ImageToolErrorType.NETWORK_ERROR],
    };
  }

  // OCR-specific errors
  if (response.message && response.message.toLowerCase().includes('ocr')) {
    return {
      type: ImageToolErrorType.OCR_FAILED,
      message: IMAGE_ERROR_MESSAGES[ImageToolErrorType.OCR_FAILED],
    };
  }

  // AI-specific errors
  if (response.message && (response.message.toLowerCase().includes('ai') || response.message.toLowerCase().includes('quota'))) {
    return {
      type: ImageToolErrorType.AI_PROCESSING_FAILED,
      message: IMAGE_ERROR_MESSAGES[ImageToolErrorType.AI_PROCESSING_FAILED],
    };
  }

  // Compression errors
  if (response.message && response.message.toLowerCase().includes('compress')) {
    return {
      type: ImageToolErrorType.COMPRESSION_FAILED,
      message: IMAGE_ERROR_MESSAGES[ImageToolErrorType.COMPRESSION_FAILED],
    };
  }

  // Corrupted image
  if (response.message && (response.message.toLowerCase().includes('corrupt') || response.message.toLowerCase().includes('invalid'))) {
    return {
      type: ImageToolErrorType.FILE_CORRUPTED,
      message: IMAGE_ERROR_MESSAGES[ImageToolErrorType.FILE_CORRUPTED],
    };
  }

  // Generic API error
  return {
    type: ImageToolErrorType.API_ERROR,
    message: response.message || IMAGE_ERROR_MESSAGES[ImageToolErrorType.API_ERROR],
  };
}

/**
 * Check if error should be reported to monitoring system
 */
export function shouldReportError(type: ImageToolErrorType): boolean {
  return !IMAGE_ERROR_REPORTING_EXCLUSIONS.includes(type);
}
