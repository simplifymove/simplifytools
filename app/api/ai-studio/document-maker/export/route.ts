import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import { authOptions } from '@/lib/auth/config';
import { findAiStudioUserByEmail } from '@/lib/ai-studio/user';

interface ExportDocumentRequest {
  title?: string;
  summary?: string;
  sections?: Array<{
    heading?: string;
    paragraphs?: string[];
    bullets?: string[];
  }>;
  closing?: string;
}

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
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
    const children: Paragraph[] = [
      new Paragraph({
        text: title,
        heading: HeadingLevel.TITLE,
      }),
    ];

    const summary = safeText(body.summary);
    if (summary) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: summary, italics: true })],
          spacing: { after: 240 },
        }),
      );
    }

    sections.forEach((section) => {
      children.push(
        new Paragraph({
          text: safeText(section.heading, 'Section'),
          heading: HeadingLevel.HEADING_1,
        }),
      );

      (Array.isArray(section.paragraphs) ? section.paragraphs : []).forEach((paragraph) => {
        const text = safeText(paragraph);
        if (text) {
          children.push(new Paragraph({ text, spacing: { after: 180 } }));
        }
      });

      (Array.isArray(section.bullets) ? section.bullets : []).forEach((bullet) => {
        const text = safeText(bullet);
        if (text) {
          children.push(new Paragraph({ text, bullet: { level: 0 } }));
        }
      });
    });

    const closing = safeText(body.closing);
    if (closing) {
      children.push(
        new Paragraph({
          text: closing,
          spacing: { before: 240 },
        }),
      );
    }

    const doc = new Document({
      creator: 'SimplifyConvert AI Studio',
      title,
      description: 'AI-generated document',
      sections: [{ children }],
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
