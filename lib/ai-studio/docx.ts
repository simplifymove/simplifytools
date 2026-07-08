import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  PageBreak,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';

export interface ProfessionalDocument {
  title?: string;
  subtitle?: string;
  executiveSummary?: string;
  sections?: Array<{
    heading?: string;
    paragraphs?: string[];
    bulletPoints?: string[];
    bullets?: string[];
    tables?: Array<{
      title?: string;
      columns?: string[];
      rows?: Array<Array<string | number>>;
    }>;
  }>;
  keyInsights?: string[];
  recommendations?: string[];
  conclusion?: string;
}

interface ExportDocumentTable {
  title?: string;
  columns?: string[];
  rows?: Array<Array<string | number>>;
}

const brandColor = '0E7490';
const inkColor = '0F172A';
const bodyColor = '1F2937';
const slateColor = '334155';
const mutedColor = '64748B';
const borderColor = 'CBD5E1';
const softBlue = 'E0F2FE';
const softGreen = 'ECFDF5';
const softSlate = 'F8FAFC';

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function normalText(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, color: bodyColor })],
    spacing: { before: 40, after: 180, line: 320 },
  });
}

function sectionDivider() {
  return new Paragraph({
    children: [new TextRun({ text: '' })],
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 8, color: borderColor },
    },
    spacing: { before: 280, after: 220 },
  });
}

function bulletText(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, size: 21, color: slateColor })],
    bullet: { level: 0 },
    spacing: { after: 100, line: 300 },
    indent: { left: 360, hanging: 180 },
  });
}

function callout(title: string, items: string[], options: { fill?: string; accent?: string; border?: string } = {}) {
  if (items.length === 0) return [];

  const fill = options.fill || softBlue;
  const accent = options.accent || brandColor;
  const border = options.border || 'BAE6FD';

  return [
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, color: accent, size: 24, allCaps: true })],
      shading: { type: ShadingType.CLEAR, fill },
      spacing: { before: 320, after: 120 },
      border: {
        left: { style: BorderStyle.SINGLE, size: 18, color: accent },
        top: { style: BorderStyle.SINGLE, size: 4, color: border },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: border },
      },
      indent: { left: 260 },
    }),
    ...items.map((item) =>
      new Paragraph({
        children: [new TextRun({ text: item, size: 21, color: slateColor })],
        shading: { type: ShadingType.CLEAR, fill },
        bullet: { level: 0 },
        spacing: { after: 110, line: 300 },
        indent: { left: 520, hanging: 180 },
      }),
    ),
  ];
}

function buildTable(tableInput: ExportDocumentTable) {
  const columns = Array.isArray(tableInput.columns) ? tableInput.columns.filter(Boolean) : [];
  const rows = Array.isArray(tableInput.rows) ? tableInput.rows : [];

  if (columns.length === 0 || rows.length === 0) return [];

  const columnWidth = Math.max(1200, Math.floor(9000 / columns.length));
  const cellMargins = { top: 120, bottom: 120, left: 120, right: 120 };
  const cellBorders = {
    top: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
    left: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
    right: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
  };

  return [
    new Paragraph({
      children: [new TextRun({ text: safeText(tableInput.title, 'Table'), bold: true, size: 22, color: inkColor })],
      spacing: { before: 260, after: 100 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 8, color: borderColor },
        bottom: { style: BorderStyle.SINGLE, size: 8, color: borderColor },
        left: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
        right: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
        insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
      },
      rows: [
        new TableRow({
          tableHeader: true,
          children: columns.map((column) =>
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: inkColor },
              margins: cellMargins,
              borders: cellBorders,
              verticalAlign: VerticalAlign.CENTER,
              width: { size: columnWidth, type: WidthType.DXA },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: String(column), bold: true, color: 'FFFFFF', size: 20 })],
                  spacing: { after: 0 },
                }),
              ],
            }),
          ),
        }),
        ...rows.map((row, rowIndex) =>
          new TableRow({
            children: columns.map((_, index) =>
              new TableCell({
                shading: { type: ShadingType.CLEAR, fill: rowIndex % 2 === 0 ? 'FFFFFF' : softSlate },
                margins: cellMargins,
                borders: cellBorders,
                verticalAlign: VerticalAlign.CENTER,
                width: { size: columnWidth, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: String(row[index] ?? ''), size: 20, color: slateColor })],
                    spacing: { after: 0 },
                  }),
                ],
              }),
            ),
          }),
        ),
      ],
    }),
  ];
}

export async function createProfessionalDocxBuffer(body: ProfessionalDocument) {
  const title = safeText(body.title, 'AI Studio Document') || 'AI Studio Document';
  const sections = Array.isArray(body.sections) ? body.sections : [];
  const generatedDate = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
  const children: Array<Paragraph | Table> = [
    new Paragraph({
      children: [new TextRun({ text: 'SimplifyConvert AI Studio', bold: true, color: brandColor, size: 24, allCaps: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200, after: 360 },
    }),
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, color: inkColor, size: 52 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300, line: 620 },
    }),
    new Paragraph({
      children: [new TextRun({ text: safeText(body.subtitle, 'Professional AI-generated document'), color: '475569', size: 26 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 540, line: 360 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Prepared as a structured, export-ready business document', color: mutedColor, size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Generated ${generatedDate}`, color: mutedColor, size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Generated with SimplifyConvert AI Studio', color: mutedColor, size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 720 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 10, color: brandColor },
      },
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  if (sections.length > 0) {
    children.push(
      new Paragraph({
        text: 'Contents Overview',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 120, after: 220 },
      }),
      ...sections.map((section, index) =>
        new Paragraph({
          children: [
            new TextRun({ text: `${index + 1}. `, bold: true, color: brandColor, size: 22 }),
            new TextRun({ text: safeText(section.heading, 'Section'), color: inkColor, size: 22 }),
          ],
          spacing: { after: 100 },
        }),
      ),
      new Paragraph({ children: [new PageBreak()] }),
    );
  }

  const summary = safeText(body.executiveSummary);
  if (summary) {
    children.push(
      new Paragraph({
        text: 'Executive Summary',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 120, after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: summary, size: 23, color: '1E293B' })],
        shading: { type: ShadingType.CLEAR, fill: softSlate },
        border: {
          left: { style: BorderStyle.SINGLE, size: 16, color: brandColor },
        },
        indent: { left: 220 },
        spacing: { before: 80, after: 280, line: 340 },
      }),
    );
  }

  sections.forEach((section, index) => {
    children.push(
      sectionDivider(),
      new Paragraph({
        children: [
          new TextRun({ text: `${index + 1}. `, color: brandColor, bold: true, size: 30 }),
          new TextRun({ text: safeText(section.heading, 'Section'), color: inkColor, bold: true, size: 30 }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 80, after: 180 },
      }),
    );

    (Array.isArray(section.paragraphs) ? section.paragraphs : []).forEach((paragraph) => {
      const text = safeText(paragraph);
      if (text) children.push(normalText(text));
    });

    const bullets = Array.isArray(section.bulletPoints) ? section.bulletPoints : section.bullets;
    (Array.isArray(bullets) ? bullets : []).forEach((bullet) => {
      const text = safeText(bullet);
      if (text) children.push(bulletText(text));
    });

    (Array.isArray(section.tables) ? section.tables : []).forEach((table) => {
      children.push(...buildTable(table));
    });
  });

  children.push(...callout('Key Insights', Array.isArray(body.keyInsights) ? body.keyInsights.map((item) => safeText(item)).filter(Boolean) : []));
  children.push(
    ...callout(
      'Recommendations',
      Array.isArray(body.recommendations) ? body.recommendations.map((item) => safeText(item)).filter(Boolean) : [],
      { fill: softGreen, accent: '047857', border: 'BBF7D0' },
    ),
  );

  const conclusion = safeText(body.conclusion);
  if (conclusion) {
    children.push(
      new Paragraph({
        text: 'Conclusion',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 340, after: 120 },
      }),
      new Paragraph({
        children: [new TextRun({ text: conclusion, size: 22, color: bodyColor })],
        spacing: { before: 120, after: 240, line: 320 },
      }),
    );
  }

  const doc = new Document({
    creator: 'SimplifyConvert AI Studio',
    title,
    description: 'AI-generated document',
    styles: {
      default: {
        document: {
          run: {
            font: 'Aptos',
            size: 22,
            color: bodyColor,
          },
          paragraph: {
            spacing: { line: 300, after: 120 },
          },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            font: 'Aptos Display',
            bold: true,
            color: inkColor,
            size: 32,
          },
          paragraph: {
            spacing: { before: 260, after: 140 },
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 840,
              right: 900,
              bottom: 840,
              left: 900,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'Generated with SimplifyConvert AI Studio', color: mutedColor, size: 18 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
