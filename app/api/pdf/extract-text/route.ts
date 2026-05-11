import { NextRequest, NextResponse } from 'next/server';

interface TextItem {
  id: string;
  pageNumber: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  color: string;
}

/**
 * Extract text objects from a PDF file
 * Returns array of text items with position and formatting info
 */
export async function POST(request: NextRequest) {
  let errorLog = '';
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    errorLog += 'File loaded: ' + file.size + ' bytes\n';

    // Import pdfjs-dist
    let pdfjs: any;
    try {
      pdfjs = require('pdfjs-dist');
      errorLog += 'pdfjs-dist loaded\n';
    } catch (importErr) {
      errorLog += 'Failed to load pdfjs-dist: ' + String(importErr) + '\n';
      throw new Error('PDF library not available');
    }

    // Set up worker - don't require it, just set a path
    if (pdfjs.GlobalWorkerOptions) {
      try {
        // For Node.js, we can use the worker directly
        const workerPath = require.resolve('pdfjs-dist/build/pdf.worker.js');
        pdfjs.GlobalWorkerOptions.workerSrc = workerPath;
        errorLog += 'Worker path set: ' + workerPath + '\n';
      } catch (workerErr) {
        errorLog += 'Worker setup error (non-fatal): ' + String(workerErr) + '\n';
      }
    }

    errorLog += 'Loading PDF document...\n';
    
    // Load PDF document
    const pdf = await pdfjs.getDocument({ data: uint8Array }).promise;
    errorLog += 'PDF loaded: ' + pdf.numPages + ' pages\n';

    const textItems: TextItem[] = [];

    // Extract text from first 5 pages maximum for performance
    const maxPages = Math.min(5, pdf.numPages);

    // Extract text from each page
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        errorLog += `Processing page ${pageNum}...\n`;
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1 });

        // Process each text item
        if (textContent && textContent.items && Array.isArray(textContent.items)) {
          textContent.items.forEach((item: any, index: number) => {
            if (item.str && String(item.str).trim()) {
              const text = String(item.str).trim();
              
              // Calculate position based on item properties
              let x = 0, y = 0, width = 0, height = 12;

              if (item.transform && Array.isArray(item.transform) && item.transform.length >= 6) {
                x = item.transform[4] || 0;
                y = viewport.height - (item.transform[5] || 0) - (item.height || 12);
                width = item.width || 0;
                height = item.height || 12;
              } else if (item.x !== undefined && item.y !== undefined) {
                x = item.x;
                y = viewport.height - item.y - (item.height || 12);
                width = item.width || 0;
                height = item.height || 12;
              }

              textItems.push({
                id: `text-${pageNum}-${index}`,
                pageNumber: pageNum,
                text: text,
                x: Math.max(0, Math.round(x * 100) / 100),
                y: Math.max(0, Math.round(y * 100) / 100),
                width: Math.round(width * 100) / 100,
                height: Math.round(height * 100) / 100,
                fontSize: Math.round(item.height || 12),
                fontName: String(item.fontName || 'Arial'),
                color: String(item.color || '#000000'),
              });
            }
          });
        }
        errorLog += `Page ${pageNum}: ${textItems.filter(t => t.pageNumber === pageNum).length} text items\n`;
      } catch (pageError) {
        errorLog += `Error on page ${pageNum}: ${String(pageError)}\n`;
      }
    }

    errorLog += `Total: ${textItems.length} text items extracted\n`;

    return NextResponse.json({
      success: true,
      totalPages: pdf.numPages,
      textItems,
      message: `Extracted ${textItems.length} text items from ${pdf.numPages} pages`,
    });
  } catch (error) {
    errorLog += `FATAL ERROR: ${String(error)}\n`;
    console.error('Text extraction error:', error);
    console.error('Error log:', errorLog);

    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Failed to extract text from PDF',
        details: errorMessage,
        log: errorLog,
      },
      { status: 500 }
    );
  }
}
