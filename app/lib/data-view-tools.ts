/**
 * Data View & Transformation Tools Registry
 * 
 * Comprehensive collection of 25+ data tools for:
 * - Format conversion (CSV/JSON/XML/YAML)
 * - Encoding/Decoding (Base64, URL, HTML)
 * - Formatting & Validation (JSON, XML, YAML)
 * - Data viewing (CSV, Excel, JSON, XML)
 */

export type DataViewEngine = 'converter' | 'encoder' | 'formatter' | 'validator' | 'viewer';
export type InputMode = 'file' | 'textarea' | 'paste' | 'both';
export type OutputMode = 'download' | 'copy' | 'preview' | 'both';

export interface ToolOption {
  name: string;
  label: string;
  type: 'select' | 'number' | 'checkbox' | 'text';
  required: boolean;
  default?: string | number | boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  description?: string;
  min?: number;
  max?: number;
}

export interface DataViewTool {
  id: string;
  title: string;
  description: string;
  category: string;
  engine: DataViewEngine;
  inputMode: InputMode;
  outputMode: OutputMode;
  icon?: string;
  options?: ToolOption[];
}

export const dataViewTools: Record<string, DataViewTool> = {
  // ==================== FORMAT CONVERTERS ====================

  'csv-to-json': {
    id: 'csv-to-json',
    title: 'CSV to JSON Converter',
    description: 'Convert CSV files to JSON format. Perfect for data APIs and database imports.',
    category: 'Format Conversion',
    engine: 'converter',
    inputMode: 'both',
    outputMode: 'both',
    icon: 'FileJson',
    options: [
      {
        name: 'delimiter',
        label: 'Delimiter',
        type: 'select',
        required: false,
        default: 'comma',
        options: [
          { value: 'comma', label: 'Comma (,)' },
          { value: 'semicolon', label: 'Semicolon (;)' },
          { value: 'tab', label: 'Tab' },
          { value: 'pipe', label: 'Pipe (|)' },
        ],
      },
      {
        name: 'encoding',
        label: 'Character Encoding',
        type: 'select',
        required: false,
        default: 'utf-8',
        options: [
          { value: 'utf-8', label: 'UTF-8' },
          { value: 'latin-1', label: 'Latin-1' },
          { value: 'iso-8859-1', label: 'ISO-8859-1' },
        ],
      },
    ],
  },

  'json-to-csv': {
    id: 'json-to-csv',
    title: 'JSON to CSV Converter',
    description: 'Transform JSON data into CSV spreadsheet format. Ideal for Excel and data analysis.',
    category: 'Format Conversion',
    engine: 'converter',
    inputMode: 'both',
    outputMode: 'both',
    icon: 'FileText',
    options: [
      {
        name: 'delimiter',
        label: 'CSV Delimiter',
        type: 'select',
        required: false,
        default: 'comma',
        options: [
          { value: 'comma', label: 'Comma (,)' },
          { value: 'semicolon', label: 'Semicolon (;)' },
          { value: 'tab', label: 'Tab' },
        ],
      },
      {
        name: 'includeHeaders',
        label: 'Include Headers',
        type: 'checkbox',
        required: false,
        default: true,
      },
    ],
  },

  'json-to-xml': {
    id: 'json-to-xml',
    title: 'JSON to XML Converter',
    description: 'Convert JSON data to XML format. Useful for SOAP APIs and legacy systems.',
    category: 'Format Conversion',
    engine: 'converter',
    inputMode: 'both',
    outputMode: 'both',
    icon: 'Database',
    options: [
      {
        name: 'rootElement',
        label: 'Root Element Name',
        type: 'text',
        required: false,
        default: 'root',
        placeholder: 'e.g., root, data, response',
      },
      {
        name: 'attributePrefix',
        label: 'Attribute Prefix',
        type: 'text',
        required: false,
        default: '@',
        placeholder: 'e.g., @, attr_',
      },
    ],
  },

  'xml-to-json': {
    id: 'xml-to-json',
    title: 'XML to JSON Converter',
    description: 'Parse XML and convert to JSON. Perfect for API integration and data transformation.',
    category: 'Format Conversion',
    engine: 'converter',
    inputMode: 'both',
    outputMode: 'both',
    icon: 'FileJson',
    options: [
      {
        name: 'includeAttributes',
        label: 'Include XML Attributes',
        type: 'checkbox',
        required: false,
        default: true,
      },
      {
        name: 'mergeText',
        label: 'Merge Text Content',
        type: 'checkbox',
        required: false,
        default: true,
      },
    ],
  },

  'yaml-to-json': {
    id: 'yaml-to-json',
    title: 'YAML to JSON Converter',
    description: 'Convert YAML configuration files to JSON format. Common for DevOps and config management.',
    category: 'Format Conversion',
    engine: 'converter',
    inputMode: 'both',
    outputMode: 'both',
    icon: 'Database',
    options: [],
  },

  'json-to-yaml': {
    id: 'json-to-yaml',
    title: 'JSON to YAML Converter',
    description: 'Transform JSON data to human-readable YAML format. Ideal for configuration files.',
    category: 'Format Conversion',
    engine: 'converter',
    inputMode: 'both',
    outputMode: 'both',
    icon: 'FileText',
    options: [
      {
        name: 'indent',
        label: 'Indent Size',
        type: 'number',
        required: false,
        default: 2,
        min: 1,
        max: 8,
      },
    ],
  },

  'tsv-to-csv': {
    id: 'tsv-to-csv',
    title: 'TSV to CSV Converter',
    description: 'Convert tab-separated values to comma-separated values. Easy spreadsheet conversion.',
    category: 'Format Conversion',
    engine: 'converter',
    inputMode: 'both',
    outputMode: 'both',
    icon: 'FileText',
    options: [
      {
        name: 'outputDelimiter',
        label: 'Output Delimiter',
        type: 'select',
        required: false,
        default: 'comma',
        options: [
          { value: 'comma', label: 'Comma (,)' },
          { value: 'semicolon', label: 'Semicolon (;)' },
          { value: 'pipe', label: 'Pipe (|)' },
        ],
      },
    ],
  },

  'sql-to-json': {
    id: 'sql-to-json',
    title: 'SQL to JSON Converter',
    description: 'Convert SQL CREATE TABLE statements to JSON schema. Perfect for documentation and migration.',
    category: 'Format Conversion',
    engine: 'converter',
    inputMode: 'both',
    outputMode: 'both',
    icon: 'Database',
    options: [
      {
        name: 'includeConstraints',
        label: 'Include Constraints',
        type: 'checkbox',
        required: false,
        default: true,
      },
    ],
  },

  'json-to-sql': {
    id: 'json-to-sql',
    title: 'JSON to SQL Converter',
    description: 'Generate SQL INSERT statements from JSON data. Streamline database population.',
    category: 'Format Conversion',
    engine: 'converter',
    inputMode: 'both',
    outputMode: 'copy',
    icon: 'Database',
    options: [
      {
        name: 'tableName',
        label: 'Table Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., users, products',
      },
      {
        name: 'includeId',
        label: 'Include ID Column',
        type: 'checkbox',
        required: false,
        default: false,
      },
    ],
  },





  // ==================== VIEWERS ====================

  'csv-viewer': {
    id: 'csv-viewer',
    title: 'CSV Viewer',
    description: 'View and inspect CSV files in a formatted table. Perfect for data analysis.',
    category: 'Viewers',
    engine: 'viewer',
    inputMode: 'file',
    outputMode: 'preview',
    icon: 'Table',
    options: [
      {
        name: 'delimiter',
        label: 'Delimiter',
        type: 'select',
        required: false,
        default: 'comma',
        options: [
          { value: 'comma', label: 'Comma (,)' },
          { value: 'semicolon', label: 'Semicolon (;)' },
          { value: 'tab', label: 'Tab' },
          { value: 'pipe', label: 'Pipe (|)' },
        ],
      },
    ],
  },

  'json-viewer': {
    id: 'json-viewer',
    title: 'JSON Viewer',
    description: 'View and navigate JSON with an interactive tree. Collapse/expand nested structures.',
    category: 'Viewers',
    engine: 'viewer',
    inputMode: 'both',
    outputMode: 'preview',
    icon: 'FileJson',
    options: [
      {
        name: 'expandLevel',
        label: 'Initial Expand Level',
        type: 'number',
        required: false,
        default: 2,
        min: 0,
        max: 10,
      },
    ],
  },

  'xml-viewer': {
    id: 'xml-viewer',
    title: 'XML Viewer',
    description: 'View XML with collapsible tree structure. Navigate complex XML documents easily.',
    category: 'Viewers',
    engine: 'viewer',
    inputMode: 'both',
    outputMode: 'preview',
    icon: 'FileText',
    options: [
      {
        name: 'highlightAttributes',
        label: 'Highlight Attributes',
        type: 'checkbox',
        required: false,
        default: true,
      },
    ],
  },

  'yaml-viewer': {
    id: 'yaml-viewer',
    title: 'YAML Viewer',
    description: 'View YAML configuration files with syntax highlighting and structure visualization.',
    category: 'Viewers',
    engine: 'viewer',
    inputMode: 'both',
    outputMode: 'preview',
    icon: 'FileText',
    options: [],
  },
};

/**
 * Get a tool by its ID
 */
export function getDataViewToolById(id: string): DataViewTool | undefined {
  return dataViewTools[id];
}

/**
 * Get all tools grouped by category
 */
export function getDataViewToolsByCategory(): Record<string, DataViewTool[]> {
  const grouped: Record<string, DataViewTool[]> = {};
  
  Object.values(dataViewTools).forEach(tool => {
    if (!grouped[tool.category]) {
      grouped[tool.category] = [];
    }
    grouped[tool.category].push(tool);
  });

  return grouped;
}

/**
 * Get related tools for a given tool ID
 */
export function getRelatedDataViewTools(toolId: string, limit = 4): DataViewTool[] {
  const tool = dataViewTools[toolId];
  if (!tool) return [];

  // Find tools in the same category, excluding current tool
  const related = Object.values(dataViewTools)
    .filter(t => t.category === tool.category && t.id !== toolId)
    .slice(0, limit);

  // If not enough in same category, fill with other tools
  if (related.length < limit) {
    const others = Object.values(dataViewTools)
      .filter(t => !related.includes(t) && t.id !== toolId)
      .slice(0, limit - related.length);
    related.push(...others);
  }

  return related;
}
