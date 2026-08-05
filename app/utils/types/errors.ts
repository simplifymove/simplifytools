/**
 * Error Types and Constants for SimplifyConvert
 * Shared across all tools
 */

export enum VideoToolErrorType {
  // File validation errors
  EMPTY_FILE = 'EMPTY_FILE',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  FILE_CORRUPTED = 'FILE_CORRUPTED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_MIME_TYPE = 'INVALID_MIME_TYPE',
  MISSING_AUDIO_STREAM = 'MISSING_AUDIO_STREAM',
  MISSING_VIDEO_STREAM = 'MISSING_VIDEO_STREAM',
  INVALID_DURATION = 'INVALID_DURATION',
  
  // Tool-specific validation errors
  INVALID_TIME_FORMAT = 'INVALID_TIME_FORMAT',
  END_TIME_EXCEEDS_DURATION = 'END_TIME_EXCEEDS_DURATION',
  START_TIME_GREATER_THAN_END = 'START_TIME_GREATER_THAN_END',
  INSUFFICIENT_FILES = 'INSUFFICIENT_FILES',
  INCOMPATIBLE_CODECS = 'INCOMPATIBLE_CODECS',
  INVALID_DIMENSIONS = 'INVALID_DIMENSIONS',
  ZERO_DIMENSIONS = 'ZERO_DIMENSIONS',
  INVALID_BITRATE = 'INVALID_BITRATE',
  INVALID_COMPRESSION_LEVEL = 'INVALID_COMPRESSION_LEVEL',
  INVALID_GIF_DURATION = 'INVALID_GIF_DURATION',
  INVALID_SUBTITLE_FORMAT = 'INVALID_SUBTITLE_FORMAT',
  MALFORMED_SUBTITLES = 'MALFORMED_SUBTITLES',
  INVALID_OPACITY = 'INVALID_OPACITY',
  INVALID_WATERMARK_FORMAT = 'INVALID_WATERMARK_FORMAT',
  
  // Processing errors
  FFMPEG_FAILED = 'FFMPEG_FAILED',
  PROCESSING_TIMEOUT = 'PROCESSING_TIMEOUT',
  MEMORY_ERROR = 'MEMORY_ERROR',
  DISK_SPACE_ERROR = 'DISK_SPACE_ERROR',
  
  // Network/upload errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  UPLOAD_INTERRUPTED = 'UPLOAD_INTERRUPTED',
  INVALID_URL = 'INVALID_URL',
  
  // System errors
  API_ERROR = 'API_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ToolError {
  type: VideoToolErrorType | ImageToolErrorType;
  message: string;
  userFriendlyMessage: string;
  details?: Record<string, any>;
  timestamp: Date;
  toolId: string;
  toolName: string;
  fileMeta?: {
    filename: string;
    size: number;
    mimeType: string;
    duration?: number;
    width?: number;
    height?: number;
  };
  systemInfo?: {
    userAgent: string;
    platform: string;
    url: string;
  };
  stackTrace?: string;
}

export interface EmailErrorReport {
  toolId: string;
  toolName: string;
  errorType: VideoToolErrorType | ImageToolErrorType | ErrorReportSource;
  errorMessage: string;
  userMessage: string;
  url: string;
  timestamp: string;
  fileMeta?: {
    filename: string;
    size: string;
    mimeType: string;
    duration?: string;
    width?: string;
    height?: string;
  };
  systemInfo?: {
    userAgent: string;
    platform: string;
    isLoggedIn?: boolean;
  };
  stackTrace?: string;
  diagnostics?: ErrorReportDiagnostics;
}

export enum ErrorReportSource {
  API_ROUTE_ERROR = 'API_ROUTE_ERROR',
  FFMPEG_FAILED = 'FFMPEG_FAILED',
  OCR_FAILED = 'OCR_FAILED',
  SHARP_FAILED = 'SHARP_FAILED',
  CONVERSION_FAILED = 'CONVERSION_FAILED',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  PROVIDER_FAILED = 'PROVIDER_FAILED',
}

export interface ErrorReportDiagnostics {
  apiStatus?: number;
  endpoint?: string;
  backendErrorCode?: string;
  stderrSummary?: string;
}

export const ERROR_MESSAGES: Record<VideoToolErrorType, string> = {
  [VideoToolErrorType.EMPTY_FILE]: 'The uploaded file appears to be empty. Please select a valid file.',
  [VideoToolErrorType.UNSUPPORTED_FORMAT]: 'This file format is not supported by this tool.',
  [VideoToolErrorType.FILE_CORRUPTED]: 'The uploaded file appears to be corrupted or invalid.',
  [VideoToolErrorType.FILE_TOO_LARGE]: 'File size exceeds the maximum limit.',
  [VideoToolErrorType.INVALID_MIME_TYPE]: 'The file type does not match its contents.',
  [VideoToolErrorType.MISSING_AUDIO_STREAM]: 'No audio stream detected in the uploaded video.',
  [VideoToolErrorType.MISSING_VIDEO_STREAM]: 'No video stream detected in the uploaded file.',
  [VideoToolErrorType.INVALID_DURATION]: 'The video duration is invalid or could not be determined.',
  
  [VideoToolErrorType.INVALID_TIME_FORMAT]: 'Please enter time in MM:SS or HH:MM:SS format.',
  [VideoToolErrorType.END_TIME_EXCEEDS_DURATION]: 'End time cannot exceed the video duration.',
  [VideoToolErrorType.START_TIME_GREATER_THAN_END]: 'Start time must be less than end time.',
  [VideoToolErrorType.INSUFFICIENT_FILES]: 'This tool requires at least 2 files.',
  [VideoToolErrorType.INCOMPATIBLE_CODECS]: 'The uploaded files have incompatible codecs.',
  [VideoToolErrorType.INVALID_DIMENSIONS]: 'Please enter valid width and height values.',
  [VideoToolErrorType.ZERO_DIMENSIONS]: 'Width and height must be greater than zero.',
  [VideoToolErrorType.INVALID_BITRATE]: 'Please enter a valid bitrate value.',
  [VideoToolErrorType.INVALID_COMPRESSION_LEVEL]: 'Compression level must be between valid ranges.',
  [VideoToolErrorType.INVALID_GIF_DURATION]: 'Please select a shorter duration for GIF creation.',
  [VideoToolErrorType.INVALID_SUBTITLE_FORMAT]: 'Subtitle file format is not supported. Use .srt or .vtt',
  [VideoToolErrorType.MALFORMED_SUBTITLES]: 'The subtitle file contains malformed timestamps or content.',
  [VideoToolErrorType.INVALID_OPACITY]: 'Opacity value must be between 0 and 100.',
  [VideoToolErrorType.INVALID_WATERMARK_FORMAT]: 'Watermark image format is not supported.',
  
  [VideoToolErrorType.FFMPEG_FAILED]: 'Video processing failed. This might be due to unsupported codecs or corrupted content.',
  [VideoToolErrorType.PROCESSING_TIMEOUT]: 'Processing took too long. Please try with a smaller file.',
  [VideoToolErrorType.MEMORY_ERROR]: 'The server ran out of memory. Please try with a smaller file.',
  [VideoToolErrorType.DISK_SPACE_ERROR]: 'The server is out of disk space. Please try again later.',
  
  [VideoToolErrorType.NETWORK_ERROR]: 'Network connection error. Please check your internet and try again.',
  [VideoToolErrorType.UPLOAD_INTERRUPTED]: 'File upload was interrupted. Please try again.',
  [VideoToolErrorType.INVALID_URL]: 'The provided URL is invalid or inaccessible.',
  
  [VideoToolErrorType.API_ERROR]: 'An API error occurred. Please try again later.',
  [VideoToolErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred. Our team has been notified.',
};

// File size limits (in MB) per tool type
export const FILE_SIZE_LIMITS: Record<string, number> = {
  'mp4-to-mp3': 500,
  'mov-to-mp4': 500,
  'mp4-to-wav': 500,
  'video-to-gif': 300, // GIF generation is memory-intensive
  'merge-videos': 500,
  'compress-video': 500,
  'trim-video': 500,
  'resize-video': 500,
  'rotate-video': 500,
  'crop-video': 500,
  'extract-audio': 500,
  'mute-video': 500,
  'add-subtitles': 500,
  'watermark-video': 500,
  'change-video-speed': 500,
  'reverse-video': 500,
  'add-watermark': 500,
};

// Default max file size if not specified
export const DEFAULT_MAX_FILE_SIZE_MB = 500;

// Video codec validation
export const SUPPORTED_VIDEO_CODECS = [
  'h264', 'h265', 'hevc', 'mpeg4', 'vp8', 'vp9', 'av1', 'prores', 'dnxhd'
];

export const SUPPORTED_AUDIO_CODECS = [
  'aac', 'mp3', 'libmp3lame', 'opus', 'pcm_s16le', 'flac', 'vorbis', 'ac3'
];

// Error reporting debounce settings
export const ERROR_REPORTING_CONFIG = {
  debounceMs: 5000, // Don't send duplicate errors within 5 seconds
  maxDuplicatesPerHour: 10, // Max 10 identical error emails per hour
  excludeFromReporting: [
    // File validation errors - user input issues, not system failures
    VideoToolErrorType.EMPTY_FILE,
    VideoToolErrorType.UNSUPPORTED_FORMAT,
    VideoToolErrorType.FILE_CORRUPTED,
    VideoToolErrorType.FILE_TOO_LARGE,
    VideoToolErrorType.INVALID_MIME_TYPE,
    VideoToolErrorType.INVALID_DURATION,
    // Tool-specific validation errors - user input issues
    VideoToolErrorType.INVALID_TIME_FORMAT,
    VideoToolErrorType.END_TIME_EXCEEDS_DURATION,
    VideoToolErrorType.START_TIME_GREATER_THAN_END,
    VideoToolErrorType.INSUFFICIENT_FILES,
    VideoToolErrorType.INCOMPATIBLE_CODECS,
    VideoToolErrorType.INVALID_DIMENSIONS,
    VideoToolErrorType.ZERO_DIMENSIONS,
    VideoToolErrorType.INVALID_BITRATE,
    VideoToolErrorType.INVALID_COMPRESSION_LEVEL,
    VideoToolErrorType.INVALID_GIF_DURATION,
    VideoToolErrorType.INVALID_SUBTITLE_FORMAT,
    VideoToolErrorType.MALFORMED_SUBTITLES,
    VideoToolErrorType.INVALID_OPACITY,
    VideoToolErrorType.INVALID_WATERMARK_FORMAT,
  ],
};

/**
 * Image Tool Error Types
 * Comprehensive error coverage for all image processing tools
 */
export enum ImageToolErrorType {
  // File validation errors
  EMPTY_FILE = 'EMPTY_FILE',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  FILE_CORRUPTED = 'FILE_CORRUPTED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_MIME_TYPE = 'INVALID_MIME_TYPE',
  
  // Image-specific validation errors
  INVALID_DIMENSIONS = 'INVALID_DIMENSIONS',
  ZERO_DIMENSIONS = 'ZERO_DIMENSIONS',
  ZERO_WIDTH = 'ZERO_WIDTH',
  ZERO_HEIGHT = 'ZERO_HEIGHT',
  DIMENSIONS_TOO_LARGE = 'DIMENSIONS_TOO_LARGE',
  INVALID_ASPECT_RATIO = 'INVALID_ASPECT_RATIO',
  UNSUPPORTED_TRANSPARENCY = 'UNSUPPORTED_TRANSPARENCY',
  INVALID_ANIMATED_FORMAT = 'INVALID_ANIMATED_FORMAT',
  
  // Resize-specific errors
  INVALID_RESIZE_DIMENSIONS = 'INVALID_RESIZE_DIMENSIONS',
  RESIZE_OUTPUT_TOO_LARGE = 'RESIZE_OUTPUT_TOO_LARGE',
  
  // Compression-specific errors
  INVALID_QUALITY = 'INVALID_QUALITY',
  COMPRESSION_FAILED = 'COMPRESSION_FAILED',
  
  // Crop-specific errors
  INVALID_CROP_BOUNDS = 'INVALID_CROP_BOUNDS',
  CROP_OUT_OF_RANGE = 'CROP_OUT_OF_RANGE',
  
  // Watermark-specific errors
  INVALID_OPACITY = 'INVALID_OPACITY',
  INVALID_WATERMARK_TEXT = 'INVALID_WATERMARK_TEXT',
  INVALID_WATERMARK_SCALE = 'INVALID_WATERMARK_SCALE',
  INVALID_WATERMARK_POSITION = 'INVALID_WATERMARK_POSITION',
  TEXT_TOO_LONG = 'TEXT_TOO_LONG',
  INVALID_FONT_SIZE = 'INVALID_FONT_SIZE',
  
  // GIF-specific errors
  INVALID_GIF_FRAMES = 'INVALID_GIF_FRAMES',
  INVALID_GIF_DURATION = 'INVALID_GIF_DURATION',
  GIF_TOO_LARGE = 'GIF_TOO_LARGE',
  GIF_FRAME_LIMIT_EXCEEDED = 'GIF_FRAME_LIMIT_EXCEEDED',
  
  // QR/Barcode errors
  EMPTY_QR_TEXT = 'EMPTY_QR_TEXT',
  INVALID_QR_URL = 'INVALID_QR_URL',
  QR_TEXT_TOO_LONG = 'QR_TEXT_TOO_LONG',
  
  // OCR errors
  OCR_FAILED = 'OCR_FAILED',
  IMAGE_TOO_BLURRY = 'IMAGE_TOO_BLURRY',
  INSUFFICIENT_RESOLUTION = 'INSUFFICIENT_RESOLUTION',
  UNSUPPORTED_LANGUAGE = 'UNSUPPORTED_LANGUAGE',
  
  // AI tool errors
  AI_PROCESSING_FAILED = 'AI_PROCESSING_FAILED',
  INVALID_PROMPT = 'INVALID_PROMPT',
  PROMPT_TOO_LONG = 'PROMPT_TOO_LONG',
  UNSUPPORTED_AI_FORMAT = 'UNSUPPORTED_AI_FORMAT',
  AI_QUOTA_EXCEEDED = 'AI_QUOTA_EXCEEDED',
  
  // Processing errors
  SHARP_FAILED = 'SHARP_FAILED',
  IMAGEMAGICK_FAILED = 'IMAGEMAGICK_FAILED',
  CANVAS_FAILED = 'CANVAS_FAILED',
  PROCESSING_TIMEOUT = 'PROCESSING_TIMEOUT',
  MEMORY_ERROR = 'MEMORY_ERROR',
  DISK_SPACE_ERROR = 'DISK_SPACE_ERROR',
  
  // Network/upload errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  UPLOAD_INTERRUPTED = 'UPLOAD_INTERRUPTED',
  INVALID_URL = 'INVALID_URL',
  
  // System errors
  API_ERROR = 'API_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Union type for all tool error types
 */
export type ToolErrorType = VideoToolErrorType | ImageToolErrorType;

/**
 * Image tool error messages
 */
export const IMAGE_ERROR_MESSAGES: Record<ImageToolErrorType, string> = {
  [ImageToolErrorType.EMPTY_FILE]: 'The uploaded file appears to be empty. Please select a valid image.',
  [ImageToolErrorType.UNSUPPORTED_FORMAT]: 'This image format is not supported. Please use JPG, PNG, WebP, GIF, or other common formats.',
  [ImageToolErrorType.FILE_CORRUPTED]: 'The uploaded image appears to be corrupted or invalid.',
  [ImageToolErrorType.FILE_TOO_LARGE]: 'Image size exceeds the maximum limit.',
  [ImageToolErrorType.INVALID_MIME_TYPE]: 'The file type does not match its contents.',
  
  [ImageToolErrorType.INVALID_DIMENSIONS]: 'Please provide a valid image with valid dimensions.',
  [ImageToolErrorType.ZERO_DIMENSIONS]: 'Image width and height must be greater than zero.',
  [ImageToolErrorType.ZERO_WIDTH]: 'Image width cannot be zero.',
  [ImageToolErrorType.ZERO_HEIGHT]: 'Image height cannot be zero.',
  [ImageToolErrorType.DIMENSIONS_TOO_LARGE]: 'Image dimensions are too large for processing.',
  [ImageToolErrorType.INVALID_ASPECT_RATIO]: 'The image aspect ratio is invalid.',
  [ImageToolErrorType.UNSUPPORTED_TRANSPARENCY]: 'This operation does not support transparent images.',
  [ImageToolErrorType.INVALID_ANIMATED_FORMAT]: 'This operation does not support animated images.',
  
  [ImageToolErrorType.INVALID_RESIZE_DIMENSIONS]: 'Please enter valid width and height for resizing.',
  [ImageToolErrorType.RESIZE_OUTPUT_TOO_LARGE]: 'The output size would be too large. Please use smaller dimensions.',
  
  [ImageToolErrorType.INVALID_QUALITY]: 'Quality must be between 0 and 100.',
  [ImageToolErrorType.COMPRESSION_FAILED]: 'Image compression failed. Please try with a different format.',
  
  [ImageToolErrorType.INVALID_CROP_BOUNDS]: 'Crop coordinates are invalid.',
  [ImageToolErrorType.CROP_OUT_OF_RANGE]: 'Crop area must be within the image boundaries.',
  
  [ImageToolErrorType.INVALID_OPACITY]: 'Opacity value must be between 0 and 100.',
  [ImageToolErrorType.INVALID_WATERMARK_TEXT]: 'Watermark text is invalid.',
  [ImageToolErrorType.INVALID_WATERMARK_SCALE]: 'Watermark scale must be valid.',
  [ImageToolErrorType.INVALID_WATERMARK_POSITION]: 'Watermark position is invalid.',
  [ImageToolErrorType.TEXT_TOO_LONG]: 'Text is too long for watermark.',
  [ImageToolErrorType.INVALID_FONT_SIZE]: 'Font size must be valid.',
  
  [ImageToolErrorType.INVALID_GIF_FRAMES]: 'The GIF must have valid frames.',
  [ImageToolErrorType.INVALID_GIF_DURATION]: 'GIF duration is too long. Please select a shorter duration.',
  [ImageToolErrorType.GIF_TOO_LARGE]: 'The resulting GIF would be too large.',
  [ImageToolErrorType.GIF_FRAME_LIMIT_EXCEEDED]: 'Too many frames for GIF. Please reduce the number of frames.',
  
  [ImageToolErrorType.EMPTY_QR_TEXT]: 'Please enter text for the QR code.',
  [ImageToolErrorType.INVALID_QR_URL]: 'The URL is invalid or inaccessible.',
  [ImageToolErrorType.QR_TEXT_TOO_LONG]: 'Text is too long for QR code.',
  
  [ImageToolErrorType.OCR_FAILED]: 'Text recognition failed. Please try with a clearer image.',
  [ImageToolErrorType.IMAGE_TOO_BLURRY]: 'Image is too blurry for text recognition. Please provide a clearer image.',
  [ImageToolErrorType.INSUFFICIENT_RESOLUTION]: 'Image resolution is too low for text recognition.',
  [ImageToolErrorType.UNSUPPORTED_LANGUAGE]: 'The detected language is not supported for OCR.',
  
  [ImageToolErrorType.AI_PROCESSING_FAILED]: 'AI processing failed. Please try again or use a different image.',
  [ImageToolErrorType.INVALID_PROMPT]: 'The prompt is invalid.',
  [ImageToolErrorType.PROMPT_TOO_LONG]: 'Prompt is too long. Please use a shorter description.',
  [ImageToolErrorType.UNSUPPORTED_AI_FORMAT]: 'This image format is not supported for AI processing.',
  [ImageToolErrorType.AI_QUOTA_EXCEEDED]: 'AI processing quota exceeded. Please try again later.',
  
  [ImageToolErrorType.SHARP_FAILED]: 'Image processing failed. Please try with a different image.',
  [ImageToolErrorType.IMAGEMAGICK_FAILED]: 'Image processing failed. Please try with a different image.',
  [ImageToolErrorType.CANVAS_FAILED]: 'Image canvas processing failed. Please try again.',
  [ImageToolErrorType.PROCESSING_TIMEOUT]: 'Processing took too long. Please try with a smaller image.',
  [ImageToolErrorType.MEMORY_ERROR]: 'The server ran out of memory. Please try with a smaller image.',
  [ImageToolErrorType.DISK_SPACE_ERROR]: 'The server is out of disk space. Please try again later.',
  
  [ImageToolErrorType.NETWORK_ERROR]: 'Network connection error. Please check your internet and try again.',
  [ImageToolErrorType.UPLOAD_INTERRUPTED]: 'File upload was interrupted. Please try again.',
  [ImageToolErrorType.INVALID_URL]: 'The provided URL is invalid or inaccessible.',
  
  [ImageToolErrorType.API_ERROR]: 'An API error occurred. Please try again later.',
  [ImageToolErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred. Our team has been notified.',
};

/**
 * Image tool file size limits (in MB)
 */
export const IMAGE_TOOL_FILE_SIZE_LIMITS: Record<string, number> = {
  // Compression tools
  'compress-jpeg': 50,
  'compress-png': 50,
  'compress-webp': 50,
  'compress-image': 50,
  
  // Resize tools
  'resize-image': 50,
  'image-resizer': 50,
  
  // Crop tools
  'crop-image': 50,
  'image-cropper': 50,
  
  // Convert tools
  'jpg-to-png': 50,
  'png-to-jpg': 50,
  'webp-to-png': 50,
  'image-converter': 50,
  
  // Watermark tools
  'watermark-image': 50,
  'add-text-watermark': 50,
  'watermark-video': 50,
  
  // AI tools
  'background-remover': 50,
  'ai-image-upscaler': 50,
  'remove-background': 50,
  
  // GIF tools
  'create-gif': 100,
  'gif-maker': 100,
  'video-to-gif': 300,
  
  // QR/Barcode
  'qr-code-generator': 1,
  'barcode-generator': 1,
  
  // OCR
  'image-to-text': 50,
  'ocr-tool': 50,
  
  // Other tools
  'collage-maker': 100,
  'meme-generator': 50,
  'image-filter': 50,
  'image-editor': 50,
};

// Default max file size for image tools
export const IMAGE_DEFAULT_MAX_FILE_SIZE_MB = 50;

// Supported image formats
export const SUPPORTED_IMAGE_FORMATS = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', 
  '.svg', '.avif', '.heic', '.ico', '.tiff', '.tif'
];

export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'image/bmp', 'image/svg+xml', 'image/avif', 'image/heic',
  'image/x-icon', 'image/tiff'
];

// Image validation constraints
export const IMAGE_VALIDATION_CONSTRAINTS = {
  MAX_WIDTH: 16384, // Maximum pixel width
  MAX_HEIGHT: 16384, // Maximum pixel height
  MAX_MEGAPIXELS: 100, // Maximum megapixels (width * height)
  MIN_WIDTH: 1,
  MIN_HEIGHT: 1,
};

/**
 * Image error reporting exclusions
 */
export const IMAGE_ERROR_REPORTING_EXCLUSIONS = [
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
];
