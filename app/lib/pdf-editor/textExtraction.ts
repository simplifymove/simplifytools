'use client';

export interface ExtractedText {
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

export interface EditedText extends ExtractedText {
  editedText?: string;
  isEdited?: boolean;
}

/**
 * Extract text from a PDF file using client-side PDF.js
 * Creates a SEPARATE PDF document instance to avoid canvas conflicts
 */
export async function extractTextFromPdf(file: File): Promise<{
  totalPages: number;
  textItems: ExtractedText[];
}> {
  // Get PDF.js from global scope (loaded from CDN in edit-pdf page)
  const pdfjsLib = (window as any).pdfjsLib;
  
  if (!pdfjsLib) {
    throw new Error('PDF library not loaded. Please refresh the page.');
  }

  try {
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // IMPORTANT: Create a NEW PDF document instance for text extraction
    // This is separate from the one used for canvas rendering
    // This prevents "Cannot use the same canvas during multiple render() operations" error
    const pdf = await pdfjsLib.getDocument({ 
      data: uint8Array,
      disableFontFace: true,  // Prevent font rendering issues
    }).promise;

    const textItems: ExtractedText[] = [];

    // Extract text from first 10 pages (limit for performance)
    const maxPages = Math.min(10, pdf.numPages);

    // Extract text from each page
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        
        // Get text content WITHOUT rendering to canvas
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1 });

        // Process each text item
        if (textContent && textContent.items && Array.isArray(textContent.items)) {
          textContent.items.forEach((item: any, index: number) => {
            if (item.str && String(item.str).trim()) {
              const text = String(item.str).trim();

              // Calculate position based on item properties
              let x = 0,
                y = 0,
                width = 0,
                height = 12;

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

        // Clean up page resources to prevent memory leaks
        page.cleanup();
      } catch (pageError) {
        console.error(`Error extracting text from page ${pageNum}:`, pageError);
        // Continue with next page
      }
    }

    // Clean up PDF document resources
    await pdf.destroy();

    return {
      totalPages: pdf.numPages,
      textItems,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to extract text: ${errorMessage}`);
  }
}

/**
 * Group extracted text by page for easier UI rendering
 */
export function groupTextByPage(
  textItems: ExtractedText[]
): Record<number, ExtractedText[]> {
  return textItems.reduce((acc, item) => {
    if (!acc[item.pageNumber]) {
      acc[item.pageNumber] = [];
    }
    acc[item.pageNumber].push(item);
    return acc;
  }, {} as Record<number, ExtractedText[]>);
}

/**
 * Search for text across all extracted text
 */
export function searchText(
  textItems: ExtractedText[],
  query: string
): ExtractedText[] {
  if (!query) return textItems;
  
  const lowerQuery = query.toLowerCase();
  return textItems.filter((item) =>
    item.text.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Replace text in extracted items
 */
export function replaceText(
  textItems: EditedText[],
  textId: string,
  newText: string
): EditedText[] {
  return textItems.map((item) =>
    item.id === textId
      ? {
          ...item,
          editedText: newText,
          isEdited: newText !== item.text,
        }
      : item
  );
}

/**
 * Get edited text for export
 * Returns map of text ID to edited content
 */
export function getEditedTextMap(
  textItems: EditedText[]
): Record<string, string> {
  return textItems.reduce((acc, item) => {
    if (item.isEdited && item.editedText) {
      acc[item.id] = item.editedText;
    }
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Format text item for display in UI
 */
export function formatTextItem(item: ExtractedText): string {
  return `Page ${item.pageNumber}: "${item.text}" (${item.fontSize}pt)`;
}
