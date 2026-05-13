/**
 * Tool-Specific Validation Functions
 * Each video tool has unique validation requirements
 */

import { VideoToolErrorType, ERROR_MESSAGES } from '@/app/utils/types/errors';
import { validateTimeFormat } from '@/app/utils/validation/file-validation';

export interface ToolValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate trim video options
 * Start time must be less than end time, both must be less than duration
 */
export function validateTrimVideoOptions(options: {
  startTime?: string;
  endTime?: string;
  duration?: number;
}): ToolValidationResult {
  const errors: string[] = [];

  if (!options.startTime) {
    errors.push('Start time is required');
  }
  if (!options.endTime) {
    errors.push('End time is required');
  }

  if (options.startTime) {
    const startCheck = validateTimeFormat(options.startTime, options.duration);
    if (!startCheck.valid) errors.push(startCheck.error || 'Invalid start time');
  }

  if (options.endTime) {
    const endCheck = validateTimeFormat(options.endTime, options.duration);
    if (!endCheck.valid) errors.push(endCheck.error || 'Invalid end time');
  }

  // Check if both times are valid and start < end
  if (options.startTime && options.endTime) {
    const startMatch = options.startTime.match(/(\d+):(\d+)(?::(\d+))?/);
    const endMatch = options.endTime.match(/(\d+):(\d+)(?::(\d+))?/);

    if (startMatch && endMatch) {
      const startSeconds =
        parseInt(startMatch[1]) * 3600 + parseInt(startMatch[2]) * 60 + (parseInt(startMatch[3]) || 0);
      const endSeconds =
        parseInt(endMatch[1]) * 3600 + parseInt(endMatch[2]) * 60 + (parseInt(endMatch[3]) || 0);

      if (startSeconds >= endSeconds) {
        errors.push(ERROR_MESSAGES[VideoToolErrorType.START_TIME_GREATER_THAN_END]);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate resize video options
 * Width and height must be valid, positive numbers within reasonable ranges
 */
export function validateResizeVideoOptions(options: {
  width?: number | string;
  height?: number | string;
}): ToolValidationResult {
  const errors: string[] = [];

  const width = typeof options.width === 'string' ? parseInt(options.width) : options.width;
  const height = typeof options.height === 'string' ? parseInt(options.height) : options.height;

  if (!width || !height) {
    errors.push('Width and height are required');
  }

  if (width && (width < 160 || width > 7680)) {
    errors.push('Width must be between 160 and 7680 pixels');
  }

  if (height && (height < 120 || height > 4320)) {
    errors.push('Height must be between 120 and 4320 pixels');
  }

  if (width === 0 || height === 0) {
    errors.push(ERROR_MESSAGES[VideoToolErrorType.ZERO_DIMENSIONS]);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate merge video options
 * Requires minimum 2 video files
 */
export function validateMergeVideosOptions(files: File[]): ToolValidationResult {
  const errors: string[] = [];

  if (!files || files.length === 0) {
    errors.push('Please select at least 2 video files');
  } else if (files.length < 2) {
    errors.push(ERROR_MESSAGES[VideoToolErrorType.INSUFFICIENT_FILES]);
  }

  // Validate each file
  files.forEach((file, index) => {
    if (!file.name) {
      errors.push(`File ${index + 1} is invalid`);
    }
  });

  return { valid: errors.length === 0, errors };
}

/**
 * Validate video to GIF options
 * Duration should be reasonable for GIF (max 10-15 seconds recommended)
 */
export function validateVideoToGifOptions(options: {
  startTime?: string;
  duration?: string;
  framerate?: number | string;
}): ToolValidationResult {
  const errors: string[] = [];

  // Validate duration if provided
  if (options.duration) {
    const durationSeconds = parseInt(options.duration);
    if (durationSeconds > 30) {
      errors.push(
        'GIF duration should be 30 seconds or less to avoid large file sizes. Consider splitting longer videos.'
      );
    }
    if (durationSeconds < 1) {
      errors.push('Duration must be at least 1 second');
    }
  }

  // Validate framerate
  const framerate = typeof options.framerate === 'string' ? parseInt(options.framerate) : options.framerate;
  if (framerate && (framerate < 1 || framerate > 60)) {
    errors.push('Frame rate must be between 1 and 60 fps');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate compress video options
 * Bitrate must be reasonable, compression level must be valid
 */
export function validateCompressVideoOptions(options: {
  quality?: string;
  bitrate?: string;
  preset?: string;
}): ToolValidationResult {
  const errors: string[] = [];

  // Validate quality
  if (options.quality) {
    const validQualities = ['low', 'medium', 'high', 'very_high'];
    if (!validQualities.includes(options.quality)) {
      errors.push('Invalid quality setting');
    }
  }

  // Validate bitrate if provided
  if (options.bitrate) {
    const bitrate = parseInt(options.bitrate);
    if (isNaN(bitrate) || bitrate < 64 || bitrate > 50000) {
      errors.push('Bitrate must be between 64 and 50000 kbps');
    }
  }

  // Validate preset
  if (options.preset) {
    const validPresets = ['fast', 'medium', 'slow'];
    if (!validPresets.includes(options.preset)) {
      errors.push('Invalid compression preset');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate add subtitles options
 * File must be .srt or .vtt format
 */
export function validateAddSubtitlesOptions(subtitleFile: File | null): ToolValidationResult {
  const errors: string[] = [];

  if (!subtitleFile) {
    errors.push('Please select a subtitle file');
    return { valid: false, errors };
  }

  const ext = '.' + subtitleFile.name.split('.').pop()?.toLowerCase();
  const validFormats = ['.srt', '.vtt', '.ass', '.ssa'];

  if (!validFormats.includes(ext)) {
    errors.push(
      ERROR_MESSAGES[VideoToolErrorType.INVALID_SUBTITLE_FORMAT]
    );
  }

  if (subtitleFile.size === 0) {
    errors.push('Subtitle file is empty');
  }

  if (subtitleFile.size > 50 * 1024 * 1024) {
    // 50MB limit for subtitle files
    errors.push('Subtitle file must be smaller than 50MB');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate watermark video options
 * Position, opacity, scale must be valid ranges
 */
export function validateWatermarkVideoOptions(options: {
  opacity?: number | string;
  scale?: number | string;
  position?: string;
  watermarkFile?: File;
}): ToolValidationResult {
  const errors: string[] = [];

  // Validate watermark file
  if (options.watermarkFile) {
    const ext = '.' + options.watermarkFile.name.split('.').pop()?.toLowerCase();
    const validFormats = ['.png', '.jpg', '.jpeg', '.gif'];

    if (!validFormats.includes(ext)) {
      errors.push(ERROR_MESSAGES[VideoToolErrorType.INVALID_WATERMARK_FORMAT]);
    }

    if (options.watermarkFile.size > 10 * 1024 * 1024) {
      // 10MB limit
      errors.push('Watermark image must be smaller than 10MB');
    }
  }

  // Validate opacity
  if (options.opacity !== undefined) {
    const opacity = typeof options.opacity === 'string' ? parseFloat(options.opacity) : options.opacity;
    if (isNaN(opacity) || opacity < 0 || opacity > 100) {
      errors.push(ERROR_MESSAGES[VideoToolErrorType.INVALID_OPACITY]);
    }
  }

  // Validate scale
  if (options.scale !== undefined) {
    const scale = typeof options.scale === 'string' ? parseFloat(options.scale) : options.scale;
    if (isNaN(scale) || scale < 0.1 || scale > 1) {
      errors.push('Scale must be between 0.1 and 1.0');
    }
  }

  // Validate position
  if (options.position) {
    const validPositions = ['top-left', 'top-center', 'top-right', 'center-left', 'center', 'center-right', 'bottom-left', 'bottom-center', 'bottom-right'];
    if (!validPositions.includes(options.position)) {
      errors.push('Invalid watermark position');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate crop video options
 * Crop dimensions must be valid and within video dimensions
 */
export function validateCropVideoOptions(options: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  videoWidth?: number;
  videoHeight?: number;
}): ToolValidationResult {
  const errors: string[] = [];

  const x = typeof options.x === 'string' ? parseInt(options.x) : options.x || 0;
  const y = typeof options.y === 'string' ? parseInt(options.y) : options.y || 0;
  const width = typeof options.width === 'string' ? parseInt(options.width) : options.width;
  const height = typeof options.height === 'string' ? parseInt(options.height) : options.height;

  if (!width || !height) {
    errors.push('Crop width and height are required');
  }

  if (width && width <= 0) {
    errors.push('Crop width must be greater than 0');
  }

  if (height && height <= 0) {
    errors.push('Crop height must be greater than 0');
  }

  if (options.videoWidth && options.videoHeight) {
    if (x + (width || 0) > options.videoWidth) {
      errors.push('Crop width extends beyond video width');
    }
    if (y + (height || 0) > options.videoHeight) {
      errors.push('Crop height extends beyond video height');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate change video speed options
 * Speed multiplier must be reasonable (0.25x to 4x)
 */
export function validateChangeVideoSpeedOptions(options: {
  speed?: number | string;
}): ToolValidationResult {
  const errors: string[] = [];

  if (options.speed === undefined) {
    errors.push('Please specify a speed value');
  } else {
    const speed = typeof options.speed === 'string' ? parseFloat(options.speed) : options.speed;
    if (isNaN(speed) || speed < 0.25 || speed > 4) {
      errors.push('Speed must be between 0.25x (slowest) and 4x (fastest)');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate rotate video options
 * Rotation angle must be valid (0, 90, 180, 270)
 */
export function validateRotateVideoOptions(options: {
  angle?: number | string;
}): ToolValidationResult {
  const errors: string[] = [];

  if (options.angle === undefined) {
    errors.push('Please specify a rotation angle');
  } else {
    const angle = typeof options.angle === 'string' ? parseInt(options.angle) : options.angle;
    const validAngles = [0, 90, 180, 270];

    if (!validAngles.includes(angle)) {
      errors.push('Rotation angle must be 0°, 90°, 180°, or 270°');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate extract audio options
 * Output format must be supported
 */
export function validateExtractAudioOptions(options: {
  outputFormat?: string;
  audioQuality?: string;
}): ToolValidationResult {
  const errors: string[] = [];

  if (options.outputFormat) {
    const validFormats = ['mp3', 'wav', 'aac', 'flac'];
    if (!validFormats.includes(options.outputFormat)) {
      errors.push('Invalid audio output format');
    }
  }

  if (options.audioQuality) {
    const validQualities = ['low', 'medium', 'high'];
    if (!validQualities.includes(options.audioQuality)) {
      errors.push('Invalid audio quality');
    }
  }

  return { valid: errors.length === 0, errors };
}
