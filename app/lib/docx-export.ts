/**
 * DOCX Export Utility
 * Converts OCR extracted text to editable DOCX format with formatting
 */

import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType } from 'docx';

export interface FormattedParagraph {
  text: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

/**
 * Create a DOCX document from extracted text
 */
export async function createDocxFromText(
  fullText: string,
  fileName: string = 'extracted-text',
  metadata?: {
    sourceFile?: string;
    extractionDate?: Date;
    confidence?: number;
  }
): Promise<Buffer> {
  // Parse text into paragraphs
  const paragraphs = fullText
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((text) =>
      new Paragraph({
        text: text.trim(),
        spacing: { line: 240, lineRule: 'auto' },
        style: 'Normal',
      })
    );

  // Add metadata if provided
  const docParagraphs = [];

  if (metadata) {
    docParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Extracted from: ${metadata.sourceFile || 'Unknown'}`,
            italics: true,
            size: 18,
            color: '808080',
          }),
        ],
        spacing: { line: 240 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Date: ${metadata.extractionDate?.toLocaleString() || 'Unknown'}`,
            italics: true,
            size: 18,
            color: '808080',
          }),
        ],
        spacing: { line: 240 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Confidence: ${metadata.confidence || 'N/A'}%`,
            italics: true,
            size: 18,
            color: '808080',
          }),
        ],
        spacing: { line: 240 },
      }),
      new Paragraph({ text: '' }) // Blank line
    );
  }

  // Combine all paragraphs
  const allParagraphs = [...docParagraphs, ...paragraphs];

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: allParagraphs,
      },
    ],
  });

  // Generate and return buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

/**
 * Create a formatted DOCX with text blocks positioned
 */
export async function createFormattedDocxFromBlocks(
  textBlocks: any[],
  fileName: string = 'extracted-text'
): Promise<Buffer> {
  // Group text blocks by Y position (roughly by line)
  const lines: Map<number, any[]> = new Map();

  textBlocks.forEach((block) => {
    const lineY = Math.round(block.bounds.y / 20) * 20; // Group by approximate line
    if (!lines.has(lineY)) {
      lines.set(lineY, []);
    }
    lines.get(lineY)!.push(block);
  });

  // Sort lines by Y position
  const sortedLines = Array.from(lines.entries())
    .sort((a, b) => a[0] - b[0])
    .map((entry) => entry[1]);

  // Create paragraphs from lines
  const paragraphs = sortedLines.map((lineBlocks) => {
    // Sort blocks by X position (left to right)
    lineBlocks.sort((a, b) => a.bounds.x - b.bounds.x);

    // Create text runs for this line
    const runs = lineBlocks.map((block) => {
      const font = block.font || {};
      return new TextRun({
        text: block.text + ' ',
        font: font.name || 'Calibri',
        size: (font.size || 12) * 2, // Convert to half-points
        bold: font.bold || false,
        italics: font.italic || false,
        color: block.color ? rgbToHex(block.color.r, block.color.g, block.color.b) : '000000',
      });
    });

    return new Paragraph({
      children: runs,
      spacing: { line: 240 },
    });
  });

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs.length > 0 ? paragraphs : [new Paragraph('No text extracted')],
      },
    ],
  });

  // Generate and return buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

/**
 * Convert RGB to Hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase();
}
