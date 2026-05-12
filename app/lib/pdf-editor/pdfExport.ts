import { PdfEdit } from '@/app/types/pdf-editor';

/**
 * Export PDF with all edits rendered
 * Note: This requires pdf-lib to be installed via npm
 * npm install pdf-lib
 */

export async function exportPdfWithEdits(
  pdfFile: File,
  edits: PdfEdit[],
  fileName: string = 'edited.pdf'
): Promise<void> {
  try {
    console.log('[PDF Export] Starting export...');
    
    // Import pdf-lib dynamically
    const pdflibModule = await import('pdf-lib');
    const { PDFDocument, rgb } = pdflibModule;

    // Read the PDF file as ArrayBuffer
    let arrayBuffer: ArrayBuffer;
    
    try {
      arrayBuffer = await pdfFile.arrayBuffer();
    } catch (err) {
      throw new Error(`Failed to read PDF file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    
    console.log('[PDF Export] ArrayBuffer type:', typeof arrayBuffer, 'instanceof ArrayBuffer:', arrayBuffer instanceof ArrayBuffer);

    if (!arrayBuffer) {
      throw new Error('PDF file could not be read - arrayBuffer is null');
    }

    if (!(arrayBuffer instanceof ArrayBuffer)) {
      console.error('[PDF Export] Invalid arrayBuffer:', arrayBuffer);
      throw new Error(`Invalid arrayBuffer type: ${typeof arrayBuffer}, value: ${String(arrayBuffer).substring(0, 50)}`);
    }

    if (arrayBuffer.byteLength === 0) {
      throw new Error('PDF file is empty');
    }

    console.log(`[PDF Export] ArrayBuffer loaded: ${arrayBuffer.byteLength} bytes`);

    // Convert to Uint8Array for pdf-lib
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log('[PDF Export] Uint8Array created:', uint8Array.length, 'bytes');

    if (!uint8Array || uint8Array.length === 0) {
      throw new Error('Failed to convert PDF to Uint8Array');
    }

    // Load the PDF document - pass the uint8Array directly, not wrapped in { data: ... }
    const pdfDoc = await PDFDocument.load(uint8Array);

    // Group edits by page
    const editsByPage = new Map<number, PdfEdit[]>();
    edits.forEach((edit) => {
      if (!editsByPage.has(edit.pageNumber)) {
        editsByPage.set(edit.pageNumber, []);
      }
      editsByPage.get(edit.pageNumber)!.push(edit);
    });

    // Apply edits to each page
    const pages = pdfDoc.getPages();
    for (const [pageNum, pageEdits] of editsByPage.entries()) {
      if (pageNum < 1 || pageNum > pages.length) continue;

      const page = pages[pageNum - 1];
      const { height } = page.getSize();

      // Sort edits by zIndex
      pageEdits.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

      for (const edit of pageEdits) {
        try {
          switch (edit.type) {
            case 'text':
              renderTextEdit(page, edit, height, rgb);
              break;
            case 'whiteout':
              renderWhiteoutEdit(page, edit, height, rgb);
              break;
            case 'shape':
              renderShapeEdit(page, edit, height, rgb);
              break;
            case 'highlight':
              renderHighlightEdit(page, edit, height, rgb);
              break;
            case 'image':
            case 'signature':
              await renderImagePlaceholder(page, edit, height, rgb, pdfDoc);
              break;
            case 'link':
              renderLinkPlaceholder(page, edit, height, rgb);
              break;
            case 'drawing':
              renderDrawingPlaceholder(page, edit, height, rgb);
              break;
          }
        } catch (err) {
          console.warn(`Failed to render edit ${edit.id}:`, err);
        }
      }
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('PDF export failed:', err);
    throw new Error(`Failed to export PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

function renderTextEdit(page: any, edit: PdfEdit, pageHeight: number, rgb: any): void {
  if (!edit.text) return;

  const y = pageHeight - edit.y - edit.height;
  const fontSize = Math.max(1, edit.fontSize || 12);
  const color = parseHexColor(edit.fontColor || '#000000');

  // First, draw a white rectangle to cover the original text
  page.drawRectangle({
    x: Math.max(0, edit.x),
    y: Math.max(0, y),
    width: Math.max(0, edit.width),
    height: Math.max(0, edit.height),
    color: rgb(1, 1, 1), // White
    opacity: 1,
  });

  // Then draw the new text on top
  page.drawText(edit.text, {
    x: Math.max(0, edit.x),
    y: Math.max(0, y),
    size: fontSize,
    color: rgb(
      Math.min(1, Math.max(0, color.r / 255)),
      Math.min(1, Math.max(0, color.g / 255)),
      Math.min(1, Math.max(0, color.b / 255))
    ),
    opacity: Math.min(1, Math.max(0, edit.opacity ?? 1)),
  });
}

function renderWhiteoutEdit(page: any, edit: PdfEdit, pageHeight: number, rgb: any): void {
  const y = pageHeight - edit.y - edit.height;

  page.drawRectangle({
    x: Math.max(0, edit.x),
    y: Math.max(0, y),
    width: Math.max(0, edit.width),
    height: Math.max(0, edit.height),
    color: rgb(1, 1, 1),
    opacity: Math.min(1, Math.max(0, edit.opacity ?? 1)),
  });
}

function renderShapeEdit(page: any, edit: PdfEdit, pageHeight: number, rgb: any): void {
  const y = pageHeight - edit.y - edit.height;
  const strokeColor = parseHexColor(edit.strokeColor || '#000000');
  const fillColor = edit.fillColor ? parseHexColor(edit.fillColor) : null;

  const options: any = {
    x: Math.max(0, edit.x),
    y: Math.max(0, y),
    width: Math.max(0, edit.width),
    height: Math.max(0, edit.height),
    borderColor: rgb(
      Math.min(1, Math.max(0, strokeColor.r / 255)),
      Math.min(1, Math.max(0, strokeColor.g / 255)),
      Math.min(1, Math.max(0, strokeColor.b / 255))
    ),
    borderWidth: Math.max(0.5, edit.strokeWidth || 2),
    opacity: Math.min(1, Math.max(0, edit.opacity ?? 1)),
  };

  if (fillColor) {
    options.color = rgb(
      Math.min(1, Math.max(0, fillColor.r / 255)),
      Math.min(1, Math.max(0, fillColor.g / 255)),
      Math.min(1, Math.max(0, fillColor.b / 255))
    );
  }

  if (edit.shapeType === 'circle') {
    page.drawEllipse(options);
  } else {
    page.drawRectangle(options);
  }
}

function renderHighlightEdit(page: any, edit: PdfEdit, pageHeight: number, rgb: any): void {
  const y = pageHeight - edit.y - edit.height;
  const color = parseHexColor(edit.fillColor || '#FFFF00');

  page.drawRectangle({
    x: Math.max(0, edit.x),
    y: Math.max(0, y),
    width: Math.max(0, edit.width),
    height: Math.max(0, edit.height),
    color: rgb(
      Math.min(1, Math.max(0, color.r / 255)),
      Math.min(1, Math.max(0, color.g / 255)),
      Math.min(1, Math.max(0, color.b / 255))
    ),
    opacity: 0.3,
  });
}

async function renderImagePlaceholder(page: any, edit: PdfEdit, pageHeight: number, rgb: any, pdfDoc: any): Promise<void> {
  const y = pageHeight - edit.y - edit.height;

  // If we have actual image data, try to embed it
  if (edit.imageData && edit.imageData.startsWith('data:image')) {
    try {
      // Extract base64 from data URL: "data:image/png;base64,..."
      const base64Parts = edit.imageData.split(',');
      if (base64Parts.length === 2) {
        const base64Data = base64Parts[1];
        
        // Convert base64 to bytes
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Embed the PNG image
        const pngImage = await pdfDoc.embedPng(bytes);
        
        // Draw the image on the page
        page.drawImage(pngImage, {
          x: Math.max(0, edit.x),
          y: Math.max(0, y),
          width: Math.max(0, edit.width),
          height: Math.max(0, edit.height),
          opacity: Math.min(1, Math.max(0, edit.opacity ?? 1)),
        });
        return;
      }
    } catch (err) {
      console.warn('[PDF Export] Failed to embed image:', err);
      // Fall back to placeholder if image embedding fails
    }
  }

  // Fallback: draw placeholder
  page.drawRectangle({
    x: Math.max(0, edit.x),
    y: Math.max(0, y),
    width: Math.max(0, edit.width),
    height: Math.max(0, edit.height),
    color: rgb(0.9, 0.9, 0.9),
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 1,
  });

  page.drawText('[Image]', {
    x: edit.x + 5,
    y: y + edit.height / 2 - 5,
    size: 10,
    color: rgb(0.5, 0.5, 0.5),
  });
}

function renderLinkPlaceholder(page: any, edit: PdfEdit, pageHeight: number, rgb: any): void {
  const y = pageHeight - edit.y - edit.height;

  page.drawRectangle({
    x: Math.max(0, edit.x),
    y: Math.max(0, y),
    width: Math.max(0, edit.width),
    height: Math.max(0, edit.height),
    color: rgb(1, 1, 1),
    borderColor: rgb(0, 0.4, 1),
    borderWidth: 1,
  });

  page.drawText('[Link]', {
    x: edit.x + 5,
    y: y + edit.height / 2 - 5,
    size: 10,
    color: rgb(0, 0.4, 1),
  });
}

function renderDrawingPlaceholder(page: any, edit: PdfEdit, pageHeight: number, rgb: any): void {
  const y = pageHeight - edit.y - edit.height;
  const color = parseHexColor(edit.strokeColor || '#000000');

  page.drawLine({
    start: { x: Math.max(0, edit.x), y: Math.max(0, y + edit.height) },
    end: { x: Math.max(0, edit.x + edit.width), y: Math.max(0, y) },
    color: rgb(
      Math.min(1, Math.max(0, color.r / 255)),
      Math.min(1, Math.max(0, color.g / 255)),
      Math.min(1, Math.max(0, color.b / 255))
    ),
    thickness: Math.max(0.5, edit.strokeWidth || 2),
    opacity: Math.min(1, Math.max(0, edit.opacity ?? 1)),
  });
}

function parseHexColor(hex: string): { r: number; g: number; b: number } {
  try {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#000000');
    if (!result) {
      return { r: 0, g: 0, b: 0 };
    }
    return {
      r: parseInt(result[1], 16) || 0,
      g: parseInt(result[2], 16) || 0,
      b: parseInt(result[3], 16) || 0,
    };
  } catch {
    return { r: 0, g: 0, b: 0 };
  }
}
