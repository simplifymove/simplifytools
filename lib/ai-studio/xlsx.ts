import AdmZip from 'adm-zip';

export interface SpreadsheetCellValue {
  value: string | number;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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

function cellXml(cell: SpreadsheetCellValue, rowIndex: number, columnIndex: number) {
  const reference = `${columnName(columnIndex)}${rowIndex + 1}`;

  if (typeof cell.value === 'number' && Number.isFinite(cell.value)) {
    return `<c r="${reference}"><v>${cell.value}</v></c>`;
  }

  return `<c r="${reference}" t="inlineStr"><is><t>${escapeXml(String(cell.value ?? ''))}</t></is></c>`;
}

export function createXlsxBuffer(rows: SpreadsheetCellValue[][]) {
  const zip = new AdmZip();
  const safeRows = rows.length > 0 ? rows : [[{ value: 'No data' }]];

  const sheetData = safeRows
    .map((row, rowIndex) => {
      const cells = row
        .map((cell, columnIndex) => cellXml(cell, rowIndex, columnIndex))
        .join('');

      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join('');

  zip.addFile(
    '[Content_Types].xml',
    Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`,
    ),
  );

  zip.addFile(
    '_rels/.rels',
    Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
    ),
  );

  zip.addFile(
    'xl/workbook.xml',
    Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="AI Studio" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`,
    ),
  );

  zip.addFile(
    'xl/_rels/workbook.xml.rels',
    Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
    ),
  );

  zip.addFile(
    'xl/worksheets/sheet1.xml',
    Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${sheetData}</sheetData>
</worksheet>`,
    ),
  );

  zip.addFile(
    'docProps/core.xml',
    Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>SimplifyConvert AI Studio Spreadsheet</dc:title>
  <dc:creator>SimplifyConvert AI Studio</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
</cp:coreProperties>`,
    ),
  );

  zip.addFile(
    'docProps/app.xml',
    Buffer.from(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>SimplifyConvert AI Studio</Application>
</Properties>`,
    ),
  );

  return zip.toBuffer();
}
