import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
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
  WidthType,
} from 'docx';
import { authOptions } from '@/lib/auth/config';
import { findAiStudioUserByEmail } from '@/lib/ai-studio/user';

interface ExportDocumentRequest {
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

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function normalText(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    spacing: { after: 180 },
  });
}

function callout(title: string, items: string[], color = 'E0F2FE') {
  if (items.length === 0) return [];

  return [
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, color: '0E7490', size: 24 })],
      shading: { type: ShadingType.CLEAR, fill: color },
      spacing: { before: 240, after: 120 },
      border: {
        left: { style: BorderStyle.SINGLE, size: 16, color: '0E7490' },
      },
      indent: { left: 220 },
    }),
    ...items.map((item) =>
      new Paragraph({
        children: [new TextRun({ text: item, size: 21 })],
        bullet: { level: 0 },
        spacing: { after: 90 },
        indent: { left: 420 },
      }),
    ),
  ];
}

function buildTable(tableInput: ExportDocumentTable) {
  const columns = Array.isArray(tableInput.columns) ? tableInput.columns.filter(Boolean) : [];
  const rows = Array.isArray(tableInput.rows) ? tableInput.rows : [];

  if (columns.length === 0 || rows.length === 0) return [];

  return [
    new Paragraph({
      children: [new TextRun({ text: safeText(tableInput.title, 'Table'), bold: true, size: 22 })],
      spacing: { before: 180, after: 90 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: columns.map((column) =>
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: '0F172A' },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: String(column), bold: true, color: 'FFFFFF', size: 20 })],
                }),
              ],
            }),
          ),
        }),
        ...rows.map((row) =>
          new TableRow({
            children: columns.map((_, index) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: String(row[index] ?? ''), size: 20 })],
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await findAiStudioUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = (await request.json()) as ExportDocumentRequest;
    const title = safeText(body.title, 'AI Studio Document') || 'AI Studio Document';
    const sections = Array.isArray(body.sections) ? body.sections : [];
    const generatedDate = new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date());
    const children: Array<Paragraph | Table> = [
      new Paragraph({
        children: [new TextRun({ text: 'SimplifyConvert AI Studio', bold: true, color: '0E7490', size: 24 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 1200, after: 420 },
      }),
      new Paragraph({
        children: [new TextRun({ text: title, bold: true, color: '0F172A', size: 48 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 260 },
      }),
      new Paragraph({
        children: [new TextRun({ text: safeText(body.subtitle, 'Professional AI-generated document'), color: '475569', size: 26 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 520 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `Generated ${generatedDate}`, color: '64748B', size: 20 })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Generated by SimplifyConvert AI Studio', color: '64748B', size: 20 })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [new PageBreak()],
      }),
    ];

    if (sections.length > 0) {
      children.push(
        new Paragraph({
          text: 'Contents Overview',
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 160 },
        }),
        ...sections.map((section, index) =>
          new Paragraph({
            children: [
              new TextRun({ text: `${index + 1}. `, bold: true, color: '0E7490' }),
              new TextRun({ text: safeText(section.heading, 'Section') }),
            ],
            spacing: { after: 80 },
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
        }),
        new Paragraph({
          children: [new TextRun({ text: summary, size: 23 })],
          spacing: { after: 240 },
        }),
      );
    }

    sections.forEach((section) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: '', break: 1 })],
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 8, color: 'CBD5E1' },
          },
          spacing: { before: 260, after: 180 },
        }),
        new Paragraph({
          text: safeText(section.heading, 'Section'),
          heading: HeadingLevel.HEADING_1,
        }),
      );

      (Array.isArray(section.paragraphs) ? section.paragraphs : []).forEach((paragraph) => {
        const text = safeText(paragraph);
        if (text) {
          children.push(normalText(text));
        }
      });

      const bullets = Array.isArray(section.bulletPoints) ? section.bulletPoints : section.bullets;
      (Array.isArray(bullets) ? bullets : []).forEach((bullet) => {
        const text = safeText(bullet);
        if (text) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text, size: 21 })],
              bullet: { level: 0 },
              spacing: { after: 90 },
            }),
          );
        }
      });

      (Array.isArray(section.tables) ? section.tables : []).forEach((table) => {
        children.push(...buildTable(table));
      });
    });

    children.push(...callout('Key Insights', Array.isArray(body.keyInsights) ? body.keyInsights.map((item) => safeText(item)).filter(Boolean) : []));
    children.push(...callout('Recommendations', Array.isArray(body.recommendations) ? body.recommendations.map((item) => safeText(item)).filter(Boolean) : [], 'ECFDF5'));

    const conclusion = safeText(body.conclusion);
    if (conclusion) {
      children.push(
        new Paragraph({
          text: 'Conclusion',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300 },
        }),
        new Paragraph({
          text: conclusion,
          spacing: { before: 240 },
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
              color: '1F2937',
            },
          },
        },
      },
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 900,
                right: 900,
                bottom: 900,
                left: 900,
              },
            },
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: 'Generated with SimplifyConvert AI Studio', color: '64748B', size: 18 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          },
          children,
        },
      ],
    });
    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="ai-studio-document.docx"',
      },
    });
  } catch (error) {
    console.error('[ai-studio-document-export] Export failed:', error);

    return NextResponse.json({ error: 'Unable to export document' }, { status: 500 });
  }
}
