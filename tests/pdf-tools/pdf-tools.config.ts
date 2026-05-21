/**
 * PDF Tools Test Configuration
 * Defines all PDF tools and their test cases
 */

export interface PdfToolTestConfig {
  slug: string;
  title: string;
  url: string; // Relative URL path
  inputType: 'single-file' | 'multi-file' | 'url';
  files?: string[]; // Fixture file names (e.g., 'valid.pdf', 'sample.jpg')
  url_input?: string; // For URL-based tools
  options?: Record<string, any>; // Tool-specific options
  expectedOutputType: 'pdf' | 'png' | 'jpg' | 'zip' | 'txt' | 'csv' | 'xlsx' | 'docx' | 'html' | 'epub' | 'mobi' | 'azw3' | 'pptx' | 'rtf';
  skip?: boolean; // Skip this tool's tests (complex UI, requires manual interaction, etc.)
  
  // Test cases
  positiveTests: Array<{
    name: string;
    files?: string[];
    url?: string;
    options?: Record<string, any>;
    description?: string;
  }>;
  
  negativeTests: Array<{
    name: string;
    files?: string[];
    options?: Record<string, any>;
    url?: string;
    expectedError?: string;
    description?: string;
  }>;
}

export const pdfToolsTestConfig: Record<string, PdfToolTestConfig> = {
  // ===== CORE ENGINE TOOLS =====
  'merge-pdf': {
    slug: 'merge-pdf',
    title: 'Merge PDF',
    url: '/all-tools/pdf/merge-pdf',
    inputType: 'multi-file',
    files: ['valid.pdf', 'multipage.pdf'],
    expectedOutputType: 'pdf',
    positiveTests: [
      {
        name: 'Merge two valid PDFs',
        files: ['valid.pdf', 'multipage.pdf'],
        description: 'Should merge two valid PDF files into one',
      },
      {
        name: 'Merge multipage PDF with single page',
        files: ['multipage.pdf', 'valid.pdf'],
        description: 'Should merge in the order provided',
      },
    ],
    negativeTests: [
      {
        name: 'No files provided',
        files: [],
        expectedError: 'at least 2 PDF files',
      },
      {
        name: 'Only one file provided',
        files: ['valid.pdf'],
        expectedError: 'at least 2 PDF files',
      },
      {
        name: 'Wrong file format',
        files: ['sample.jpg'],
        expectedError: 'PDF',
      },
    ],
  },

  'split-pdf': {
    slug: 'split-pdf',
    title: 'Split PDF',
    url: '/all-tools/pdf/split-pdf',
    inputType: 'single-file',
    files: ['multipage.pdf'],
    expectedOutputType: 'zip',
    positiveTests: [
      {
        name: 'Split all pages',
        files: ['multipage.pdf'],
        options: { mode: 'all' },
        description: 'Should split PDF into individual page files',
      },
      {
        name: 'Split page range',
        files: ['multipage.pdf'],
        options: { mode: 'range', pageRange: '1-3' },
        description: 'Should split only pages 1-3',
      },
    ],
    negativeTests: [
      {
        name: 'No PDF provided',
        files: [],
        expectedError: 'Please upload',
      },
      {
        name: 'Invalid page range',
        files: ['multipage.pdf'],
        options: { mode: 'range', pageRange: 'invalid' },
        expectedError: 'page',
      },
    ],
  },

  'rotate-pdf': {
    slug: 'rotate-pdf',
    title: 'Rotate PDF',
    url: '/all-tools/pdf/rotate-pdf',
    inputType: 'single-file',
    files: ['valid.pdf'],
    options: { angle: 90 },
    expectedOutputType: 'pdf',
    positiveTests: [
      {
        name: 'Rotate 90 degrees',
        files: ['valid.pdf'],
        options: { angle: 90 },
        description: 'Should rotate PDF pages 90 degrees clockwise',
      },
      {
        name: 'Rotate 180 degrees',
        files: ['valid.pdf'],
        options: { angle: 180 },
        description: 'Should rotate PDF pages 180 degrees',
      },
      {
        name: 'Rotate 270 degrees',
        files: ['valid.pdf'],
        options: { angle: 270 },
        description: 'Should rotate PDF pages 270 degrees clockwise',
      },
    ],
    negativeTests: [
      {
        name: 'Invalid angle (45 degrees)',
        files: ['valid.pdf'],
        options: { angle: 45 },
        expectedError: 'angle',
      },
      {
        name: 'No file provided',
        files: [],
        expectedError: 'Please upload',
      },
    ],
  },

  'rearrange-pdf': {
    slug: 'rearrange-pdf',
    title: 'Rearrange PDF',
    url: '/all-tools/pdf/rearrange-pdf',
    inputType: 'single-file',
    files: ['multipage.pdf'],
    options: { pageOrder: '0,2,1,3,4' },
    expectedOutputType: 'pdf',
    positiveTests: [
      {
        name: 'Rearrange pages',
        files: ['multipage.pdf'],
        options: { pageOrder: '0,2,1,3,4' },
        description: 'Should rearrange pages in specified order',
      },
    ],
    negativeTests: [
      {
        name: 'Missing page order',
        files: ['multipage.pdf'],
        options: { pageOrder: '' },
        expectedError: 'page',
      },
    ],
  },

  'crop-pdf': {
    slug: 'crop-pdf',
    title: 'Crop PDF',
    url: '/all-tools/pdf/crop-pdf',
    inputType: 'single-file',
    files: ['valid.pdf'],
    expectedOutputType: 'pdf',
    positiveTests: [
      {
        name: 'Crop PDF pages',
        files: ['valid.pdf'],
        description: 'Should crop PDF pages',
      },
    ],
    negativeTests: [
      {
        name: 'No file provided',
        files: [],
        expectedError: 'Please upload',
      },
    ],
  },

  'pdf-page-deleter': {
    slug: 'pdf-page-deleter',
    title: 'PDF Page Deleter',
    url: '/all-tools/pdf/pdf-page-deleter',
    inputType: 'single-file',
    files: ['multipage.pdf'],
    options: { pagesToDelete: '1' },
    expectedOutputType: 'pdf',
    positiveTests: [
      {
        name: 'Delete single page',
        files: ['multipage.pdf'],
        options: { pagesToDelete: '1' },
        description: 'Should delete page 1',
      },
      {
        name: 'Delete multiple pages',
        files: ['multipage.pdf'],
        options: { pagesToDelete: '1,3' },
        description: 'Should delete pages 1 and 3',
      },
    ],
    negativeTests: [
      {
        name: 'Missing pages to delete',
        files: ['multipage.pdf'],
        options: { pagesToDelete: '' },
        expectedError: 'specify pages',
      },
    ],
  },

  'create-pdf': {
    slug: 'create-pdf',
    title: 'Create PDF',
    url: '/all-tools/pdf/create-pdf',
    inputType: 'multi-file',
    files: ['sample.jpg', 'sample.png'],
    expectedOutputType: 'pdf',
    positiveTests: [
      {
        name: 'Create PDF from images',
        files: ['sample.jpg', 'sample.png'],
        description: 'Should create PDF from JPG and PNG images',
      },
      {
        name: 'Create blank PDF',
        files: [],
        options: { numPages: 3 },
        description: 'Should create blank PDF with 3 pages',
      },
    ],
    negativeTests: [
      {
        name: 'No files or pages',
        files: [],
        options: { numPages: 0 },
        expectedError: 'at least one',
      },
    ],
  },

  // ===== SECURITY ENGINE TOOLS =====
  'protect-pdf': {
    slug: 'protect-pdf',
    title: 'Protect PDF',
    url: '/all-tools/pdf/protect-pdf',
    inputType: 'single-file',
    files: ['valid.pdf'],
    options: { userPassword: 'test123' },
    expectedOutputType: 'pdf',
    positiveTests: [
      {
        name: 'Protect PDF with user password',
        files: ['valid.pdf'],
        options: { userPassword: 'test123' },
        description: 'Should protect PDF with password',
      },
    ],
    negativeTests: [
      {
        name: 'Missing password',
        files: ['valid.pdf'],
        options: { userPassword: '' },
        expectedError: 'password',
      },
    ],
  },

  'unlock-pdf': {
    slug: 'unlock-pdf',
    title: 'Unlock PDF',
    url: '/all-tools/pdf/unlock-pdf',
    inputType: 'single-file',
    files: ['valid.pdf'], // In real scenario, would be protected PDF
    options: { password: 'test123' },
    expectedOutputType: 'pdf',
    positiveTests: [
      {
        name: 'Unlock PDF',
        files: ['valid.pdf'],
        options: { password: 'test123' },
        description: 'Should attempt to unlock PDF',
      },
    ],
    negativeTests: [
      {
        name: 'Missing password',
        files: ['valid.pdf'],
        options: { password: '' },
        expectedError: 'password',
      },
    ],
  },

  'pdf-watermark-remover': {
    slug: 'pdf-watermark-remover',
    title: 'PDF Watermark Remover',
    url: '/all-tools/pdf/pdf-watermark-remover',
    inputType: 'single-file',
    files: ['valid.pdf'],
    expectedOutputType: 'pdf',
    positiveTests: [
      {
        name: 'Remove watermarks',
        files: ['valid.pdf'],
        description: 'Should remove watermarks from PDF',
      },
    ],
    negativeTests: [
      {
        name: 'No file provided',
        files: [],
        expectedError: 'Please upload',
      },
    ],
  },

  // ===== CONVERT ENGINE TOOLS =====
  'pdf-to-jpg': {
    slug: 'pdf-to-jpg',
    title: 'PDF to JPG',
    url: '/all-tools/pdf/pdf-to-jpg',
    inputType: 'single-file',
    files: ['valid.pdf'],
    options: { dpi: 150, pageMode: 'all' },
    expectedOutputType: 'zip',
    positiveTests: [
      {
        name: 'Convert PDF to JPG',
        files: ['valid.pdf'],
        options: { dpi: 150, pageMode: 'all' },
        description: 'Should convert PDF pages to JPG images',
      },
    ],
    negativeTests: [
      {
        name: 'No file provided',
        files: [],
        expectedError: 'Please upload',
      },
    ],
  },

  'pdf-to-png': {
    slug: 'pdf-to-png',
    title: 'PDF to PNG',
    url: '/all-tools/pdf/pdf-to-png',
    inputType: 'single-file',
    files: ['valid.pdf'],
    options: { dpi: 150, pageMode: 'all' },
    expectedOutputType: 'zip',
    positiveTests: [
      {
        name: 'Convert PDF to PNG',
        files: ['valid.pdf'],
        options: { dpi: 150, pageMode: 'all' },
        description: 'Should convert PDF pages to PNG images',
      },
    ],
    negativeTests: [
      {
        name: 'No file provided',
        files: [],
        expectedError: 'Please upload',
      },
    ],
  },

  'jpg-to-pdf': {
    slug: 'jpg-to-pdf',
    title: 'JPG to PDF',
    url: '/all-tools/pdf/jpg-to-pdf',
    inputType: 'multi-file',
    files: ['sample.jpg'],
    expectedOutputType: 'pdf',
    positiveTests: [
      {
        name: 'Convert JPG to PDF',
        files: ['sample.jpg'],
        description: 'Should convert JPG image to PDF',
      },
    ],
    negativeTests: [
      {
        name: 'No file provided',
        files: [],
        expectedError: 'image',
      },
    ],
  },

  'png-to-pdf': {
    slug: 'png-to-pdf',
    title: 'PNG to PDF',
    url: '/all-tools/pdf/png-to-pdf',
    inputType: 'multi-file',
    files: ['sample.png'],
    expectedOutputType: 'pdf',
    positiveTests: [
      {
        name: 'Convert PNG to PDF',
        files: ['sample.png'],
        description: 'Should convert PNG image to PDF',
      },
    ],
    negativeTests: [
      {
        name: 'No file provided',
        files: [],
        expectedError: 'image',
      },
    ],
  },

  'pdf-to-text': {
    slug: 'pdf-to-text',
    title: 'PDF to Text',
    url: '/all-tools/pdf/pdf-to-text',
    inputType: 'single-file',
    files: ['valid.pdf'],
    expectedOutputType: 'txt',
    positiveTests: [
      {
        name: 'Extract text from PDF',
        files: ['valid.pdf'],
        description: 'Should extract text from PDF',
      },
    ],
    negativeTests: [
      {
        name: 'No file provided',
        files: [],
        expectedError: 'Please upload',
      },
    ],
  },

  'compress-pdf': {
    slug: 'compress-pdf',
    title: 'Compress PDF',
    url: '/all-tools/pdf/compress-pdf',
    inputType: 'single-file',
    files: ['valid.pdf'],
    options: { level: 'medium' },
    expectedOutputType: 'pdf',
    positiveTests: [
      {
        name: 'Compress PDF',
        files: ['valid.pdf'],
        options: { level: 'medium' },
        description: 'Should compress PDF file',
      },
    ],
    negativeTests: [
      {
        name: 'No file provided',
        files: [],
        expectedError: 'Please upload',
      },
    ],
  },

  'url-to-pdf': {
    slug: 'url-to-pdf',
    title: 'URL to PDF',
    url: '/all-tools/pdf/url-to-pdf',
    inputType: 'url',
    url_input: 'https://example.com',
    expectedOutputType: 'pdf',
    positiveTests: [
      {
        name: 'Convert URL to PDF',
        url: 'https://example.com',
        description: 'Should convert webpage to PDF',
      },
    ],
    negativeTests: [
      {
        name: 'Invalid URL',
        url: 'not-a-url',
        expectedError: 'valid URL',
      },
      {
        name: 'No URL provided',
        url: '',
        expectedError: 'required',
      },
    ],
  },

  // ===== EDIT ENGINE TOOLS =====
  'edit-pdf': {
    slug: 'edit-pdf',
    title: 'Edit PDF',
    url: '/all-tools/pdf/edit-pdf',
    inputType: 'single-file',
    files: ['valid.pdf'],
    expectedOutputType: 'pdf',
    skip: true, // Requires dynamic component loading and complex client-side rendering
    positiveTests: [
      {
        name: 'Edit PDF',
        files: ['valid.pdf'],
        description: 'Should open PDF in editor',
      },
    ],
    negativeTests: [
      {
        name: 'No file provided',
        files: [],
        expectedError: 'Please upload',
      },
    ],
  },

  'add-text': {
    slug: 'add-text',
    title: 'Add Text to PDF',
    url: '/all-tools/pdf/add-text',
    inputType: 'single-file',
    files: ['valid.pdf'],
    options: { text: 'Sample Text', pageNumber: 1, x: 50, y: 50, fontSize: 12 },
    expectedOutputType: 'pdf',
    skip: true, // Requires dynamic component loading
    positiveTests: [
      {
        name: 'Add text to PDF',
        files: ['valid.pdf'],
        options: { text: 'Sample Text', pageNumber: 1, x: 50, y: 50, fontSize: 12 },
        description: 'Should add text to PDF page',
      },
    ],
    negativeTests: [
      {
        name: 'No text provided',
        files: ['valid.pdf'],
        options: { text: '', pageNumber: 1 },
        expectedError: 'text',
      },
    ],
  },

  'add-watermark': {
    slug: 'add-watermark',
    title: 'Add Watermark',
    url: '/all-tools/pdf/add-watermark',
    inputType: 'single-file',
    files: ['valid.pdf'],
    options: { text: 'CONFIDENTIAL' },
    expectedOutputType: 'pdf',
    positiveTests: [
      {
        name: 'Add watermark to PDF',
        files: ['valid.pdf'],
        options: { text: 'CONFIDENTIAL' },
        description: 'Should add watermark to PDF',
      },
    ],
    negativeTests: [
      {
        name: 'No file provided',
        files: [],
        expectedError: 'Please upload',
      },
    ],
  },

  'add-numbers-to-pdf': {
    slug: 'add-numbers-to-pdf',
    title: 'Add Page Numbers',
    url: '/all-tools/pdf/add-numbers-to-pdf',
    inputType: 'single-file',
    files: ['multipage.pdf'],
    options: { position: 'bottom-right' },
    expectedOutputType: 'pdf',
    positiveTests: [
      {
        name: 'Add page numbers to PDF',
        files: ['multipage.pdf'],
        options: { position: 'bottom-right' },
        description: 'Should add page numbers',
      },
    ],
    negativeTests: [
      {
        name: 'No file provided',
        files: [],
        expectedError: 'Please upload',
      },
    ],
  },

  'esign-pdf': {
    slug: 'esign-pdf',
    title: 'eSign PDF',
    url: '/all-tools/pdf/esign-pdf',
    inputType: 'single-file',
    files: ['valid.pdf'],
    options: { signatureText: 'John Doe', pageNumber: 1 },
    expectedOutputType: 'pdf',
    skip: true, // Requires dynamic component loading with signature pad
    positiveTests: [
      {
        name: 'Add signature to PDF',
        files: ['valid.pdf'],
        options: { signatureText: 'John Doe', pageNumber: 1 },
        description: 'Should add electronic signature',
      },
    ],
    negativeTests: [
      {
        name: 'No file provided',
        files: [],
        expectedError: 'Please upload',
      },
    ],
  },

  // ===== OCR & ADVANCED TOOLS =====
  'ocr-to-text': {
    slug: 'ocr-to-text',
    title: 'PDF OCR',
    url: '/all-tools/pdf/ocr-to-text',
    inputType: 'single-file',
    files: ['scanned.pdf'],
    options: { language: 'eng', outputFormat: 'docx' },
    expectedOutputType: 'docx',
    skip: true, // Requires complex file handling and tesseract.js
    positiveTests: [
      {
        name: 'OCR scanned PDF',
        files: ['scanned.pdf'],
        options: { language: 'eng', outputFormat: 'docx' },
        description: 'Should extract text from scanned PDF',
      },
    ],
    negativeTests: [
      {
        name: 'No file provided',
        files: [],
        expectedError: 'Please upload',
      },
    ],
  },

  'pdf-deskew': {
    slug: 'pdf-deskew',
    title: 'PDF Deskew',
    url: '/all-tools/pdf/pdf-deskew',
    inputType: 'single-file',
    files: ['scanned.pdf'],
    expectedOutputType: 'pdf',
    positiveTests: [
      {
        name: 'Deskew scanned PDF',
        files: ['scanned.pdf'],
        description: 'Should straighten tilted pages',
      },
    ],
    negativeTests: [
      {
        name: 'No file provided',
        files: [],
        expectedError: 'Please upload',
      },
    ],
  },

  'extract-text-from-pdf': {
    slug: 'extract-text-from-pdf',
    title: 'Extract Text from PDF',
    url: '/all-tools/pdf/extract-text-from-pdf',
    inputType: 'single-file',
    files: ['valid.pdf'],
    expectedOutputType: 'txt',
    positiveTests: [
      {
        name: 'Extract text from PDF',
        files: ['valid.pdf'],
        description: 'Should extract all text',
      },
    ],
    negativeTests: [
      {
        name: 'No file provided',
        files: [],
        expectedError: 'Please upload',
      },
    ],
  },

  'extract-images-pdf': {
    slug: 'extract-images-pdf',
    title: 'Extract Images from PDF',
    url: '/all-tools/pdf/extract-images-pdf',
    inputType: 'single-file',
    files: ['valid.pdf'],
    options: { format: 'png' },
    expectedOutputType: 'zip',
    positiveTests: [
      {
        name: 'Extract images from PDF',
        files: ['valid.pdf'],
        options: { format: 'png' },
        description: 'Should extract all images as PNG',
      },
    ],
    negativeTests: [
      {
        name: 'No file provided',
        files: [],
        expectedError: 'Please upload',
      },
    ],
  },
};

export function getAllPdfToolTests(): PdfToolTestConfig[] {
  return Object.values(pdfToolsTestConfig);
}

export function getPdfToolTest(slug: string): PdfToolTestConfig | undefined {
  return pdfToolsTestConfig[slug];
}


