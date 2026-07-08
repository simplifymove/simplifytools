import AdmZip from 'adm-zip';

export type SpreadsheetValue = string | number;

export interface SpreadsheetFormula {
  cell: string;
  formula: string;
  label?: string;
}

export interface SpreadsheetMetric {
  label: string;
  value: SpreadsheetValue;
  format?: string;
}

export interface WorkbookSheet {
  sheetName: string;
  description?: string;
  columns: string[];
  rows: SpreadsheetValue[][];
  formulas?: SpreadsheetFormula[];
  summaryMetrics?: SpreadsheetMetric[];
  chartSuggestions?: string[];
}

export interface ProfessionalWorkbook {
  workbookTitle: string;
  sheets: WorkbookSheet[];
  summaryMetrics?: SpreadsheetMetric[];
  chartSuggestions?: string[];
  notes?: string[];
}

type RowKind = 'title' | 'subtitle' | 'section' | 'header' | 'metric' | 'data' | 'total' | 'note' | 'blank';

interface WorkbookRow {
  cells: SpreadsheetValue[];
  kind: RowKind;
  formats?: Array<string | undefined>;
  shaded?: boolean;
}

interface SheetPayload {
  name: string;
  rows: WorkbookRow[];
  formulas: SpreadsheetFormula[];
  freezeRow: number;
  autoFilterRow?: number;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function sanitizeSheetName(name: string, fallback: string) {
  const cleaned = name.replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 31);

  return cleaned || fallback;
}

function columnName(index: number) {
  let name = '';
  let current = index + 1;

  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }

  return name;
}

function isIsoDate(value: SpreadsheetValue) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function excelDateSerial(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  const epoch = Date.UTC(1899, 11, 30);

  return Math.round((date.getTime() - epoch) / 86400000);
}

function normalizeFormat(format?: string) {
  const normalized = (format || '').toLowerCase();

  if (normalized.includes('currency') || normalized.includes('money')) return 'currency';
  if (normalized.includes('percent')) return 'percent';
  if (normalized.includes('date')) return 'date';
  if (normalized.includes('number') || normalized.includes('numeric')) return 'number';

  return 'text';
}

function inferFormat(value: SpreadsheetValue, columnLabel = '', explicitFormat?: string) {
  const explicit = normalizeFormat(explicitFormat);
  const column = columnLabel.toLowerCase();

  if (explicit !== 'text') return explicit;
  if (isIsoDate(value) || /\b(date|month|quarter|due|close)\b/.test(column)) return 'date';
  if (/\b(percent|rate|margin|conversion|probability|variance %|%|growth)\b/.test(column)) return 'percent';
  if (/\b(revenue|price|cost|amount|budget|actual|variance|total|sales|mrr|arr|rate|fee|value)\b/.test(column)) {
    return 'currency';
  }
  if (typeof value === 'number') return 'number';

  return 'text';
}

function styleFor(row: WorkbookRow, columnIndex: number, value: SpreadsheetValue) {
  if (row.kind === 'title') return 1;
  if (row.kind === 'subtitle') return 2;
  if (row.kind === 'section') return 3;
  if (row.kind === 'header') return 4;
  if (row.kind === 'metric') return columnIndex === 0 ? 14 : 15;
  if (row.kind === 'total') return 16;
  if (row.kind === 'note') return 17;
  if (row.kind === 'blank') return 0;

  const format = inferFormat(value, '', row.formats?.[columnIndex]);
  const alternate = row.shaded ? 1 : 0;

  if (format === 'currency') return alternate ? 8 : 7;
  if (format === 'percent') return alternate ? 10 : 9;
  if (format === 'date') return alternate ? 12 : 11;
  if (format === 'number') return alternate ? 6 : 5;

  return alternate ? 18 : 0;
}

function cellXml(
  value: SpreadsheetValue,
  rowNumber: number,
  columnIndex: number,
  row: WorkbookRow,
  options: { formula?: string; columnLabel?: string } = {},
) {
  const reference = `${columnName(columnIndex)}${rowNumber}`;
  const style = styleFor(row, columnIndex, value);

  if (options.formula) {
    return `<c r="${reference}" s="${style}"><f>${escapeXml(options.formula.replace(/^=/, ''))}</f></c>`;
  }

  const format = inferFormat(value, options.columnLabel || '', row.formats?.[columnIndex]);
  if (format === 'date' && isIsoDate(value)) {
    return `<c r="${reference}" s="${style}"><v>${excelDateSerial(String(value))}</v></c>`;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const storedValue = format === 'percent' && Math.abs(value) > 1 ? value / 100 : value;

    return `<c r="${reference}" s="${style}"><v>${storedValue}</v></c>`;
  }

  return `<c r="${reference}" s="${style}" t="inlineStr"><is><t>${escapeXml(String(value ?? ''))}</t></is></c>`;
}

function maxColumnWidths(rows: WorkbookRow[]) {
  const maxColumns = Math.max(...rows.map((row) => row.cells.length), 1);

  return Array.from({ length: maxColumns }, (_, index) => {
    const width = Math.max(
      12,
      Math.min(
        index === 0 ? 34 : 46,
        ...rows.map((row) => String(row.cells[index] ?? '').length + 4),
      ),
    );

    return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`;
  }).join('');
}

function buildRows(payload: SheetPayload) {
  const formulaByCell = new Map(payload.formulas.map((formula) => [formula.cell.toUpperCase(), formula.formula]));
  let currentHeader: string[] = [];

  return payload.rows
    .map((row, rowIndex) => {
      const rowNumber = rowIndex + 1;

      if (row.kind === 'header') {
        currentHeader = row.cells.map((cell) => String(cell ?? ''));
      }

      const cells = row.cells
        .map((cell, columnIndex) => {
          const reference = `${columnName(columnIndex)}${rowNumber}`;

          return cellXml(cell, rowNumber, columnIndex, row, {
            formula: formulaByCell.get(reference),
            columnLabel: currentHeader[columnIndex],
          });
        })
        .join('');

      const ht = row.kind === 'title' ? ' ht="28" customHeight="1"' : row.kind === 'header' ? ' ht="22" customHeight="1"' : '';

      return `<row r="${rowNumber}"${ht}>${cells}</row>`;
    })
    .join('');
}

function mergeCellsXml(rows: WorkbookRow[]) {
  const merges = rows
    .map((row, index) => {
      if (row.kind !== 'title' && row.kind !== 'subtitle' && row.kind !== 'section') return null;

      const rowNumber = index + 1;
      const lastColumn = columnName(Math.max(row.cells.length, 4) - 1);

      return `<mergeCell ref="A${rowNumber}:${lastColumn}${rowNumber}"/>`;
    })
    .filter(Boolean);

  return merges.length > 0 ? `<mergeCells count="${merges.length}">${merges.join('')}</mergeCells>` : '';
}

function worksheetXml(payload: SheetPayload) {
  const safeRows: WorkbookRow[] = payload.rows.length > 0 ? payload.rows : [{ kind: 'note', cells: ['No data'] }];
  const lastColumn = columnName(Math.max(...safeRows.map((row) => row.cells.length), 1) - 1);
  const lastRow = safeRows.length;
  const filterRow = payload.autoFilterRow || payload.freezeRow;
  const autoFilter = filterRow > 0 && filterRow <= lastRow
    ? `<autoFilter ref="A${filterRow}:${lastColumn}${lastRow}"/>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${lastColumn}${lastRow}"/>
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="${payload.freezeRow}" topLeftCell="A${payload.freezeRow + 1}" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>${maxColumnWidths(safeRows)}</cols>
  <sheetData>${buildRows({ ...payload, rows: safeRows })}</sheetData>
  ${mergeCellsXml(safeRows)}
  ${autoFilter}
  <pageMargins left="0.5" right="0.5" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
</worksheet>`;
}

function metricRows(metrics: SpreadsheetMetric[]) {
  return metrics.map((metric) => ({
    kind: 'metric' as const,
    cells: [metric.label, metric.value, metric.format || 'text'],
    formats: ['text', metric.format, 'text'],
  }));
}

function summaryPayload(workbook: ProfessionalWorkbook): SheetPayload {
  const metrics = workbook.summaryMetrics || [];
  const chartSuggestions = workbook.chartSuggestions || [];
  const rows: WorkbookRow[] = [
    { kind: 'title', cells: [workbook.workbookTitle || 'AI Studio Workbook', '', '', ''] },
    { kind: 'subtitle', cells: ['Generated with SimplifyConvert AI Studio', '', '', ''] },
    { kind: 'blank', cells: [] },
    { kind: 'section', cells: ['Summary Metrics', '', '', ''] },
    { kind: 'header', cells: ['Metric', 'Value', 'Format'] },
    ...metricRows(metrics.length > 0 ? metrics : [{ label: 'Workbook status', value: 'Draft', format: 'text' }]),
    { kind: 'blank', cells: [] },
    { kind: 'section', cells: ['Workbook Sheets', '', '', ''] },
    { kind: 'header', cells: ['Sheet', 'Description', 'Rows'] },
    ...workbook.sheets.map((sheet, index) => ({
      kind: 'data' as const,
      cells: [sheet.sheetName, sheet.description || '', sheet.rows.length],
      formats: ['text', 'text', 'number'],
      shaded: index % 2 === 1,
    })),
    { kind: 'blank', cells: [] },
    { kind: 'section', cells: ['Chart Suggestions', '', '', ''] },
    { kind: 'header', cells: ['Suggestion'] },
    ...(chartSuggestions.length > 0
      ? chartSuggestions.map((suggestion) => ({ kind: 'note' as const, cells: [suggestion] }))
      : [{ kind: 'note' as const, cells: ['Charts are not embedded by this exporter; use these suggestions to create charts in Excel.'] }]),
  ];

  return { name: 'Summary', rows, formulas: [], freezeRow: 5, autoFilterRow: 5 };
}

function numericColumnIndexes(rows: SpreadsheetValue[][]) {
  if (rows.length === 0) return [];
  const maxColumns = Math.max(...rows.map((row) => row.length), 0);

  return Array.from({ length: maxColumns }, (_, index) => index).filter((index) =>
    rows.some((row) => typeof row[index] === 'number' && Number.isFinite(row[index] as number)),
  );
}

function dataSheetPayload(sheet: WorkbookSheet): SheetPayload {
  const header = sheet.columns.length > 0 ? sheet.columns : ['Item', 'Value'];
  const sourceRows = sheet.rows.length > 0 ? sheet.rows : [['No data']];
  const rows: WorkbookRow[] = [
    { kind: 'title', cells: [sheet.sheetName, '', '', ''] },
    { kind: 'subtitle', cells: [sheet.description || 'Generated with SimplifyConvert AI Studio', '', '', ''] },
  ];

  if (sheet.summaryMetrics && sheet.summaryMetrics.length > 0) {
    rows.push(
      { kind: 'blank', cells: [] },
      { kind: 'section', cells: ['Sheet Metrics', '', '', ''] },
      { kind: 'header', cells: ['Metric', 'Value', 'Format'] },
      ...metricRows(sheet.summaryMetrics.slice(0, 8)),
    );
  }

  rows.push(
    { kind: 'blank', cells: [] },
    { kind: 'section', cells: ['Data Table', '', '', ''] },
    { kind: 'header', cells: header },
    ...sourceRows.map((row, index) => ({
      kind: 'data' as const,
      cells: row,
      formats: header.map((column, index) => inferFormat(row[index] ?? '', column)),
      shaded: index % 2 === 1,
    })),
  );

  const formulas: SpreadsheetFormula[] = [];
  const tableHeaderRow = rows.findIndex((row) => row.kind === 'header' && row.cells.join('|') === header.join('|')) + 1;
  const firstDataRow = tableHeaderRow + 1;
  const lastDataRow = firstDataRow + sourceRows.length - 1;
  const numericColumns = numericColumnIndexes(sourceRows);

  if (numericColumns.length > 0 && sourceRows.length > 1) {
    const totalRowNumber = rows.length + 1;
    rows.push({
      kind: 'total',
      cells: header.map((_, index) => (index === 0 ? 'Totals' : '')),
      formats: header.map((column, index) => inferFormat(0, column, index === 0 ? 'text' : undefined)),
    });
    numericColumns.forEach((columnIndex) => {
      formulas.push({
        cell: `${columnName(columnIndex)}${totalRowNumber}`,
        formula: `SUM(${columnName(columnIndex)}${firstDataRow}:${columnName(columnIndex)}${lastDataRow})`,
      });
    });
  }

  if (sheet.formulas && sheet.formulas.length > 0) {
    rows.push(
      { kind: 'blank', cells: [] },
      { kind: 'section', cells: ['Calculations', '', ''] },
      { kind: 'header', cells: ['Formula', 'Result', 'Purpose'] },
    );
    sheet.formulas.forEach((formula) => {
      const rowNumber = rows.length + 1;
      rows.push({
        kind: 'data',
        cells: [formula.formula.replace(/^=/, ''), '', formula.label || formula.cell || 'Calculated value'],
        shaded: rows.length % 2 === 0,
      });
      formulas.push({
        cell: `B${rowNumber}`,
        formula: formula.formula,
        label: formula.label,
      });
    });
  }

  if (sheet.chartSuggestions && sheet.chartSuggestions.length > 0) {
    rows.push(
      { kind: 'blank', cells: [] },
      { kind: 'section', cells: ['Chart Suggestions', ''] },
      ...sheet.chartSuggestions.map((suggestion) => ({ kind: 'note' as const, cells: [suggestion] })),
    );
  }

  return {
    name: sheet.sheetName,
    rows,
    formulas,
    freezeRow: tableHeaderRow || 4,
    autoFilterRow: tableHeaderRow || undefined,
  };
}

function notesPayload(workbook: ProfessionalWorkbook): SheetPayload {
  const rows: WorkbookRow[] = [
    { kind: 'title', cells: ['Notes and Instructions', '', '', ''] },
    { kind: 'subtitle', cells: ['Generated with SimplifyConvert AI Studio', '', '', ''] },
    { kind: 'blank', cells: [] },
    { kind: 'section', cells: ['Notes', '', '', ''] },
    ...(workbook.notes && workbook.notes.length > 0
      ? workbook.notes.map((note) => ({ kind: 'note' as const, cells: [note] }))
      : [{ kind: 'note' as const, cells: ['Review generated formulas, assumptions, and chart suggestions before sharing externally.'] }]),
    { kind: 'blank', cells: [] },
    { kind: 'section', cells: ['Chart Suggestions', '', '', ''] },
    ...(workbook.chartSuggestions || []).map((suggestion) => ({ kind: 'note' as const, cells: [suggestion] })),
    ...workbook.sheets.flatMap((sheet) =>
      (sheet.chartSuggestions || []).map((suggestion) => ({ kind: 'note' as const, cells: [`${sheet.sheetName}: ${suggestion}`] })),
    ),
  ];

  return { name: 'Notes', rows, formulas: [], freezeRow: 4 };
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="3">
    <numFmt numFmtId="164" formatCode="$#,##0.00"/>
    <numFmt numFmtId="165" formatCode="0.0%"/>
    <numFmt numFmtId="166" formatCode="mmm d, yyyy"/>
  </numFmts>
  <fonts count="5">
    <font><sz val="11"/><color rgb="FF1F2937"/><name val="Aptos"/></font>
    <font><b/><sz val="18"/><color rgb="FFFFFFFF"/><name val="Aptos Display"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Aptos"/></font>
    <font><b/><sz val="12"/><color rgb="FF0F172A"/><name val="Aptos"/></font>
    <font><i/><sz val="10"/><color rgb="FF64748B"/><name val="Aptos"/></font>
  </fonts>
  <fills count="7">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F172A"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE0F2FE"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFECFDF5"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFCCFBF1"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left style="thin"><color rgb="FFE2E8F0"/></left><right style="thin"><color rgb="FFE2E8F0"/></right><top style="thin"><color rgb="FFE2E8F0"/></top><bottom style="thin"><color rgb="FFE2E8F0"/></bottom><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="19">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="4" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment vertical="top"/></xf>
    <xf numFmtId="4" fontId="0" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyAlignment="1"><alignment vertical="top"/></xf>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment vertical="top"/></xf>
    <xf numFmtId="164" fontId="0" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyAlignment="1"><alignment vertical="top"/></xf>
    <xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment vertical="top"/></xf>
    <xf numFmtId="165" fontId="0" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyAlignment="1"><alignment vertical="top"/></xf>
    <xf numFmtId="166" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyAlignment="1"><alignment vertical="top"/></xf>
    <xf numFmtId="166" fontId="0" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1" applyAlignment="1"><alignment vertical="top"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1"/>
    <xf numFmtId="0" fontId="3" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1"/>
    <xf numFmtId="0" fontId="3" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1"/>
    <xf numFmtId="0" fontId="4" fillId="0" borderId="1" xfId="0" applyFont="1" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

export function createProfessionalXlsxBuffer(workbook: ProfessionalWorkbook) {
  const zip = new AdmZip();
  const safeSheets = workbook.sheets.length > 0
    ? workbook.sheets
    : [{ sheetName: 'Main Data', columns: ['Item', 'Value'], rows: [['No data', '']] }];
  const normalizedWorkbook = { ...workbook, sheets: safeSheets };
  const allSheets = [
    summaryPayload(normalizedWorkbook),
    ...safeSheets.map(dataSheetPayload),
    notesPayload(normalizedWorkbook),
  ];

  zip.addFile(
    '[Content_Types].xml',
    Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${allSheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`),
  );

  zip.addFile(
    '_rels/.rels',
    Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`),
  );

  zip.addFile(
    'xl/workbook.xml',
    Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${allSheets.map((sheet, index) => `<sheet name="${escapeXml(sanitizeSheetName(sheet.name, `Sheet ${index + 1}`))}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join('')}
  </sheets>
  <calcPr calcMode="auto"/>
</workbook>`),
  );

  zip.addFile(
    'xl/_rels/workbook.xml.rels',
    Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${allSheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join('')}
  <Relationship Id="rId${allSheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`),
  );

  zip.addFile('xl/styles.xml', Buffer.from(stylesXml()));
  allSheets.forEach((sheet, index) => {
    zip.addFile(`xl/worksheets/sheet${index + 1}.xml`, Buffer.from(worksheetXml(sheet)));
  });

  zip.addFile(
    'docProps/core.xml',
    Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(workbook.workbookTitle)}</dc:title>
  <dc:creator>SimplifyConvert AI Studio</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
</cp:coreProperties>`),
  );

  zip.addFile(
    'docProps/app.xml',
    Buffer.from(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>SimplifyConvert AI Studio</Application>
</Properties>`),
  );

  return zip.toBuffer();
}
