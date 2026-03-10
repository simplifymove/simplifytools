import { PdfToolConfig } from './pdf-tools';

export interface PdfValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePdfInput(
  tool: PdfToolConfig,
  files: File[],
  url?: string
): PdfValidationResult {
  // Validate input mode
  if (tool.inputMode === 'url') {
    if (!url) {
      return { valid: false, error: 'URL is required' };
    }
    try {
      new URL(url);
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
    return { valid: true };
  }

  // Validate files
  if (!files || files.length === 0) {
    return { valid: false, error: 'No file selected' };
  }

  if (tool.inputMode === 'single-file' && files.length > 1) {
    return { valid: false, error: 'Only one file is allowed' };
  }

  // Check max file size (default 100MB)
  const maxSize = tool.maxFileSize || 100 * 1024 * 1024;
  for (const file of files) {
    if (file.size > maxSize) {
      const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
      return {
        valid: false,
        error: `File size exceeds ${maxMB}MB limit`,
      };
    }
  }

  // Check file extensions
  for (const file of files) {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!tool.accepts.includes(ext)) {
      const acceptedFormats = tool.accepts.join(', ');
      return {
        valid: false,
        error: `File format not supported. Accepted: ${acceptedFormats}`,
      };
    }
  }

  return { valid: true };
}
