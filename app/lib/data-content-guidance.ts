import type { DataTool } from './data-tools';

export interface DataToolContent {
  transformation: string;
  limitations: string[];
}

export interface DataToolFaq {
  q: string;
  a: string;
}

const dataToolContent: Record<string, DataToolContent> = {
  'excel-to-csv': {
    transformation: 'The server exports the first Excel worksheet as one CSV file, or exports every worksheet as a separate CSV inside a ZIP archive. Choose the delimiter required by the destination application.',
    limitations: ['CSV files cannot retain workbook formatting, charts, macros, or formulas. Verify exported values, dates, and identifiers.', 'CSV output uses UTF-8 with a byte-order mark. All Sheets mode creates a ZIP containing one CSV per worksheet.'],
  },
  'csv-to-json': {
    transformation: 'The server reads CSV column headers and rows using the selected delimiter, then creates a UTF-8 JSON array containing one object per data row.',
    limitations: ['The parser infers data types, so numeric-looking identifiers may lose leading zeros.', 'Empty cells and recognized missing values become JSON null. Review generated keys, values, and row counts before importing.'],
  },
  'json-to-xml': {
    transformation: 'The server converts JSON objects and arrays into XML elements. Choose the root element name and the item name used for top-level array entries.',
    limitations: ['JSON primitive types are written as XML text and are not preserved as explicit type metadata.', 'JSON property names may be normalized into valid XML element names. The conversion does not recreate XML attributes or namespaces.'],
  },
  'csv-to-excel': {
    transformation: 'The server reads the delimited rows and columns from one CSV file and writes them to an Excel worksheet.',
    limitations: ['Choose the delimiter that matches the source CSV. Select the encoding that matches the source CSV. UTF-8, Latin-1, ISO-8859-1, and Windows-1252 are supported.', 'The conversion creates spreadsheet cells but does not recreate formatting that a plain CSV cannot store.'],
  },
  'csv-to-xml': {
    transformation: 'The server reads one delimited CSV table and turns its headers and rows into the configured XML root and item structure.',
    limitations: ['CSV headers must be usable as XML field names after sanitization.', 'A flat table cannot express every nested XML relationship without additional structure.'],
  },
  'excel-to-pdf': {
    transformation: 'The server reads the first worksheet or all worksheets, depending on the selected setting, and renders their tabular values as PDF tables. Choose portrait or landscape orientation. Fit to Width places columns within the page width; disabling it splits wide tables into separate column groups across PDF pages.',
    limitations: ['This conversion exports worksheet table values rather than reproducing the original Excel print layout. Cell colors, fonts, merged cells, charts, images, macros, print areas, and complex formatting are not preserved.', 'Formula calculations are not performed by the PDF renderer. Verify exported values, especially formulas, dates, percentages, currency, and identifiers.', 'Narrow fitted columns may wrap text onto multiple lines. With Fit to Width disabled, wide tables may span several PDF pages.'],
  },
  'excel-to-xml': {
    transformation: 'The server reads rows from the first worksheet and writes each row as an XML item beneath the configured root element.',
    limitations: ['Only the first worksheet is read by the current conversion path.', 'Workbook styling, formulas, charts, macros, and merged-cell layout are not represented as XML formatting.'],
  },
  'split-csv': {
    transformation: 'The server divides one CSV source into multiple CSV parts using the selected row-count, part-count, or column-value mode and returns them in a ZIP file.',
    limitations: ['This accepts one source file, not a multi-file batch upload.', 'Column-based splitting requires a matching source column, and every part repeats the table headers.'],
  },
  'split-excel': {
    transformation: 'The server divides one Excel source into multiple workbook parts by rows, part count, or worksheets and returns them in a ZIP file.',
    limitations: ['This accepts one source workbook, not a multi-file batch upload.', 'Row-based modes use the first worksheet; worksheet mode exports each sheet as a separate workbook.'],
  },
  'xml-to-csv': {
    transformation: 'The server flattens XML elements and attributes into tabular columns and writes the resulting rows to one CSV file.',
    limitations: ['Nested elements and attributes are flattened, so the CSV may not preserve the original hierarchy.', 'Irregular records can produce sparse columns and should be reviewed after conversion.'],
  },
  'xml-to-excel': {
    transformation: 'The server flattens XML elements and attributes into rows and columns and writes them to one Excel worksheet.',
    limitations: ['Nested XML hierarchy is flattened into tabular fields.', 'Attributes, repeated children, and irregular records can transform into columns that need review.'],
  },
  'xml-to-json': {
    transformation: 'The server parses one XML document and converts its elements, attributes, text, and repeated children into JSON structures.',
    limitations: ['XML attributes and text use explicit JSON keys, and repeated child elements can become arrays.', 'Namespaces and mixed-content XML may not map back to an identical XML document.'],
  },
};

const fallbackContent: DataToolContent = {
  transformation: 'The server processes one supported source file and creates the configured output format.',
  limitations: ['Review the generated output before relying on it.', 'Complex source structures may not map perfectly between formats.'],
};

export function formatDataExtension(extension: string): string {
  return `.${extension.replace(/^\.+/, '')}`;
}

export function hasDataEncodingControl(tool: DataTool): boolean {
  return tool.options.some((option) => option.name === 'encoding');
}

export function getDataToolContent(tool: DataTool): DataToolContent {
  return dataToolContent[tool.id] || fallbackContent;
}

export function getDataToolFaqs(tool: DataTool): DataToolFaq[] {
  const content = getDataToolContent(tool);
  const isSplit = tool.category === 'split';
  const faqs: DataToolFaq[] = [
    {
      q: `How does ${tool.title} transform the file?`,
      a: `${content.transformation} ${content.limitations[0]}`,
    },
    {
      q: 'What file size limit applies?',
      a: 'The page and server validate one source file against the current 100 MB limit.',
    },
    {
      q: 'How is my file processed?',
      a: 'The file is uploaded for server-side conversion. Temporary conversion files are cleaned up after the request, and the generated result may be retained briefly to provide the download link. Avoid uploading sensitive data.',
    },
    {
      q: isSplit ? 'Does this accept multiple source files?' : 'Can I convert multiple files at once?',
      a: isSplit
        ? 'No. Upload one source file; the split operation creates multiple output parts inside a ZIP result.'
        : 'No. This workflow accepts one source file per conversion request.',
    },
    {
      q: 'What should I review in the result?',
      a: content.limitations.join(' '),
    },
  ];

  if (hasDataEncodingControl(tool)) {
    faqs.splice(3, 0, {
      q: 'Does the encoding selector change server processing?',
      a: 'Yes. CSV to Excel uses the selected encoding when reading the uploaded file. Choose UTF-8, Latin-1, ISO-8859-1, or Windows-1252 to match the source CSV.',
    });
  }

  return faqs;
}
