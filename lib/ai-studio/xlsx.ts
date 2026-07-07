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

function styleForCell(value: SpreadsheetValue, rowIndex: number, isHeader = false) {
  if (rowIndex === 0) return 1;
  if (isHeader) return 2;
  if (typeof value === 'number') return rowIndex % 2 === 0 ? 5 : 4;

  return rowIndex % 2 === 0 ? 3 : 0;
}

function cellXml(value: SpreadsheetValue, rowIndex: number, columnIndex: number, options: { header?: boolean; formula?: string } = {}) {
  const reference = `${columnName(columnIndex)}${rowIndex + 1}`;
  const style = styleForCell(value, rowIndex, options.header);

  if (options.formula) {
    return `<c r="${reference}" s="${style}"><f>${escapeXml(options.formula.replace(/^=/, ''))}</f></c>`;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return `<c r="${reference}" s="${style}"><v>${value}</v></c>`;
  }

  return `<c r="${reference}" s="${style}" t="inlineStr"><is><t>${escapeXml(String(value ?? ''))}</t></is></c>`;
}

function buildRows(rows: SpreadsheetValue[][], formulas: SpreadsheetFormula[] = []) {
  const formulaByCell = new Map(formulas.map((formula) => [formula.cell.toUpperCase(), formula.formula]));

  return rows
    .map((row, rowIndex) => {
      const cells = row
        .map((cell, columnIndex) => {
          const reference = `${columnName(columnIndex)}${rowIndex + 1}`;

          return cellXml(cell, rowIndex, columnIndex, {
            header: rowIndex === 1,
            formula: formulaByCell.get(reference),
          });
        })
        .join('');

      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join('');
}

function maxColumnWidths(rows: SpreadsheetValue[][]) {
  const maxColumns = Math.max(...rows.map((row) => row.length), 1);

  return Array.from({ length: maxColumns }, (_, index) => {
    const width = Math.max(
      12,
      Math.min(
        42,
        ...rows.map((row) => String(row[index] ?? '').length + 4),
      ),
    );

    return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`;
  }).join('');
}

function worksheetXml(rows: SpreadsheetValue[][], formulas: SpreadsheetFormula[] = [], freezeRow = 3) {
  const safeRows = rows.length > 0 ? rows : [['No data']];
  const lastColumn = columnName(Math.max(...safeRows.map((row) => row.length), 1) - 1);
  const lastRow = safeRows.length;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>${maxColumnWidths(safeRows)}</cols>
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="${freezeRow}" topLeftCell="A${freezeRow + 1}" activePane="bottomLeft" state="frozen"/>
    </sheetView>
  </sheetViews>
  <sheetData>${buildRows(safeRows, formulas)}</sheetData>
  <autoFilter ref="A${freezeRow}:${lastColumn}${lastRow}"/>
</worksheet>`;
}

function summaryRows(workbook: ProfessionalWorkbook): SpreadsheetValue[][] {
  const metrics = workbook.summaryMetrics || [];
  const chartSuggestions = workbook.chartSuggestions || [];

  return [
    [workbook.workbookTitle],
    ['Generated with SimplifyConvert AI Studio'],
    [],
    ['Summary Metric', 'Value', 'Format'],
    ...metrics.map((metric) => [metric.label, metric.value, metric.format || 'text']),
    [],
    ['Workbook Sheets', 'Description'],
    ...workbook.sheets.map((sheet) => [sheet.sheetName, sheet.description || '']),
    [],
    ['Chart Suggestions'],
    ...chartSuggestions.map((suggestion) => [suggestion]),
  ];
}

function dataSheetPayload(sheet: WorkbookSheet): { rows: SpreadsheetValue[][]; formulas: SpreadsheetFormula[] } {
  const header = sheet.columns.length > 0 ? sheet.columns : ['Item', 'Value'];
  const rows: SpreadsheetValue[][] = [
    [sheet.sheetName],
    [sheet.description || 'Generated with SimplifyConvert AI Studio'],
    [],
    header,
    ...(sheet.rows.length > 0 ? sheet.rows : [['No data']]),
  ];
  const formulaCells: SpreadsheetFormula[] = [];

  if (sheet.formulas && sheet.formulas.length > 0) {
    rows.push([], ['Formula', 'Result', 'Purpose']);
    sheet.formulas.forEach((formula) => {
      const rowNumber = rows.length + 1;
      rows.push([formula.formula, '', formula.label || formula.cell || 'Calculated value']);
      formulaCells.push({
        cell: `B${rowNumber}`,
        formula: formula.formula,
        label: formula.label,
      });
    });
  }

  return { rows, formulas: formulaCells };
}

function notesRows(workbook: ProfessionalWorkbook): SpreadsheetValue[][] {
  return [
    ['Notes and Instructions'],
    ['Generated with SimplifyConvert AI Studio'],
    [],
    ['Notes'],
    ...(workbook.notes || []).map((note) => [note]),
    [],
    ['Chart Suggestions'],
    ...(workbook.chartSuggestions || []).map((suggestion) => [suggestion]),
    ...workbook.sheets.flatMap((sheet) =>
      (sheet.chartSuggestions || []).map((suggestion) => [`${sheet.sheetName}: ${suggestion}`]),
    ),
  ];
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
    <font><sz val="11"/><name val="Aptos"/></font>
    <font><b/><sz val="18"/><color rgb="FFFFFFFF"/><name val="Aptos Display"/></font>
    <font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Aptos"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F172A"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE0F2FE"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF8FAFC"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left style="thin"><color rgb="FFE2E8F0"/></left><right style="thin"><color rgb="FFE2E8F0"/></right><top style="thin"><color rgb="FFE2E8F0"/></top><bottom style="thin"><color rgb="FFE2E8F0"/></bottom><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="6">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1"/>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0"/>
    <xf numFmtId="4" fontId="0" fillId="4" borderId="1" xfId="0" applyNumberFormat="1" applyFill="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

export function createProfessionalXlsxBuffer(workbook: ProfessionalWorkbook) {
  const zip = new AdmZip();
  const safeSheets = workbook.sheets.length > 0
    ? workbook.sheets
    : [{ sheetName: 'Main Data', columns: ['Item', 'Value'], rows: [['No data', '']] }];
  const dataSheetPayloads = safeSheets.map((sheet) => ({
    name: sheet.sheetName,
    ...dataSheetPayload(sheet),
  }));
  const allSheets = [
    { name: 'Summary', rows: summaryRows({ ...workbook, sheets: safeSheets }), formulas: [] as SpreadsheetFormula[] },
    ...dataSheetPayloads,
    { name: 'Notes', rows: notesRows({ ...workbook, sheets: safeSheets }), formulas: [] as SpreadsheetFormula[] },
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
    zip.addFile(`xl/worksheets/sheet${index + 1}.xml`, Buffer.from(worksheetXml(sheet.rows, sheet.formulas, 4)));
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
