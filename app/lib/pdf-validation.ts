import { PdfToolConfig } from './pdf-tools';

export interface PdfValidationResult {
  valid: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * SHARED VALIDATION HELPERS
 * Reusable across all PDF tools
 */

export function validatePdfFile(file: File): PdfValidationResult {
  if (!file) {
    return { valid: false, error: 'Please upload a PDF file.' };
  }

  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (ext.toLowerCase() !== '.pdf') {
    return { valid: false, error: 'Only PDF files are supported. Please upload a valid PDF.' };
  }

  // Check if file is empty
  if (file.size === 0) {
    return { valid: false, error: 'The uploaded PDF file is empty. Please upload a valid PDF with content.' };
  }

  // Check file size (default 100MB)
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
    return { valid: false, error: `File size exceeds ${maxMB}MB limit. Please compress or split the PDF.` };
  }

  return { valid: true };
}

export function validateImageFiles(files: File[], allowedFormats = ['jpg', 'jpeg', 'png', 'tiff', 'tif', 'webp', 'gif', 'heic']): PdfValidationResult {
  if (!files || files.length === 0) {
    return { valid: false, error: 'Please upload at least one image file.' };
  }

  for (const file of files) {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isAllowed = allowedFormats.some(fmt => ext === `.${fmt.toLowerCase()}`);
    
    if (!isAllowed) {
      const formats = allowedFormats.map(f => f.toUpperCase()).join(', ');
      return { valid: false, error: `File "${file.name}" is not a supported image format. Supported: ${formats}` };
    }

    if (file.size === 0) {
      return { valid: false, error: `File "${file.name}" is empty. Please upload valid image files.` };
    }

    // Check image file size (50MB per image)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
      return { valid: false, error: `File "${file.name}" exceeds ${maxMB}MB limit. Please compress the image.` };
    }
  }

  return { valid: true };
}

export function validatePageRange(rangeStr: string, totalPages: number): PdfValidationResult {
  if (!rangeStr || rangeStr.trim() === '') {
    return { valid: true }; // Empty range is valid (means all pages)
  }

  const trimmed = rangeStr.trim();
  const parts = trimmed.split(',');
  const validPages = new Set<number>();

  for (const part of parts) {
    const p = part.trim();
    
    // Check for range format (e.g., "1-5")
    if (p.includes('-')) {
      const [startStr, endStr] = p.split('-');
      const start = parseInt(startStr.trim());
      const end = parseInt(endStr.trim());

      if (isNaN(start) || isNaN(end)) {
        return { valid: false, error: `Invalid page range format: "${p}". Use format like "1-5" or "1,3,5".` };
      }

      if (start < 1 || end < 1) {
        return { valid: false, error: 'Page numbers must start from 1 (not 0).Page numbers must be positive integers.' };
      }

      if (start > end) {
        return { valid: false, error: `Invalid range: "${p}". Start page (${start}) must be less than or equal to end page (${end}).` };
      }

      if (end > totalPages) {
        return { valid: false, error: `Invalid range: page ${end} exceeds total pages (${totalPages}).` };
      }

      for (let i = start; i <= end; i++) {
        validPages.add(i);
      }
    } else {
      // Single page number
      const pageNum = parseInt(p);

      if (isNaN(pageNum)) {
        return { valid: false, error: `Invalid page number: "${p}". Use numbers like "1", "3", or ranges like "1-5".` };
      }

      if (pageNum < 1) {
        return { valid: false, error: 'Page numbers must be positive integers starting from 1 (not 0).' };
      }

      if (pageNum > totalPages) {
        return { valid: false, error: `Page ${pageNum} exceeds total pages (${totalPages}).` };
      }

      validPages.add(pageNum);
    }
  }

  return { valid: true };
}

export function validatePageList(listStr: string, totalPages: number): PdfValidationResult {
  if (!listStr || listStr.trim() === '') {
    return { valid: false, error: 'Please provide at least one page number.' };
  }

  const trimmed = listStr.trim();
  const parts = trimmed.split(/[,;\s]+/).filter(p => p.length > 0);
  
  if (parts.length === 0) {
    return { valid: false, error: 'Please provide at least one page number.' };
  }

  const validPages = new Set<number>();

  for (const part of parts) {
    // Check for range format (e.g., "1-5")
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr.trim());
      const end = parseInt(endStr.trim());

      if (isNaN(start) || isNaN(end)) {
        return { valid: false, error: `Invalid format: "${part}". Use page numbers like "1,3,5" or ranges like "1-5".` };
      }

      if (start < 1 || end < 1) {
        return { valid: false, error: 'Page numbers start from 1 (not 0).' };
      }

      if (start > end) {
        return { valid: false, error: `Invalid range: start (${start}) cannot be greater than end (${end}).` };
      }

      if (end > totalPages) {
        return { valid: false, error: `Page ${end} exceeds total pages (${totalPages}).` };
      }

      for (let i = start; i <= end; i++) {
        validPages.add(i);
      }
    } else {
      const pageNum = parseInt(part);

      if (isNaN(pageNum)) {
        return { valid: false, error: `Invalid page number: "${part}". Use format like "1,3,5" or "1-5".` };
      }

      if (pageNum < 1) {
        return { valid: false, error: 'Page numbers start from 1 (not 0).' };
      }

      if (pageNum > totalPages) {
        return { valid: false, error: `Page ${pageNum} exceeds total PDF pages (${totalPages}).` };
      }

      validPages.add(pageNum);
    }
  }

  return { valid: true };
}

export function validatePassword(password: string, minLength = 1): PdfValidationResult {
  if (!password || password.trim() === '') {
    return { valid: false, error: 'Password is required.' };
  }

  if (password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters long.` };
  }

  return { valid: true };
}

export function validatePositiveInteger(value: string | number, fieldName = 'Value'): PdfValidationResult {
  const num = typeof value === 'string' ? parseInt(value) : value;

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a valid number.` };
  }

  if (num < 1) {
    return { valid: false, error: `${fieldName} must be greater than 0.` };
  }

  return { valid: true };
}

/**
 * MAIN VALIDATION FUNCTION
 * Validates tool input based on tool configuration and tool-specific rules
 */

export function validatePdfInput(
  tool: PdfToolConfig,
  files: File[],
  url?: string,
  options?: Record<string, any>
): PdfValidationResult {
  // Validate input mode
  if (tool.inputMode === 'url') {
    if (!url || url.trim() === '') {
      return { valid: false, error: 'Please enter a website URL.' };
    }
    try {
      new URL(url);
    } catch {
      return { valid: false, error: 'Invalid URL format. Please enter a valid website URL (e.g., https://example.com).' };
    }
    return { valid: true };
  }

  // Validate files for file-based input modes
  if (!files || files.length === 0) {
    const fileType = tool.accepts.includes('.pdf') ? 'PDF file' : 'file';
    return { valid: false, error: `Please upload a ${fileType}.` };
  }

  // Tool-specific validation
  const toolValidation = validateToolSpecific(tool, files, options);
  if (!toolValidation.valid) {
    return toolValidation;
  }

  // Validate file count
  if (tool.inputMode === 'single-file' && files.length > 1) {
    return { valid: false, error: 'Please upload only one file. This tool processes one PDF at a time.' };
  }

  if (tool.inputMode === 'multi-file' && tool.id === 'merge-pdf' && files.length < 2) {
    return { valid: false, error: 'Please upload at least 2 PDF files to merge.' };
  }

  // Validate file formats and sizes
  if (tool.accepts.includes('.pdf')) {
    for (const file of files) {
      const pdfValidation = validatePdfFile(file);
      if (!pdfValidation.valid) {
        return pdfValidation;
      }
    }
  } else if (tool.accepts.some(ext => ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.webp', '.gif', '.heic'].includes(ext))) {
    const imageValidation = validateImageFiles(files, tool.accepts.map(ext => ext.substring(1)));
    if (!imageValidation.valid) {
      return imageValidation;
    }
  } else {
    // Generic file validation for other types
    for (const file of files) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!tool.accepts.includes(ext)) {
        const acceptedFormats = tool.accepts.join(', ');
        return { valid: false, error: `File format not supported. Please upload: ${acceptedFormats}` };
      }

      if (file.size === 0) {
        return { valid: false, error: `File "${file.name}" is empty.Please upload a valid file.` };
      }

      const maxSize = tool.maxFileSize || 100 * 1024 * 1024;
      if (file.size > maxSize) {
        const maxMB = (maxSize / (1024 * 1024)).toFixed(0);
        return { valid: false, error: `File size exceeds ${maxMB}MB limit.` };
      }
    }
  }

  return { valid: true };
}

/**
 * TOOL-SPECIFIC VALIDATION
 * Validates tool-specific requirements and options
 */

function validateToolSpecific(
  tool: PdfToolConfig,
  files: File[],
  options?: Record<string, any>
): PdfValidationResult {
  options = options || {};

  switch (tool.id) {
    case 'merge-pdf':
      if (files.length < 2) {
        return { valid: false, error: 'Please upload at least 2 PDF files to merge.' };
      }
      return { valid: true };

    case 'split-pdf': {
      const mode = options?.mode || 'all';
      if (mode === 'range') {
        const pageRange = options?.pageRange;
        if (!pageRange || pageRange.trim() === '') {
          return { valid: false, error: 'Please enter a page range (e.g., "1-5" or "1,3,5").' };
        }
        // Note: Full validation requires page count which we get from PDF
        return { valid: true };
      }
      return { valid: true };
    }

    case 'rotate-pdf': {
      const angle = options?.angle;
      if (angle === undefined) {
        return { valid: false, error: 'Please select a rotation angle.' };
      }
      // Handle both string and number values from form
      const angleNum = typeof angle === 'string' ? parseInt(angle, 10) : angle;
      if (isNaN(angleNum) || ![90, 180, 270].includes(angleNum)) {
        return { valid: false, error: 'Rotation angle must be 90, 180, or 270 degrees.' };
      }
      return { valid: true };
    }

    case 'rearrange-pdf':
      if (!options?.pageOrder || (Array.isArray(options.pageOrder) && options.pageOrder.length === 0)) {
        return { valid: false, error: 'Please arrange the PDF pages before submitting.' };
      }
      return { valid: true };

    case 'crop-pdf':
      return { valid: true };

    case 'pdf-page-deleter': {
      const pagesToDelete = options?.pagesToDelete;
      if (!pagesToDelete || pagesToDelete.trim() === '') {
        return { valid: false, error: 'Please enter the pages to delete (e.g., "1,3,5" or "2-4").' };
      }
      return { valid: true };
    }

    case 'create-pdf': {
      const numPages = options?.numPages || 0;
      const hasImages = files && files.length > 0;
      if (!hasImages && numPages < 1) {
        return { valid: false, error: 'Please upload at least one image OR enter a number of blank pages.' };
      }
      if (numPages > 0) {
        const pagesValidation = validatePositiveInteger(numPages, 'Number of blank pages');
        if (!pagesValidation.valid) {
          return pagesValidation;
        }
      }
      return { valid: true };
    }

    case 'protect-pdf': {
      const userPassword = options?.userPassword;
      if (!userPassword || userPassword.trim() === '') {
        return { valid: false, error: 'Please enter a password to protect the PDF.' };
      }
      return { valid: true };
    }

    case 'unlock-pdf': {
      const password = options?.password;
      if (!password || password.trim() === '') {
        return { valid: false, error: 'Please enter the PDF password.' };
      }
      return { valid: true };
    }

    case 'pdf-watermark-remover':
      return { valid: true };

    case 'pdf-to-jpg':
    case 'pdf-to-png':
    case 'pdf-to-tiff':
      return { valid: true };

    case 'jpg-to-pdf':
    case 'png-to-pdf':
    case 'tiff-to-pdf':
    case 'webp-to-pdf':
    case 'gif-to-pdf':
    case 'heic-to-pdf':
    case 'eps-to-pdf':
    case 'images-to-pdf':
      if (!files || files.length === 0) {
        return { valid: false, error: 'Please upload at least one image file.' };
      }
      return { valid: true };

    default:
      return { valid: true };
  }
}

