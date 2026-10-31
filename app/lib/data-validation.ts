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
  
  // Validate Split CSV options before invoking Python.
  if (toolId === 'split-csv') {
    const mode = options.split_mode ?? 'by_rows';
    const delimiter = options.delimiter ?? 'comma';

    if (!['by_rows', 'by_parts', 'by_column_value'].includes(mode)) {
      errors.push('Split Mode must be by rows, by parts, or by column value');
    }

    if (!['comma', 'semicolon', 'tab'].includes(delimiter)) {
      errors.push('Delimiter must be comma, semicolon, or tab');
    }

    if (mode === 'by_rows') {
      const rows = options.rows_per_file ?? options.rowsPerFile ?? 1000;

      if (
        (typeof rows !== 'number' && typeof rows !== 'string') ||
        String(rows).trim() === '' ||
        !Number.isSafeInteger(Number(rows)) ||
        Number(rows) < 1
      ) {
        errors.push('Rows Per File must be a positive whole number');
      }
    }

    if (mode === 'by_parts') {
      const parts = options.num_parts ?? options.parts ?? options.numParts ?? 2;

      if (
        (typeof parts !== 'number' && typeof parts !== 'string') ||
        String(parts).trim() === '' ||
        !Number.isSafeInteger(Number(parts)) ||
        Number(parts) < 2
      ) {
        errors.push('Number of Parts must be a whole number of at least 2');
      }
    }

    if (mode === 'by_column_value') {
      const column = options.column_name ?? options.columnName;

      if (typeof column !== 'string' || !column.trim()) {
        errors.push('Column Name is required for column-value splitting');
      }
    }
  }

  // Validate Split Excel settings before invoking Python.
  if (toolId === 'split-excel') {
    const mode = options.split_mode ?? 'by_sheet';

    if (!['by_sheet', 'by_rows', 'by_parts'].includes(mode)) {
      errors.push('Split Mode must be by sheet, by rows, or by parts');
    }

    if (mode === 'by_rows') {
      const rows = options.rows_per_file ?? options.rowsPerFile ?? 1000;

      if (
        (typeof rows !== 'number' && typeof rows !== 'string') ||
        String(rows).trim() === '' ||
        !Number.isSafeInteger(Number(rows)) ||
        Number(rows) < 1
      ) {
        errors.push('Rows Per File must be a positive whole number');
      }
    }

    if (mode === 'by_parts') {
      const parts = options.num_parts ?? options.parts ?? 2;

      if (
        (typeof parts !== 'number' && typeof parts !== 'string') ||
        String(parts).trim() === '' ||
        !Number.isSafeInteger(Number(parts)) ||
        Number(parts) < 2
      ) {
        errors.push('Number of Parts must be a whole number of at least 2');
      }
    }
  }

  // Validate CSV-to-Excel settings before invoking Python.
  if (toolId === 'csv-to-excel') {
    const sheetName = options.sheetName ?? 'Data';
    const encoding = options.encoding ?? 'utf-8';
    const autoSize = options.autoSize ?? true;

    if (
      typeof sheetName !== 'string' ||
      !sheetName.trim() ||
      sheetName.length > 31 ||
      Array.from(sheetName).some(char => '[]:*?/\\'.includes(char)) ||
      sheetName.startsWith("'") ||
      sheetName.endsWith("'")
    ) {
      errors.push(
        'Worksheet name must be 1 to 31 characters and cannot contain Excel-invalid characters'
      );
    }

    if (
      typeof encoding !== 'string' ||
      !['utf-8', 'latin-1', 'iso-8859-1', 'cp1252'].includes(encoding)
    ) {
      errors.push('Unsupported CSV encoding');
    }

    if (typeof autoSize !== 'boolean') {
      errors.push('Auto-size Columns must be true or false');
    }
  }

  // Validate Excel-to-PDF options before invoking Python.
  if (toolId === 'excel-to-pdf') {
    const sheetMode = options.sheetMode ?? options.sheet_mode ?? 'first';
    const orientation = options.orientation ?? 'portrait';
    const fitToWidth = options.fitToWidth ?? options.fit_to_width ?? true;

    if (!['first', 'all'].includes(sheetMode)) {
      errors.push('Sheets to Export must be first or all');
    }

    if (!['portrait', 'landscape'].includes(orientation)) {
      errors.push('Page Orientation must be portrait or landscape');
    }

    if (typeof fitToWidth !== 'boolean') {
      errors.push('Fit to Width must be true or false');
    }
  }

  // Validate XML element names before invoking Python.
  if (['csv-to-xml', 'json-to-xml', 'excel-to-xml'].includes(toolId)) {
    for (const name of ['rootTag', 'itemTag'] as const) {
      const value = options[name] ?? options[
        name === 'rootTag' ? 'root_tag' : 'item_tag'
      ];

      if (value === undefined || value === null || value === '') {
        continue;
      }

      if (
        typeof value !== 'string' ||
        !/^[A-Za-z_][A-Za-z0-9._-]*$/.test(value)
      ) {
        errors.push(name + ' must be a valid XML element name');
      } else if (value.toLowerCase().startsWith('xml')) {
        errors.push(name + ' cannot start with the reserved XML prefix');
      }
    }
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

export function normalizeFileExtension(extension: string): string {
  const normalized = extension.trim().replace(/^\.+/, '').toLowerCase();
  if (!normalized || !/^[a-z0-9]+$/.test(normalized)) {
    throw new Error(`Invalid output extension: ${extension}`);
  }
  return `.${normalized}`;
}

export function createConvertedFilename(extension: string): string {
  return `converted${normalizeFileExtension(extension)}`;
}

export function resolveDataOutputExtension(
  toolId: string,
  configuredOutput: string,
  options: Record<string, any>,
): string {
  if (
    toolId === 'excel-to-csv' &&
    (options.sheet_mode === 'zip' || options.sheetMode === 'zip')
  ) {
    return '.zip';
  }
  return normalizeFileExtension(configuredOutput);
}

export function dataMimeTypeForExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls': 'application/vnd.ms-excel',
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
  };
  return mimeTypes[normalizeFileExtension(extension)] || 'application/octet-stream';
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
  
  return sanitized + normalizeFileExtension(tool.output);
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
