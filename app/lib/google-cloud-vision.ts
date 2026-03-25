/**
 * Google Cloud Vision OCR Service
 * Handles PDF/image OCR with text extraction and formatting detection
 */

import vision from '@google-cloud/vision';

// Initialize Google Cloud Vision client
const client = new vision.ImageAnnotatorClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: process.env.GOOGLE_CLOUD_CREDENTIALS
    ? JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
    : undefined,
});

export interface TextBlock {
  text: string;
  confidence: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  font?: {
    name?: string;
    size?: number;
    bold?: boolean;
    italic?: boolean;
  };
  color?: {
    r: number;
    g: number;
    b: number;
  };
}

export interface OCRResult {
  fullText: string;
  textBlocks: TextBlock[];
  confidence: number;
  pages: number;
}

/**
 * Extract text from PDF or image using Google Cloud Vision
 */
export async function extractTextFromPDF(
  fileBuffer: Buffer,
  mimeType: string = 'application/pdf'
): Promise<OCRResult> {
  try {
    const request = {
      requests: [
        {
          image: {
            content: fileBuffer.toString('base64'),
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION',
            },
            {
              type: 'TEXT_DETECTION',
            },
          ],
          imageContext: {
            languageHints: ['en'],
          },
        },
      ],
    };

    const [result] = await client.batchAnnotateImages(request);
    const responses = result.responses;

    if (!responses || responses.length === 0) {
      throw new Error('No response from Google Cloud Vision');
    }

    const response = responses[0];

    if (response.error) {
      throw new Error(`Google Cloud Vision Error: ${response.error.message}`);
    }

    // Extract full text
    const fullTextAnnotation = response.fullTextAnnotation;
    const fullText = fullTextAnnotation?.text || '';

    // Extract individual text blocks with formatting info
    const textBlocks: TextBlock[] = [];
    let totalConfidence = 0;

    if (response.textAnnotations && response.textAnnotations.length > 0) {
      response.textAnnotations.forEach((annotation, index) => {
        // Skip the first annotation as it's the full text
        if (index === 0) return;

        const vertices = annotation.boundingPoly?.vertices || [];
        if (vertices.length === 0) return;

        // Calculate bounding box
        const xCoords = vertices.map((v: any) => v.x || 0);
        const yCoords = vertices.map((v: any) => v.y || 0);
        const minX = Math.min(...xCoords);
        const minY = Math.min(...yCoords);
        const maxX = Math.max(...xCoords);
        const maxY = Math.max(...yCoords);

        const block: TextBlock = {
          text: annotation.description || '',
          confidence: annotation.confidence || 0,
          bounds: {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
          },
        };

        textBlocks.push(block);
        totalConfidence += block.confidence;
      });
    }

    // Alternative: Use document text detection for better formatting
    if (fullTextAnnotation?.pages) {
      // Process pages for better structure
      fullTextAnnotation.pages.forEach((page: any) => {
        if (page.blocks) {
          page.blocks.forEach((block: any) => {
            block.paragraphs?.forEach((paragraph: any) => {
              paragraph.words?.forEach((word: any) => {
                if (word.symbols) {
                  // Could extract font properties from symbols if available
                }
              });
            });
          });
        }
      });
    }

    const averageConfidence =
      textBlocks.length > 0 ? totalConfidence / textBlocks.length : 0;

    return {
      fullText,
      textBlocks,
      confidence: averageConfidence,
      pages: fullTextAnnotation?.pages?.length || 1,
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

/**
 * Detect formatting characteristics from image
 * This is approximate - Google Vision doesn't provide exact font detection
 */
export function detectFormatting(
  textBlock: TextBlock,
  imageData?: any
): Partial<TextBlock> {
  const formatting: Partial<TextBlock> = { ...textBlock };

  // Default formatting (since Vision doesn't provide exact font info)
  formatting.font = {
    name: 'Calibri', // Default font for business documents
    size: Math.max(10, Math.min(72, textBlock.bounds.height * 0.8)), // Estimate from height
    bold: false,
    italic: false,
  };

  // Confidence-based quality assessment
  if (textBlock.confidence > 0.95) {
    formatting.font.bold = true; // Highly confident text is often bold
  }

  // Default color (black)
  formatting.color = { r: 0, g: 0, b: 0 };

  return formatting;
}
