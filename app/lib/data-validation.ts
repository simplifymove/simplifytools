/**
 * Data Conversion Validation
 * 
 * Validates file types, options, and request parameters
 */

import { getDataToolById } from './data-tools';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate file extension against accepted types
 */
export function validateFileType(
  filename: string,
  acceptedTypes: string[]
): boolean {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  return acceptedTypes.includes(ext);
}

/**
 * Validate file size (max 100MB)
 */
export function validateFileSize(
  sizeInBytes: number,
  maxSizeMB: number = 100
): ValidationResult {
  const maxBytes = maxSizeMB * 1024 * 1024;
  
  if (sizeInBytes > maxBytes) {
    return {
      valid: false,
      errors: [`File size exceeds ${maxSizeMB}MB limit`],
    };
  }
  
  return { valid: true, errors: [] };
}

/**
 * Validate tool exists and file is compatible
 */
export function validateToolAndFile(
  toolId: string,
  filename: string
): ValidationResult {
  const errors: string[] = [];
  
  const tool = getDataToolById(toolId);
  if (!tool) {
    errors.push(`Tool "${toolId}" not found`);
    return { valid: false, errors };
  }
  
  if (!validateFileType(filename, tool.accepts)) {
    errors.push(
      `File type not supported. Accepted types: ${tool.accepts.join(', ')}`
    );
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validate tool options
 */
export function validateToolOptions(
  toolId: string,
  options: Record<string, any>
): ValidationResult {
  const errors: string[] = [];
  
  const tool = getDataToolById(toolId);
  if (!tool) {
    errors.push(`Tool "${toolId}" not found`);
    return { valid: false, errors };
  }
  
  // Check required options
  for (const fieldDef of tool.options) {
    if (fieldDef.required && !options[fieldDef.name]) {
      errors.push(`Required option "${fieldDef.label}" is missing`);
    }
  }
  
  // Validate specific option types
  if (options.rowsPerFile && isNaN(parseInt(options.rowsPerFile))) {
    errors.push('Rows per file must be a number');
  }
  
  if (options.parts && isNaN(parseInt(options.parts))) {
    errors.push('Number of parts must be a number');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Sanitize filename for safe file operations
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}

/**
 * Generate output filename based on tool
 */
export function generateOutputFilename(
  toolId: string,
  inputFilename: string
): string | null {
  const tool = getDataToolById(toolId);
  if (!tool) return null;
  
  const baseName = inputFilename.split('.').slice(0, -1).join('.');
  const sanitized = sanitizeFilename(baseName);
  
  return sanitized + tool.output;
}

/**
 * Validate Excel file format by checking magic bytes
 */
export async function validateExcelFile(fileBuffer: Buffer, filename: string): Promise<boolean> {
  const ext = '.' + filename.split('.').pop()?.toLowerCase();
  
  // For .xlsx and .xlsm files, they are actually ZIP archives
  // They should start with PK (0x504B) magic bytes
  if (['.xlsx', '.xlsm', '.xlsb'].includes(ext)) {
    const header = fileBuffer.slice(0, 2);
    return header[0] === 0x50 && header[1] === 0x4b; // 'PK'
  }
  
  // For .xls files (old Excel), they start with 0xD0CF11E0 (OLE2 header)
  if (ext === '.xls') {
    const header = fileBuffer.slice(0, 4);
    return (
      header[0] === 0xd0 &&
      header[1] === 0xcf &&
      header[2] === 0x11 &&
      header[3] === 0xe0
    );
  }
  
  return true; // Other formats are allowed
}
