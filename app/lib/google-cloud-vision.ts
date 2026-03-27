/**
 * Google Cloud Vision OCR Service
 * DEPRECATED - Not currently used
 * Placeholder for build compatibility
 */

export async function extractTextWithOCR() {
  throw new Error('Google Cloud Vision is deprecated');
}

export async function analyzeDocumentStructure() {
  throw new Error('Google Cloud Vision is deprecated');
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
  throw new Error('Google Cloud Vision is deprecated');
}

/**
 * Detect formatting characteristics from image
 * This is approximate - Google Vision doesn't provide exact font detection
 */
export function detectFormatting(
  textBlock: TextBlock,
  imageData?: any
): Partial<TextBlock> {
  throw new Error('Google Cloud Vision is deprecated');
}
