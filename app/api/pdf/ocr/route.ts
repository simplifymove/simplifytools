/**
 * PDF OCR API Route
 * Handles PDF/image upload and converts to editable text using Tesseract.js (FREE OCR)
 * No API keys, no costs, 100% free and open-source
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/app/lib/tesseract-ocr';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

/**
 * POST /api/pdf/ocr
 * Extracts text from PDF/Image using Tesseract.js OCR (FREE)
 *
 * Request body:
 * - file: FormData with PDF or image file
 *
 * Response:
 * - fullText: Extracted text
 * - textBlocks: Array of text blocks with positioning
 * - confidence: Average confidence score (0-100)
 * - pages: Number of pages processed
 */
export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Accepted: PDF, JPG, PNG, WebP, TIFF' },
        { status: 400 }
      );
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 50MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text using Tesseract.js
    const ocrResult = await extractTextFromPDF(buffer, file.type);

    return NextResponse.json(
      {
        success: true,
        data: {
          fullText: ocrResult.fullText,
          textBlocks: ocrResult.textBlocks,
          confidence: Math.round(ocrResult.confidence),
          pages: ocrResult.pages,
          fileName: file.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('OCR Processing Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to process PDF';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET health check
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'OCR API Ready',
      provider: 'Tesseract.js (Free & Open Source)',
      version: '1.0',
      cost: 'FREE',
    },
    { status: 200 }
  );
}
