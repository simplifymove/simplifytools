/**
 * Enhanced File Validation for Video Tools
 * Comprehensive validation for uploads before processing
 */

import {
  VideoToolErrorType,
  ERROR_MESSAGES,
  FILE_SIZE_LIMITS,
  DEFAULT_MAX_FILE_SIZE_MB,
  ToolError,
} from '@/app/utils/types/errors';

/**
 * Validate file size with optional tool-specific limits
 */
export function validateFileSize(
  file: File,
  toolId?: string
): { valid: boolean; error?: string } {
  const maxSizeMB = toolId ? FILE_SIZE_LIMITS[toolId] ?? DEFAULT_MAX_FILE_SIZE_MB : DEFAULT_MAX_FILE_SIZE_MB;
  const sizeMB = file.size / (1024 * 1024);

  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `File size must be under ${maxSizeMB}MB. Current: ${sizeMB.toFixed(2)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Check if file is empty (0 bytes)
 */
export function validateNotEmpty(file: File): { valid: boolean; error?: string } {
  if (file.size === 0) {
    return {
      valid: false,
      error: ERROR_MESSAGES[VideoToolErrorType.EMPTY_FILE],
    };
  }
  return { valid: true };
}

/**
 * Validate file extension
 */
export function validateFileExtension(
  filename: string,
  acceptedExtensions: string[]
): { valid: boolean; error?: string } {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();

  if (!acceptedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File format not supported. Accepted: ${acceptedExtensions.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Validate MIME type matches file extension
 */
export function validateMimeType(
  file: File,
  acceptedExtensions: string[]
): { valid: boolean; error?: string } {
  const mimeTypeMap: Record<string, string[]> = {
    '.mp4': ['video/mp4', 'video/mpeg', 'application/octet-stream'],
    '.mov': ['video/quicktime'],
    '.avi': ['video/x-msvideo', 'application/x-avi'],
    '.mkv': ['video/x-matroska', 'application/x-matroska'],
    '.webm': ['video/webm'],
    '.flv': ['video/x-flv'],
    '.m4v': ['video/x-m4v', 'video/mp4'],
    '.mp3': ['audio/mpeg', 'audio/mp3'],
    '.wav': ['audio/wav'],
    '.aac': ['audio/aac'],
    '.flac': ['audio/flac'],
    '.m4a': ['audio/mp4', 'audio/m4a'],
    '.gif': ['image/gif'],
    '.srt': ['text/plain', 'application/x-subrip'],
    '.vtt': ['text/vtt', 'text/plain'],
  };

  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  const expectedMimes = mimeTypeMap[ext] || [];

  if (expectedMimes.length > 0 && !expectedMimes.includes(file.type)) {
    console.warn(
      `MIME type mismatch for ${file.name}: expected ${expectedMimes.join(', ')}, got ${file.type}`
    );
    // Don't fail on MIME type alone - file might still be valid
    // Some tools/browsers report different MIME types
  }

  return { valid: true };
}

/**
 * Validate it's actually a video file by checking magic bytes
 * Only works on client-side with proper FileReader permissions
 */
export async function validateVideoMagicBytes(
  file: File
): Promise<{ valid: boolean; error?: string; detectedType?: string }> {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();

      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(buffer.slice(0, 12));

        // Common video file signatures
        const signatures: Record<string, Uint8Array> = {
          mp4: new Uint8Array([0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70]), // ftyp
          mkv: new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]), // EBML
          webm: new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]), // EBML
          avi: new Uint8Array([0x52, 0x49, 0x46, 0x46]), // RIFF
          mov: new Uint8Array([0x00, 0x00, 0x00]), // Variable start
        };

        let detectedType = 'unknown';
        let isValid = false;

        // Check signatures
        if (
          bytes.slice(4, 8).every((v, i) => v === signatures.mp4[i]) ||
          bytes.slice(4, 8).every((v, i) => v === signatures.mp4[i + 4])
        ) {
          detectedType = 'mp4';
          isValid = true;
        } else if (bytes.slice(0, 4).every((v, i) => v === signatures.mkv[i])) {
          detectedType = 'mkv/webm';
          isValid = true;
        } else if (bytes.slice(0, 4).every((v, i) => v === signatures.avi[i])) {
          detectedType = bytes.slice(8, 12).every((v, i) => v === new Uint8Array([0x57, 0x41, 0x56, 0x45])[i]) ? 'wav' : 'avi';
          isValid = true;
        } else if (bytes.slice(0, 4).every((v, i) => v === new Uint8Array([0x4f, 0x67, 0x67, 0x53])[i])) {
          detectedType = 'ogg';
          isValid = true;
        } else if (bytes.slice(0, 4).every((v, i) => v === new Uint8Array([0x66, 0x4c, 0x61, 0x43])[i])) {
          detectedType = 'flac';
          isValid = true;
        } else if (bytes.slice(0, 3).every((v, i) => v === new Uint8Array([0x49, 0x44, 0x33])[i]) || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) {
          detectedType = file.name.toLowerCase().endsWith('.aac') ? 'aac' : 'mp3';
          isValid = true;
        } else if (bytes.slice(0, 4).every((v, i) => v === signatures.mov[i])) {
          detectedType = 'mov';
          isValid = true;
        }

        resolve({
          valid: isValid,
          error: !isValid ? ERROR_MESSAGES[VideoToolErrorType.FILE_CORRUPTED] : undefined,
          detectedType,
        });
      };

      reader.onerror = () => {
        resolve({
          valid: false,
          error: 'Could not read file',
        });
      };

      reader.readAsArrayBuffer(file.slice(0, 32));
    } catch (error) {
      resolve({
        valid: true, // Don't block on magic byte check failures
        error: undefined,
      });
    }
  });
}

/**
 * Comprehensive file validation
 */
export async function validateFile(
  file: File,
  acceptedExtensions: string[],
  toolId?: string
): Promise<{ valid: boolean; error?: string }> {
  // Check if file exists
  if (!file) {
    return {
      valid: false,
      error: 'Please select a file',
    };
  }

  // Check if not empty
  const emptyCheck = validateNotEmpty(file);
  if (!emptyCheck.valid) return emptyCheck;

  // Check file extension
  const extCheck = validateFileExtension(file.name, acceptedExtensions);
  if (!extCheck.valid) return extCheck;

  // Check file size
  const sizeCheck = validateFileSize(file, toolId);
  if (!sizeCheck.valid) return sizeCheck;

  // Check MIME type
  const mimeCheck = validateMimeType(file, acceptedExtensions);
  if (!mimeCheck.valid) return mimeCheck;

  // Check magic bytes (file signature)
  const magicCheck = await validateVideoMagicBytes(file);
  if (!magicCheck.valid) return magicCheck;

  return { valid: true };
}

/**
 * Validate URL format and accessibility
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const urlObj = new URL(url);

    // Check for common video hosting platforms
    const supportedHosts = [
      'youtube.com',
      'youtu.be',
      'vimeo.com',
      'instagram.com',
      'tiktok.com',
      'twitter.com',
      'facebook.com',
      'dailymotion.com',
    ];

    const isSupported = supportedHosts.some((host) =>
      urlObj.hostname.includes(host)
    );

    if (!isSupported) {
      return {
        valid: false,
        error: 'URL from unsupported platform. Try YouTube, Vimeo, Instagram, TikTok, etc.',
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: ERROR_MESSAGES[VideoToolErrorType.INVALID_URL],
    };
  }
}

/**
 * Validate time format (MM:SS or HH:MM:SS)
 */
export function validateTimeFormat(
  timeStr: string,
  maxSeconds?: number
): { valid: boolean; error?: string; seconds?: number } {
  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
  const match = timeStr.trim().match(timeRegex);

  if (!match) {
    return {
      valid: false,
      error: ERROR_MESSAGES[VideoToolErrorType.INVALID_TIME_FORMAT],
    };
  }

  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const seconds = match[3] ? parseInt(match[3]) : 0;

  // Validate ranges
  if (minutes > 59 || seconds > 59) {
    return {
      valid: false,
      error: 'Invalid time values (minutes and seconds must be 0-59)',
    };
  }

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  // Check against max duration if provided
  if (maxSeconds && totalSeconds > maxSeconds) {
    return {
      valid: false,
      error: `Time cannot exceed video duration (${Math.floor(maxSeconds / 3600)}:${Math.floor((maxSeconds % 3600) / 60).toString().padStart(2, '0')}:${(maxSeconds % 60).toString().padStart(2, '0')})`,
    };
  }

  return { valid: true, seconds: totalSeconds };
}
