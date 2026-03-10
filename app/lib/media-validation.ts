import { VideoTool } from './video-tools';

export interface MediaValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFileExtension(
  filename: string,
  acceptedExtensions: string[]
): MediaValidationResult {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  if (!acceptedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File type not supported. Accepted: ${acceptedExtensions.join(', ')}`,
    };
  }
  return { valid: true };
}

export function validateFileSize(
  file: File,
  maxSizeMB: number = 500
): MediaValidationResult {
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `File size must be under ${maxSizeMB}MB. Current: ${sizeMB.toFixed(2)}MB`,
    };
  }
  return { valid: true };
}

export function validateUrl(url: string): MediaValidationResult {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'Invalid URL format',
    };
  }
}

export function validateTime(timeStr: string): MediaValidationResult {
  const timeRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
  const match = timeStr.match(timeRegex);
  
  if (!match) {
    return {
      valid: false,
      error: 'Invalid time format. Use MM:SS or HH:MM:SS',
    };
  }

  const hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const seconds = match[3] ? parseInt(match[3]) : 0;

  if (hours > 23 || minutes > 59 || seconds > 59) {
    return {
      valid: false,
      error: 'Invalid time values',
    };
  }

  return { valid: true };
}

export function validateToolInput(
  tool: VideoTool,
  input: { file?: File; url?: string }
): MediaValidationResult {
  if (tool.inputMethod === 'file' || tool.inputMethod === 'both') {
    if (!input.file) {
      return {
        valid: false,
        error: 'File is required',
      };
    }

    const extValidation = validateFileExtension(
      input.file.name,
      tool.accepts
    );
    if (!extValidation.valid) {
      return extValidation;
    }

    const sizeValidation = validateFileSize(input.file);
    if (!sizeValidation.valid) {
      return sizeValidation;
    }
  }

  if (tool.inputMethod === 'url' || tool.inputMethod === 'both') {
    if (!input.url) {
      return {
        valid: false,
        error: 'URL is required',
      };
    }

    const urlValidation = validateUrl(input.url);
    if (!urlValidation.valid) {
      return urlValidation;
    }
  }

  return { valid: true };
}
