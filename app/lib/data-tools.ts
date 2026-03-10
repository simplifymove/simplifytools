/**
 * Data Conversion Tools Registry
 * 
 * Centralized configuration for all 12 data conversion tools.
 * Each tool routes to one of 3 shared engines instead of separate implementations.
 * 
 * Tools are grouped by engine:
 * - SpreadsheetConvertEngine (6 tools)
 * - StructuredDataEngine (4 tools)  
 * - SplitEngine (2 tools)
 */

export type DataEngine = 'spreadsheet' | 'structured' | 'split';
export type ToolCategory = 'conversion' | 'split';

export interface ToolOption {
  name: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'checkbox';
  required: boolean;
  default?: string | number | boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  description?: string;
  min?: number;
  max?: number;
}

export interface DataTool {
  id: string;
  title: string;
  description: string;
  category: ToolCategory;
  engine: DataEngine;
  accepts: string[]; // e.g., ['.csv', '.xlsx']
  output: string; // e.g., '.xlsx' or '.zip'
  options: ToolOption[];
  icon?: string;
}

export const dataTools: Record<string, DataTool> = {
  // ============ SPREADSHEET ENGINE (6 tools) ============

  'csv-to-excel': {
    id: 'csv-to-excel',
    title: 'CSV to Excel',
    description: 'Convert CSV files to Excel format with formatting',
    category: 'conversion',
    engine: 'spreadsheet',
    accepts: ['.csv'],
    output: '.xlsx',
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
        description: 'Select the delimiter used in your CSV file',
      },
      {
        name: 'encoding',
        label: 'Encoding',
        type: 'select',
        required: false,
        default: 'utf-8',
        options: [
          { value: 'utf-8', label: 'UTF-8' },
          { value: 'latin-1', label: 'Latin-1' },
          { value: 'iso-8859-1', label: 'ISO-8859-1' },
          { value: 'cp1252', label: 'Windows-1252' },
        ],
        description: 'Select character encoding',
      },
      {
        name: 'sheetName',
        label: 'Sheet Name',
        type: 'text',
        required: false,
        default: 'Data',
        placeholder: 'e.g., Sheet1, Data, etc.',
        description: 'Name of the Excel sheet',
      },
      {
        name: 'autoSize',
        label: 'Auto-size Columns',
        type: 'checkbox',
        required: false,
        default: true,
        description: 'Automatically adjust column widths',
      },
    ],
  },

  'excel-to-csv': {
    id: 'excel-to-csv',
    title: 'Excel to CSV',
    description: 'Convert Excel sheets to CSV format',
    category: 'conversion',
    engine: 'spreadsheet',
    accepts: ['.xlsx', '.xls', '.xlsm', '.xlsb'],
    output: '.csv',
    options: [
      {
        name: 'sheetMode',
        label: 'Sheet Mode',
        type: 'select',
        required: false,
        default: 'first',
        options: [
          { value: 'first', label: 'First Sheet Only' },
          { value: 'zip', label: 'All Sheets (as ZIP)' },
        ],
        description: 'Export first sheet or all sheets',
      },
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

  'xml-to-excel': {
    id: 'xml-to-excel',
    title: 'XML to Excel',
    description: 'Convert XML data to Excel format with flattened structure',
    category: 'conversion',
    engine: 'spreadsheet',
    accepts: ['.xml'],
    output: '.xlsx',
    options: [
      {
        name: 'itemTag',
        label: 'Item Tag Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., item, record, row',
        description: 'Name of the repeating element (e.g., <item> or <record>)',
      },
      {
        name: 'sheetName',
        label: 'Sheet Name',
        type: 'text',
        required: false,
        default: 'Data',
        placeholder: 'Sheet name',
      },
    ],
  },

  'xml-to-csv': {
    id: 'xml-to-csv',
    title: 'XML to CSV',
    description: 'Convert XML files to CSV format with flattening',
    category: 'conversion',
    engine: 'spreadsheet',
    accepts: ['.xml'],
    output: '.csv',
    options: [
      {
        name: 'itemTag',
        label: 'Item Tag Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., item, record, row',
        description: 'Name of the repeating element',
      },
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
        ],
      },
    ],
  },

  'excel-to-xml': {
    id: 'excel-to-xml',
    title: 'Excel to XML',
    description: 'Convert Excel data to structured XML format',
    category: 'conversion',
    engine: 'spreadsheet',
    accepts: ['.xlsx', '.xls', '.xlsm', '.xlsb'],
    output: '.xml',
    options: [
      {
        name: 'rootTag',
        label: 'Root Tag Name',
        type: 'text',
        required: false,
        default: 'rows',
        placeholder: 'e.g., rows, data, items',
      },
      {
        name: 'itemTag',
        label: 'Item Tag Name',
        type: 'text',
        required: false,
        default: 'row',
        placeholder: 'e.g., row, item, record',
      },
    ],
  },

  'excel-to-pdf': {
    id: 'excel-to-pdf',
    title: 'Excel to PDF',
    description: 'Convert Excel sheets to PDF with table formatting',
    category: 'conversion',
    engine: 'spreadsheet',
    accepts: ['.xlsx', '.xls', '.xlsm', '.xlsb'],
    output: '.pdf',
    options: [
      {
        name: 'sheetMode',
        label: 'Sheets to Export',
        type: 'select',
        required: false,
        default: 'first',
        options: [
          { value: 'first', label: 'First Sheet Only' },
          { value: 'all', label: 'All Sheets' },
        ],
      },
      {
        name: 'orientation',
        label: 'Page Orientation',
        type: 'select',
        required: false,
        default: 'portrait',
        options: [
          { value: 'portrait', label: 'Portrait' },
          { value: 'landscape', label: 'Landscape' },
        ],
      },
      {
        name: 'fitToWidth',
        label: 'Fit to Width',
        type: 'checkbox',
        required: false,
        default: true,
        description: 'Scale content to fit page width',
      },
    ],
  },

  // ============ STRUCTURED DATA ENGINE (4 tools) ============

  'csv-to-json': {
    id: 'csv-to-json',
    title: 'CSV to JSON',
    description: 'Convert CSV files to JSON array or object format',
    category: 'conversion',
    engine: 'structured',
    accepts: ['.csv'],
    output: '.json',
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
        name: 'format',
        label: 'JSON Format',
        type: 'select',
        required: false,
        default: 'array',
        options: [
          { value: 'array', label: 'Array of Objects' },
          { value: 'keyed', label: 'Keyed by First Column' },
        ],
        description: 'Array of objects or object with first column as keys',
      },
      {
        name: 'pretty',
        label: 'Pretty Print',
        type: 'checkbox',
        required: false,
        default: true,
        description: 'Format with indentation',
      },
    ],
  },

  'json-to-xml': {
    id: 'json-to-xml',
    title: 'JSON to XML',
    description: 'Convert JSON data to XML structure',
    category: 'conversion',
    engine: 'structured',
    accepts: ['.json'],
    output: '.xml',
    options: [
      {
        name: 'rootTag',
        label: 'Root Tag Name',
        type: 'text',
        required: false,
        default: 'root',
        placeholder: 'e.g., root, data, items',
      },
      {
        name: 'itemTag',
        label: 'Item Tag Name (for arrays)',
        type: 'text',
        required: false,
        default: 'item',
        placeholder: 'e.g., item, row, record',
      },
    ],
  },

  'xml-to-json': {
    id: 'xml-to-json',
    title: 'XML to JSON',
    description: 'Convert XML files to JSON format',
    category: 'conversion',
    engine: 'structured',
    accepts: ['.xml'],
    output: '.json',
    options: [
      {
        name: 'pretty',
        label: 'Pretty Print',
        type: 'checkbox',
        required: false,
        default: true,
        description: 'Format with indentation',
      },
      {
        name: 'attributes',
        label: 'Include XML Attributes',
        type: 'checkbox',
        required: false,
        default: true,
      },
    ],
  },

  'csv-to-xml': {
    id: 'csv-to-xml',
    title: 'CSV to XML',
    description: 'Convert CSV data to XML structure',
    category: 'conversion',
    engine: 'structured',
    accepts: ['.csv'],
    output: '.xml',
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
        ],
      },
      {
        name: 'rootTag',
        label: 'Root Tag Name',
        type: 'text',
        required: false,
        default: 'rows',
      },
      {
        name: 'itemTag',
        label: 'Item Tag Name',
        type: 'text',
        required: false,
        default: 'row',
      },
    ],
  },

  // ============ SPLIT ENGINE (2 tools) ============

  'split-csv': {
    id: 'split-csv',
    title: 'Split CSV',
    description: 'Split large CSV files into smaller files',
    category: 'split',
    engine: 'split',
    accepts: ['.csv'],
    output: '.zip',
    options: [
      {
        name: 'splitMode',
        label: 'Split Mode',
        type: 'select',
        required: true,
        default: 'rows',
        options: [
          { value: 'rows', label: 'By Number of Rows' },
          { value: 'parts', label: 'Into Equal Parts' },
          { value: 'column', label: 'By Column Value' },
        ],
        description: 'How to split the CSV file',
      },
      {
        name: 'rowsPerFile',
        label: 'Rows Per File',
        type: 'number',
        required: false,
        default: 1000,
        placeholder: '1000',
        description: 'Number of rows per file (for "By Rows" mode)',
      },
      {
        name: 'parts',
        label: 'Number of Parts',
        type: 'number',
        required: false,
        default: 2,
        placeholder: '2',
        description: 'Number of equal parts (for "Equal Parts" mode)',
      },
      {
        name: 'columnName',
        label: 'Column Name',
        type: 'text',
        required: false,
        placeholder: 'e.g., category, status',
        description: 'Column to split by (for "By Column" mode)',
      },
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
        ],
      },
    ],
  },

  'split-excel': {
    id: 'split-excel',
    title: 'Split Excel',
    description: 'Split Excel workbooks into multiple files',
    category: 'split',
    engine: 'split',
    accepts: ['.xlsx', '.xls'],
    output: '.zip',
    options: [
      {
        name: 'splitMode',
        label: 'Split Mode',
        type: 'select',
        required: true,
        default: 'sheet',
        options: [
          { value: 'sheet', label: 'By Sheet' },
          { value: 'rows', label: 'By Number of Rows' },
          { value: 'parts', label: 'Into Equal Parts' },
        ],
      },
      {
        name: 'rowsPerFile',
        label: 'Rows Per File',
        type: 'number',
        required: false,
        default: 1000,
        placeholder: '1000',
        description: 'Rows per file (for "By Rows" mode)',
      },
      {
        name: 'parts',
        label: 'Number of Parts',
        type: 'number',
        required: false,
        default: 2,
        placeholder: '2',
        description: 'Number of parts (for "Equal Parts" mode)',
      },
    ],
  },
};

/**
 * Helper to get tool by ID
 */
export function getDataToolById(toolId: string): DataTool | null {
  return dataTools[toolId] || null;
}

/**
 * Helper to get tools by engine
 */
export function getToolsByEngine(engine: DataEngine): DataTool[] {
  return Object.values(dataTools).filter(tool => tool.engine === engine);
}

/**
 * Helper to get tools by category
 */
export function getToolsByCategory(category: ToolCategory): DataTool[] {
  return Object.values(dataTools).filter(tool => tool.category === category);
}
