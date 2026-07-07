import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createXlsxBuffer, type SpreadsheetCellValue } from '@/lib/ai-studio/xlsx';
import { authOptions } from '@/lib/auth/config';
import { findAiStudioUserByEmail } from '@/lib/ai-studio/user';

interface ExportSpreadsheetRequest {
  title?: string;
  columns?: string[];
  rows?: Array<Array<string | number>>;
  notes?: string[];
}

function sanitizeRows(body: ExportSpreadsheetRequest): SpreadsheetCellValue[][] {
  const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : 'AI Studio Spreadsheet';
  const columns = Array.isArray(body.columns)
    ? body.columns.map((column) => String(column || '')).filter(Boolean)
    : [];
  const rows = Array.isArray(body.rows)
    ? body.rows
        .filter((row): row is Array<string | number> => Array.isArray(row))
        .map((row) => row.map((cell) => ({ value: typeof cell === 'number' ? cell : String(cell ?? '') })))
    : [];
  const output: SpreadsheetCellValue[][] = [[{ value: title }], []];

  if (columns.length > 0) {
    output.push(columns.map((column) => ({ value: column })));
  }

  output.push(...rows);

  const notes = Array.isArray(body.notes) ? body.notes.map((note) => String(note)).filter(Boolean) : [];
  if (notes.length > 0) {
    output.push([], [{ value: 'Notes' }], ...notes.map((note) => [{ value: note }]));
  }

  return output;
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
    const buffer = createXlsxBuffer(sanitizeRows(body));

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
