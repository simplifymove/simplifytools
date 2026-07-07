import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  createProfessionalXlsxBuffer,
  type ProfessionalWorkbook,
  type SpreadsheetMetric,
  type WorkbookSheet,
} from '@/lib/ai-studio/xlsx';
import { authOptions } from '@/lib/auth/config';
import { findAiStudioUserByEmail } from '@/lib/ai-studio/user';

interface ExportSpreadsheetRequest {
  workbookTitle?: string;
  title?: string;
  sheets?: WorkbookSheet[];
  columns?: string[];
  rows?: Array<Array<string | number>>;
  summaryMetrics?: SpreadsheetMetric[];
  chartSuggestions?: string[];
  notes?: string[];
}

function sanitizeWorkbook(body: ExportSpreadsheetRequest): ProfessionalWorkbook {
  const workbookTitle =
    typeof body.workbookTitle === 'string' && body.workbookTitle.trim()
      ? body.workbookTitle.trim()
      : typeof body.title === 'string' && body.title.trim()
        ? body.title.trim()
        : 'AI Studio Spreadsheet';
  const sheets = Array.isArray(body.sheets)
    ? body.sheets
        .map((sheet) => ({
          sheetName: String(sheet.sheetName || 'Main Data'),
          description: typeof sheet.description === 'string' ? sheet.description : '',
          columns: Array.isArray(sheet.columns)
            ? sheet.columns.map((column) => String(column || '')).filter(Boolean)
            : [],
          rows: Array.isArray(sheet.rows)
            ? sheet.rows
                .filter((row): row is Array<string | number> => Array.isArray(row))
                .map((row) => row.map((cell) => (typeof cell === 'number' ? cell : String(cell ?? ''))))
            : [],
          formulas: Array.isArray(sheet.formulas) ? sheet.formulas : [],
          summaryMetrics: Array.isArray(sheet.summaryMetrics) ? sheet.summaryMetrics : [],
          chartSuggestions: Array.isArray(sheet.chartSuggestions)
            ? sheet.chartSuggestions.map((item) => String(item)).filter(Boolean)
            : [],
        }))
        .filter((sheet) => sheet.columns.length > 0)
    : [];
  const columns = Array.isArray(body.columns)
    ? body.columns.map((column) => String(column || '')).filter(Boolean)
    : [];
  const rows = Array.isArray(body.rows)
    ? body.rows
        .filter((row): row is Array<string | number> => Array.isArray(row))
        .map((row) => row.map((cell) => (typeof cell === 'number' ? cell : String(cell ?? ''))))
    : [];

  const notes = Array.isArray(body.notes) ? body.notes.map((note) => String(note)).filter(Boolean) : [];

  return {
    workbookTitle,
    sheets: sheets.length > 0
      ? sheets
      : [
          {
            sheetName: 'Main Data',
            description: 'Generated with SimplifyConvert AI Studio',
            columns: columns.length > 0 ? columns : ['Item', 'Value'],
            rows: rows.length > 0 ? rows : [['No data', '']],
          },
        ],
    summaryMetrics: Array.isArray(body.summaryMetrics) ? body.summaryMetrics : [],
    chartSuggestions: Array.isArray(body.chartSuggestions)
      ? body.chartSuggestions.map((item) => String(item)).filter(Boolean)
      : [],
    notes,
  };
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

    const body = (await request.json()) as ExportSpreadsheetRequest;
    const buffer = createProfessionalXlsxBuffer(sanitizeWorkbook(body));

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="ai-studio-spreadsheet.xlsx"',
      },
    });
  } catch (error) {
    console.error('[ai-studio-spreadsheet-export] Export failed:', error);

    return NextResponse.json({ error: 'Unable to export spreadsheet' }, { status: 500 });
  }
}
