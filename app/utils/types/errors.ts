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
  type: VideoToolErrorType;
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
  errorType: VideoToolErrorType;
  errorMessage: string;
  userMessage: string;
  url: string;
  timestamp: string;
  fileMeta?: {
    filename: string;
    size: string;
    mimeType: string;
    duration?: string;
  };
  systemInfo?: {
    userAgent: string;
    platform: string;
    isLoggedIn?: boolean;
  };
  stackTrace?: string;
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
