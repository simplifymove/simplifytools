/**
 * Backend file security validation
 * Validates file signatures (magic bytes) and prevents spoofing attacks
 * Never trust file extensions - always verify actual file content
 */

export interface FileSecurityResult {
  valid: boolean;
  error?: string;
}

/**
 * PDF magic bytes: %PDF (0x25 0x50 0x44 0x46)
 * Valid PDF files MUST start with this signature
 */
const PDF_SIGNATURE = Buffer.from([0x25, 0x50, 0x44, 0x46]); // %PDF

/**
 * Image format signatures (magic bytes)
 */
const IMAGE_SIGNATURES = {
  jpg: [
    Buffer.from([0xFF, 0xD8, 0xFF]), // Standard JPEG
  ],
  jpeg: [
    Buffer.from([0xFF, 0xD8, 0xFF]), // Standard JPEG
  ],
  png: [
    Buffer.from([0x89, 0x50, 0x4E, 0x47]), // PNG
  ],
  tiff: [
    Buffer.from([0x49, 0x49, 0x2A, 0x00]), // TIFF (little-endian)
    Buffer.from([0x4D, 0x4D, 0x00, 0x2A]), // TIFF (big-endian)
  ],
  webp: [
    Buffer.from([0x52, 0x49, 0x46, 0x46]), // RIFF (WebP header)
  ],
  gif: [
    Buffer.from([0x47, 0x49, 0x46, 0x38]), // GIF87a or GIF89a
  ],
  heic: [
    Buffer.from([0x66, 0x74, 0x79, 0x70]), // ftyp (HEIC/HEIF container)
  ],
};

/**
 * Validate PDF file by checking actual file signature
 * Prevents attacks like renaming .exe or .bin files as .pdf
 */
export function validatePdfSignature(fileBuffer: Buffer): FileSecurityResult {
  if (!fileBuffer || fileBuffer.length < 4) {
    return {
      valid: false,
      error: 'PDF file is too small or empty. Please upload a valid PDF file.',
    };
  }

  // Check for PDF signature (must start with %PDF)
  const header = fileBuffer.slice(0, 4);
  if (!header.equals(PDF_SIGNATURE)) {
    // Check if it's a file type that looks like PDF but isn't
    const asciiHeader = header.toString('ascii', 0, 4);
    if (asciiHeader.includes('\x00')) {
      return {
        valid: false,
        error: 'File appears to be binary data, not a PDF. Please upload a valid PDF file.',
      };
    }
    return {
      valid: false,
      error: 'Invalid PDF file. The file does not have a valid PDF signature. Files renamed as .pdf are not supported.',
    };
  }

  return { valid: true };
}

/**
 * Validate image file by checking actual file signature
 * Supports: JPG, PNG, TIFF, WebP, GIF, HEIC
 */
export function validateImageSignature(
  fileBuffer: Buffer,
  extension: string
): FileSecurityResult {
  if (!fileBuffer || fileBuffer.length < 4) {
    return {
      valid: false,
      error: 'Image file is too small or empty. Please upload a valid image file.',
    };
  }

  const ext = extension.toLowerCase().replace(/^\./, '');

  // Special handling for WebP - need to check for RIFF + WebP
  if (ext === 'webp') {
    // WebP signature: RIFF at offset 0, WEBP at offset 8
    if (fileBuffer.length < 12) {
      return {
        valid: false,
        error: 'WebP file is too small. Please upload a valid WebP image.',
      };
    }

    const riffHeader = fileBuffer.slice(0, 4);
    const webpHeader = fileBuffer.slice(8, 12);

    if (riffHeader.toString('ascii') === 'RIFF' && webpHeader.toString('ascii') === 'WEBP') {
      return { valid: true };
    }

    return {
      valid: false,
      error: 'Invalid WebP file. The file does not have a valid WebP signature.',
    };
  }

  // Special handling for HEIC - check ftyp at offset 4
  if (ext === 'heic') {
    if (fileBuffer.length < 12) {
      return {
        valid: false,
        error: 'HEIC file is too small. Please upload a valid HEIC image.',
      };
    }

    const ftypHeader = fileBuffer.slice(4, 8);
    if (ftypHeader.toString('ascii') === 'ftyp') {
      return { valid: true };
    }

    return {
      valid: false,
      error: 'Invalid HEIC file. The file does not have a valid HEIC signature.',
    };
  }

  // Check standard image signatures
  const signatures = IMAGE_SIGNATURES[ext as keyof typeof IMAGE_SIGNATURES];
  if (!signatures) {
    return {
      valid: false,
      error: `Unsupported image format: ${ext}. Please upload JPG, PNG, TIFF, WebP, GIF, or HEIC.`,
    };
  }

  // Check if file matches any of the signatures for this format
  for (const sig of signatures) {
    if (fileBuffer.length >= sig.length) {
      const fileHeader = fileBuffer.slice(0, sig.length);
      if (fileHeader.equals(sig)) {
        return { valid: true };
      }
    }
  }

  return {
    valid: false,
    error: `Invalid ${ext.toUpperCase()} file. The file does not have a valid ${ext.toUpperCase()} signature. Files renamed from other formats are not supported.`,
  };
}

/**
 * Validate if PDF is corrupted by checking basic structure
 * Looks for PDF objects and cross-reference table
 */
export function validatePdfStructure(fileBuffer: Buffer): FileSecurityResult {
  if (!fileBuffer || fileBuffer.length < 8) {
    return {
      valid: false,
      error: 'PDF file is too small. Please upload a valid PDF file.',
    };
  }

  const content = fileBuffer.toString('ascii', 0, Math.min(fileBuffer.length, 10000));

  // Check for basic PDF structure markers
  // - %PDF at start (already checked in signature)
  // - At least one object definition (%obj)
  // - EOF marker at end or near end
  if (!content.includes('obj') && !content.includes('stream')) {
    return {
      valid: false,
      error: 'PDF structure is invalid or corrupted. The file appears to be damaged or incomplete.',
    };
  }

  // Check for EOF (end-of-file) marker near end of file
  const lastKb = fileBuffer.toString('ascii', Math.max(0, fileBuffer.length - 1024));
  if (!lastKb.includes('%%EOF') && !lastKb.includes('%%eof')) {
    // Some PDFs may not have EOF, but this is a good sign of corruption
    // Only flag if file seems truncated
    if (fileBuffer.length < 1024) {
      return {
        valid: false,
        error: 'PDF appears to be truncated or incomplete. Please upload a complete PDF file.',
      };
    }
  }

  return { valid: true };
}

/**
 * Validate file count limit
 * Prevents abuse by uploading too many files at once
 */
export function validateFileCount(
  fileCount: number,
  maxFiles: number = 50
): FileSecurityResult {
  if (fileCount === 0) {
    return { valid: false, error: 'No files provided.' };
  }

  if (fileCount > maxFiles) {
    return {
      valid: false,
      error: `Too many files. Maximum ${maxFiles} files allowed per request. You submitted ${fileCount} files.`,
    };
  }

  return { valid: true };
}

/**
 * Validate total size of all files combined
 * Prevents DoS attacks with extremely large files
 */
export function validateTotalFileSize(
  totalBytes: number,
  maxTotalBytes: number = 500 * 1024 * 1024 // 500MB default
): FileSecurityResult {
  if (totalBytes <= 0) {
    return { valid: false, error: 'Invalid file size.' };
  }

  if (totalBytes > maxTotalBytes) {
    const maxMB = Math.round(maxTotalBytes / (1024 * 1024));
    const submittedMB = Math.round(totalBytes / (1024 * 1024));
    return {
      valid: false,
      error: `Total file size exceeds ${maxMB}MB limit. You submitted ${submittedMB}MB. Please compress files or upload fewer files.`,
    };
  }

  return { valid: true };
}

/**
 * Check if file is suspiciously small
 * Some attacks use minimal valid files to exploit processing logic
 */
export function validateFileMinimumSize(
  fileBuffer: Buffer,
  minBytes: number = 100
): FileSecurityResult {
  if (fileBuffer.length < minBytes) {
    return {
      valid: false,
      error: 'File is too small or appears to be empty. Please upload a complete file with content.',
    };
  }

  return { valid: true };
}

/**
 * Validate that image files are not corrupted PDFs with wrong extension
 * (e.g., a PDF renamed as .jpg)
 */
export function validateImageNotPdf(fileBuffer: Buffer): FileSecurityResult {
  if (fileBuffer.length >= 4) {
    const header = fileBuffer.slice(0, 4);
    if (header.equals(PDF_SIGNATURE)) {
      return {
        valid: false,
        error: 'File is a PDF but was uploaded as an image. Please upload the correct file format.',
      };
    }
  }

  return { valid: true };
}

/**
 * Validate that PDF files are not images with wrong extension
 * (e.g., a JPG renamed as .pdf)
 */
export function validatePdfNotImage(fileBuffer: Buffer): FileSecurityResult {
  if (fileBuffer.length >= 3) {
    // Check for common image signatures
    const header = fileBuffer.slice(0, 4);

    // Check JPEG
    if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
      return {
        valid: false,
        error: 'File is a JPG image but was uploaded as PDF. Please upload the correct file format.',
      };
    }

    // Check PNG
    if (header.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))) {
      return {
        valid: false,
        error: 'File is a PNG image but was uploaded as PDF. Please upload the correct file format.',
      };
    }

    // Check GIF
    if (header.toString('ascii', 0, 3) === 'GIF') {
      return {
        valid: false,
        error: 'File is a GIF image but was uploaded as PDF. Please upload the correct file format.',
      };
    }
  }

  return { valid: true };
}
