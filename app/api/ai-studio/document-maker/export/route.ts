import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  createProfessionalDocxBuffer,
  type ProfessionalDocument,
} from '@/lib/ai-studio/docx';
import { authOptions } from '@/lib/auth/config';
import { findAiStudioUserByEmail } from '@/lib/ai-studio/user';

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

    const body = (await request.json()) as ProfessionalDocument;
    const buffer = await createProfessionalDocxBuffer(body);

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
