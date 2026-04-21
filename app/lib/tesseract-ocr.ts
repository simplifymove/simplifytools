/**
 * Tesseract.js OCR Service
 * Free, open-source OCR using Tesseract.js
 * Supports PDF, images with no API keys or cost
 */

import Tesseract from 'tesseract.js';
// @ts-expect-error - pdfjs-dist build files don't have type declarations
// Use dynamic import for pdfjs-dist to handle Node.js environments
let pdfjsLib: any = null;

// Initialize PDF.js only when needed
async function initPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  try {
    pdfjsLib = await import('pdfjs-dist');
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
    }
  } catch (err) {
    console.error('Failed to load pdfjs-dist:', err);
  }
  return pdfjsLib;
}

export interface TextBlock {
  text: string;
  confidence: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface OCRResult {
  fullText: string;
  textBlocks: TextBlock[];
  confidence: number;
  pages: number;
}

/**
 * Convert PDF buffer to images, then extract text using Tesseract
 */
export async function extractTextFromPDF(
  fileBuffer: Buffer,
  mimeType: string = 'application/pdf'
): Promise<OCRResult> {
  try {
    // For images, use Tesseract directly
    if (mimeType.startsWith('image/')) {
      return await extractTextFromImage(fileBuffer);
    }

    // For PDF, convert pages to images first
    if (mimeType === 'application/pdf') {
      return await extractTextFromPDFPages(fileBuffer);
    }

    throw new Error('Unsupported file type');
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

/**
 * Extract text from image using Tesseract
 */
async function extractTextFromImage(
  fileBuffer: Buffer
): Promise<OCRResult> {
  try {
    // Convert buffer to base64
    const imageData = fileBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${imageData}`;

    // Run Tesseract OCR
    const result = await Tesseract.recognize(imageUrl, 'eng', {
      logger: (m: any) => {
        // Log progress if needed
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    // Extract text and confidence
    const fullText = result.data.text;
    const overallConfidence = result.data.confidence;

    // Parse words from result for text blocks
    const words = result.data.words || [];
    const textBlocks: TextBlock[] = words
      .filter((word: any) => word.text.trim().length > 0)
      .map((word: any) => ({
        text: word.text,
        confidence: word.confidence / 100, // Normalize to 0-1
        bounds: {
          x: word.bbox.x0,
          y: word.bbox.y0,
          width: word.bbox.x1 - word.bbox.x0,
          height: word.bbox.y1 - word.bbox.y0,
        },
      }));

    return {
      fullText,
      textBlocks,
      confidence: overallConfidence,
      pages: 1,
    };
  } catch (error) {
    console.error('Error in OCR image extraction:', error);
    throw error;
  }
}

/**
 * Extract text from PDF by converting pages to images
 */
async function extractTextFromPDFPages(
  fileBuffer: Buffer
): Promise<OCRResult> {
  try {
    // Initialize PDF.js
    const pdfjs = await initPdfJs();
    if (!pdfjs || !pdfjs.getDocument) {
      throw new Error('Failed to initialize PDF.js');
    }

    // Load PDF document
    const pdf = await pdfjs.getDocument({ data: fileBuffer }).promise;
    const pageCount = Math.min(pdf.numPages, 50); // Limit to 50 pages to avoid timeout

    const allTextBlocks: TextBlock[] = [];
    let totalConfidence = 0;
    let processedPages = 0;

    // Process each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 }); // Higher scale for better OCR

        // Create canvas
        const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
        if (!canvas) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d')!;
        await (page.render({ canvas, viewport }) as any).promise;

        // Convert canvas to image and run OCR
        const imageData = canvas.toDataURL('image/png');

        const result = await Tesseract.recognize(imageData, 'eng', {
          logger: (m: any) => {
            if (m.status === 'recognizing text') {
              console.log(`Page ${pageNum}/${pageCount} - OCR: ${Math.round(m.progress * 100)}%`);
            }
          },
        });

        // Collect text blocks with page offset
        const words = result.data.words || [];
        const pageBlocks = words
          .filter((word: any) => word.text.trim().length > 0)
          .map((word: any) => ({
            text: word.text,
            confidence: word.confidence / 100,
            bounds: {
              x: word.bbox.x0,
              y: word.bbox.y0 + (pageNum - 1) * viewport.height, // Add page offset
              width: word.bbox.x1 - word.bbox.x0,
              height: word.bbox.y1 - word.bbox.y0,
            },
          }));

        allTextBlocks.push(...pageBlocks);
        totalConfidence += result.data.confidence;
        processedPages++;
      } catch (pageError) {
        console.warn(`Error processing page ${pageNum}:`, pageError);
        continue;
      }
    }

    // Combine all text in order
    const fullText = allTextBlocks
      .sort((a, b) => {
        // Sort by Y then X position
        if (Math.abs(a.bounds.y - b.bounds.y) > 20) {
          return a.bounds.y - b.bounds.y;
        }
        return a.bounds.x - b.bounds.x;
      })
      .map((block) => block.text)
      .join(' ');

    const averageConfidence =
      processedPages > 0 ? totalConfidence / processedPages : 0;

    return {
      fullText,
      textBlocks: allTextBlocks,
      confidence: averageConfidence,
      pages: processedPages,
    };
  } catch (error) {
    console.error('Error in PDF page extraction:', error);
    throw error;
  }
}
