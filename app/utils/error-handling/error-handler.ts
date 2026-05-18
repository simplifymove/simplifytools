/**
 * Centralized Error Handling Service
 * Standardizes error handling and reporting across all video tools
 * Note: Email reporting happens server-side in the API route
 */

import { ToolError, VideoToolErrorType, ImageToolErrorType, ToolErrorType, ERROR_MESSAGES, IMAGE_ERROR_MESSAGES, EmailErrorReport } from '@/app/utils/types/errors';

/**
 * Get error message for either video or image tool error type
 */
function getErrorMessage(type: ToolErrorType): string {
  if (type in ERROR_MESSAGES) {
    return ERROR_MESSAGES[type as VideoToolErrorType];
  } else if (type in IMAGE_ERROR_MESSAGES) {
    return IMAGE_ERROR_MESSAGES[type as ImageToolErrorType];
  }
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Create a standardized tool error
 */
export function createToolError(
  type: ToolErrorType,
  toolId: string,
  toolName: string,
  details?: Record<string, any>,
  fileMeta?: ToolError['fileMeta'],
  customUserMessage?: string
): ToolError {
  return {
    type,
    message: getErrorMessage(type),
    userFriendlyMessage: customUserMessage || getErrorMessage(type),
    details,
    timestamp: new Date(),
    toolId,
    toolName,
    fileMeta,
  };
}

/**
 * Validation error types that should not trigger emails or full error logging
 */
const VALIDATION_ERROR_TYPES: ToolErrorType[] = [
  // Video validation errors
  VideoToolErrorType.EMPTY_FILE,
  VideoToolErrorType.UNSUPPORTED_FORMAT,
  VideoToolErrorType.FILE_CORRUPTED,
  VideoToolErrorType.FILE_TOO_LARGE,
  VideoToolErrorType.INVALID_MIME_TYPE,
  VideoToolErrorType.INVALID_DURATION,
  VideoToolErrorType.INVALID_TIME_FORMAT,
  VideoToolErrorType.END_TIME_EXCEEDS_DURATION,
  VideoToolErrorType.START_TIME_GREATER_THAN_END,
  VideoToolErrorType.INSUFFICIENT_FILES,
  VideoToolErrorType.INVALID_DIMENSIONS,
  VideoToolErrorType.ZERO_DIMENSIONS,
  VideoToolErrorType.INVALID_BITRATE,
  VideoToolErrorType.INVALID_COMPRESSION_LEVEL,
  VideoToolErrorType.INVALID_GIF_DURATION,
  VideoToolErrorType.INVALID_SUBTITLE_FORMAT,
  VideoToolErrorType.MALFORMED_SUBTITLES,
  VideoToolErrorType.INVALID_OPACITY,
  VideoToolErrorType.INVALID_WATERMARK_FORMAT,
  // Image validation errors
  ImageToolErrorType.EMPTY_FILE,
  ImageToolErrorType.UNSUPPORTED_FORMAT,
  ImageToolErrorType.FILE_CORRUPTED,
  ImageToolErrorType.FILE_TOO_LARGE,
  ImageToolErrorType.INVALID_MIME_TYPE,
  ImageToolErrorType.INVALID_DIMENSIONS,
  ImageToolErrorType.ZERO_DIMENSIONS,
  ImageToolErrorType.ZERO_WIDTH,
  ImageToolErrorType.ZERO_HEIGHT,
  ImageToolErrorType.DIMENSIONS_TOO_LARGE,
  ImageToolErrorType.INVALID_ASPECT_RATIO,
  ImageToolErrorType.UNSUPPORTED_TRANSPARENCY,
  ImageToolErrorType.INVALID_ANIMATED_FORMAT,
  ImageToolErrorType.INVALID_RESIZE_DIMENSIONS,
  ImageToolErrorType.RESIZE_OUTPUT_TOO_LARGE,
  ImageToolErrorType.INVALID_QUALITY,
  ImageToolErrorType.INVALID_CROP_BOUNDS,
  ImageToolErrorType.CROP_OUT_OF_RANGE,
  ImageToolErrorType.INVALID_OPACITY,
  ImageToolErrorType.INVALID_WATERMARK_TEXT,
  ImageToolErrorType.INVALID_WATERMARK_SCALE,
  ImageToolErrorType.INVALID_WATERMARK_POSITION,
  ImageToolErrorType.TEXT_TOO_LONG,
  ImageToolErrorType.INVALID_FONT_SIZE,
  ImageToolErrorType.INVALID_GIF_FRAMES,
  ImageToolErrorType.INVALID_GIF_DURATION,
  ImageToolErrorType.GIF_TOO_LARGE,
  ImageToolErrorType.GIF_FRAME_LIMIT_EXCEEDED,
  ImageToolErrorType.EMPTY_QR_TEXT,
  ImageToolErrorType.INVALID_QR_URL,
  ImageToolErrorType.QR_TEXT_TOO_LONG,
  ImageToolErrorType.INVALID_PROMPT,
  ImageToolErrorType.PROMPT_TOO_LONG,
];

/**
 * Log and report error with automatic email notification
 * Called from both frontend and backend
 * Email sending only happens on the server-side (API route)
 */
export async function handleToolError(
  error: ToolError,
  additionalContext?: {
    userAgent?: string;
    url?: string;
    isLoggedIn?: boolean;
    stackTrace?: string;
  }
): Promise<void> {
  const isValidationError = (VALIDATION_ERROR_TYPES as any[]).includes(error.type);

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
      // Validation errors: use console.warn with user-friendly message
      console.warn(`[${error.toolId}] Validation: ${error.userFriendlyMessage}`);
    } else {
      // System errors: use console.error with full details
      console.error(`[${error.toolId}] Error: ${error.type} - ${JSON.stringify(logData)}`);
    }
  }

  // Log to external service (Sentry, LogRocket, etc.) if configured
  if (typeof window !== 'undefined' && (window as any).errorReporting) {
    (window as any).errorReporting.captureException(error);
  }

  // Note: Email reporting is handled by the API route (server-side only)
  // Client-side errors will be reported when the API is called
}

/**
 * Handle API errors from processing endpoints
 */
export function parseApiError(response: any): { type: VideoToolErrorType; message: string } {
  // FFmpeg specific errors
  if (response.message && response.message.includes('ffmpeg')) {
    return {
      type: VideoToolErrorType.FFMPEG_FAILED,
      message: ERROR_MESSAGES[VideoToolErrorType.FFMPEG_FAILED],
    };
  }

  // Memory errors
  if (response.message && (response.message.includes('memory') || response.message.includes('heap'))) {
    return {
      type: VideoToolErrorType.MEMORY_ERROR,
      message: ERROR_MESSAGES[VideoToolErrorType.MEMORY_ERROR],
    };
  }

  // Timeout errors
  if (
    response.message &&
    (response.message.includes('timeout') || response.message.includes('timed out'))
  ) {
    return {
      type: VideoToolErrorType.PROCESSING_TIMEOUT,
      message: ERROR_MESSAGES[VideoToolErrorType.PROCESSING_TIMEOUT],
    };
  }

  // Disk space errors
  if (response.message && (response.message.includes('ENOSPC') || response.message.includes('disk space'))) {
    return {
      type: VideoToolErrorType.DISK_SPACE_ERROR,
      message: ERROR_MESSAGES[VideoToolErrorType.DISK_SPACE_ERROR],
    };
  }

  // Generic API error
  return {
    type: VideoToolErrorType.API_ERROR,
    message: response.message || ERROR_MESSAGES[VideoToolErrorType.API_ERROR],
  };
}

/**
 * Sanitize error message for display to users
 * Remove sensitive information
 */
export function sanitizeErrorMessage(message: string): string {
  // Remove file paths
  let sanitized = message.replace(/\/[a-zA-Z0-9_\-./]+\.(mp4|mov|avi|mkv|webm)/gi, '[file]');

  // Remove stack traces
  sanitized = sanitized.replace(/at\s+[a-zA-Z0-9_.]+\s+\(/g, '');

  // Remove system paths
  sanitized = sanitized.replace(/[A-Z]:\\[^\\]+\\[^\\]+/g, '[path]');
  sanitized = sanitized.replace(/\/home\/[^\/]+\//g, '[path]/');

  // Remove database connection strings
  sanitized = sanitized.replace(/mongodb:\/\/[^@]+@[^\/]+/gi, '[database]');

  // Remove API keys and tokens (basic patterns)
  sanitized = sanitized.replace(/[a-f0-9]{32,}/gi, '[redacted]');

  return sanitized;
}

/**
 * Parse error from Python backend
 */
export function parsePythonError(stderr: string): { type: VideoToolErrorType; message: string } {
  const lines = stderr.toLowerCase();

  // FFmpeg errors
  if (lines.includes('ffmpeg') || lines.includes('framecount')) {
    return {
      type: VideoToolErrorType.FFMPEG_FAILED,
      message: ERROR_MESSAGES[VideoToolErrorType.FFMPEG_FAILED],
    };
  }

  // Codec errors
  if (lines.includes('codec') || lines.includes('unknown encoder')) {
    return {
      type: VideoToolErrorType.FFMPEG_FAILED,
      message: ERROR_MESSAGES[VideoToolErrorType.FFMPEG_FAILED],
    };
  }

  // Memory errors
  if (lines.includes('memory') || lines.includes('out of memory') || lines.includes('segmentation fault')) {
    return {
      type: VideoToolErrorType.MEMORY_ERROR,
      message: ERROR_MESSAGES[VideoToolErrorType.MEMORY_ERROR],
    };
  }

  // File errors
  if (lines.includes('no such file') || lines.includes('cannot find')) {
    return {
      type: VideoToolErrorType.FILE_CORRUPTED,
      message: ERROR_MESSAGES[VideoToolErrorType.FILE_CORRUPTED],
    };
  }

  return {
    type: VideoToolErrorType.FFMPEG_FAILED,
    message: ERROR_MESSAGES[VideoToolErrorType.FFMPEG_FAILED],
  };
}

/**
 * Create error from caught exception
 */
export function createErrorFromException(
  error: unknown,
  toolId: string,
  toolName: string,
  fileMeta?: ToolError['fileMeta']
): ToolError {
  let errorType = VideoToolErrorType.UNKNOWN_ERROR;
  let message = ERROR_MESSAGES[VideoToolErrorType.UNKNOWN_ERROR];
  let stackTrace: string | undefined;

  if (error instanceof Error) {
    message = error.message;
    stackTrace = error.stack;

    // Try to detect error type from message
    const lowerMessage = error.message.toLowerCase();
    if (lowerMessage.includes('timeout')) {
      errorType = VideoToolErrorType.PROCESSING_TIMEOUT;
      message = ERROR_MESSAGES[VideoToolErrorType.PROCESSING_TIMEOUT];
    } else if (lowerMessage.includes('memory')) {
      errorType = VideoToolErrorType.MEMORY_ERROR;
      message = ERROR_MESSAGES[VideoToolErrorType.MEMORY_ERROR];
    } else if (lowerMessage.includes('ffmpeg')) {
      errorType = VideoToolErrorType.FFMPEG_FAILED;
      message = ERROR_MESSAGES[VideoToolErrorType.FFMPEG_FAILED];
    }
  }

  return {
    type: errorType,
    message,
    userFriendlyMessage: ERROR_MESSAGES[errorType],
    timestamp: new Date(),
    toolId,
    toolName,
    fileMeta,
    stackTrace,
  };
}

/**
 * Get error severity level for reporting priority
 */
export function getErrorSeverity(type: VideoToolErrorType): 'low' | 'medium' | 'high' | 'critical' {
  const criticalErrors = [
    VideoToolErrorType.MEMORY_ERROR,
    VideoToolErrorType.DISK_SPACE_ERROR,
    VideoToolErrorType.FFMPEG_FAILED,
  ];

  const highErrors = [
    VideoToolErrorType.PROCESSING_TIMEOUT,
    VideoToolErrorType.NETWORK_ERROR,
    VideoToolErrorType.FILE_CORRUPTED,
  ];

  if (criticalErrors.includes(type)) return 'critical';
  if (highErrors.includes(type)) return 'high';

  return 'medium';
}

