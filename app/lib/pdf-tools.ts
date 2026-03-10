import { LucideIcon } from 'lucide-react';
import {
  Merge,
  Split,
  RotateCcw,
  RotateCw,
  Shuffle,
  Scissors,
  Trash,
  Plus,
  Lock,
  LockOpen,
  Eye,
  Image as ImageIcon,
  FileText,
  FileJson,
  FileUp,
  Link,
  Mail,
  Zap,
  Settings,
  Type,
  Bookmark,
  MessageSquare,
  PenTool,
  Stamp,
  Layers,
  Download,
  Languages,
  Archive,
  Table,
  File,
  FileCode,
  Globe,
  Wand2,
  Sparkles,
} from 'lucide-react';

export interface PdfOption {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'file' | 'url';
  default?: any;
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  required?: boolean;
}

export interface PdfToolConfig {
  id: string;
  title: string;
  description: string;
  category: 'Core' | 'Convert' | 'Edit' | 'Security' | 'Extract' | 'Advanced';
  engine: 'core' | 'convert' | 'edit' | 'security' | 'extract' | 'ocr_translate';
  icon: LucideIcon;
  accepts: string[]; // .pdf, .jpg, .png, etc. or 'url'
  output: string; // .pdf, .png, .zip, .txt, .xlsx, etc.
  inputMode: 'single-file' | 'multi-file' | 'url' | 'text'; // How input is provided
  options?: PdfOption[];
  maxFileSize?: number; // in bytes, default 100MB
  multipleFiles?: boolean;
}

export const pdfTools: Record<string, PdfToolConfig> = {
  // CORE ENGINE TOOLS
  'merge-pdf': {
    id: 'merge-pdf',
    title: 'Merge PDF',
    description: 'Merge multiple PDF files into one',
    category: 'Core',
    engine: 'core',
    icon: Merge,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'multi-file',
    multipleFiles: true,
    options: [
      {
        id: 'fileOrder',
        label: 'File Order',
        type: 'text',
        placeholder: 'Files will be merged in the order provided',
      },
    ],
  },

  'split-pdf': {
    id: 'split-pdf',
    title: 'Split PDF',
    description: 'Split PDF into individual pages or page ranges',
    category: 'Core',
    engine: 'core',
    icon: Split,
    accepts: ['.pdf'],
    output: '.zip',
    inputMode: 'single-file',
    options: [
      {
        id: 'mode',
        label: 'Split Mode',
        type: 'select',
        default: 'all',
        options: [
          { label: 'All Pages', value: 'all' },
          { label: 'Page Range', value: 'range' },
          { label: 'Every N Pages', value: 'every_n' },
        ],
      },
      {
        id: 'pageRange',
        label: 'Page Range (e.g., 1-5 or 1,3,5)',
        type: 'text',
        placeholder: '1-5',
      },
      {
        id: 'everyN',
        label: 'Every N Pages',
        type: 'number',
        default: 1,
        min: 1,
      },
    ],
  },

  'rotate-pdf': {
    id: 'rotate-pdf',
    title: 'Rotate PDF',
    description: 'Rotate PDF pages by 90°, 180°, or 270°',
    category: 'Core',
    engine: 'core',
    icon: RotateCcw,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
    options: [
      {
        id: 'angle',
        label: 'Rotation Angle',
        type: 'select',
        default: 90,
        options: [
          { label: '90°', value: 90 },
          { label: '180°', value: 180 },
          { label: '270°', value: 270 },
        ],
      },
      {
        id: 'pageRange',
        label: 'Pages to Rotate (leave empty for all)',
        type: 'text',
        placeholder: '1-5 or 1,3,5',
      },
    ],
  },

  'rearrange-pdf': {
    id: 'rearrange-pdf',
    title: 'Rearrange PDF',
    description: 'Rearrange PDF pages in custom order',
    category: 'Core',
    engine: 'core',
    icon: Shuffle,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
    options: [
      {
        id: 'pageOrder',
        label: 'Page Order (comma-separated, 0-indexed)',
        type: 'text',
        placeholder: '0,2,1,3',
        required: true,
      },
    ],
  },

  'crop-pdf': {
    id: 'crop-pdf',
    title: 'Crop PDF',
    description: 'Crop PDF pages to specific dimensions',
    category: 'Core',
    engine: 'core',
    icon: Scissors,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
    options: [
      {
        id: 'pageRange',
        label: 'Pages to Crop (leave empty for all)',
        type: 'text',
        placeholder: '1-5',
      },
      {
        id: 'left',
        label: 'Left (pixels)',
        type: 'number',
        default: 0,
      },
      {
        id: 'bottom',
        label: 'Bottom (pixels)',
        type: 'number',
        default: 0,
      },
      {
        id: 'right',
        label: 'Right (pixels)',
        type: 'number',
        default: 612,
      },
      {
        id: 'top',
        label: 'Top (pixels)',
        type: 'number',
        default: 792,
      },
    ],
  },

  'pdf-page-deletor': {
    id: 'pdf-page-deletor',
    title: 'PDF Page Deletor',
    description: 'Delete specific pages from PDF',
    category: 'Core',
    engine: 'core',
    icon: Trash,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
    options: [
      {
        id: 'pagesToDelete',
        label: 'Pages to Delete (comma-separated, 1-indexed)',
        type: 'text',
        placeholder: '1,3,5',
        required: true,
      },
    ],
  },

  'create-pdf': {
    id: 'create-pdf',
    title: 'Create PDF',
    description: 'Create PDF from images or blank pages',
    category: 'Core',
    engine: 'core',
    icon: Plus,
    accepts: ['.jpg', '.png', '.tiff'],
    output: '.pdf',
    inputMode: 'multi-file',
    options: [
      {
        id: 'numPages',
        label: 'Number of Blank Pages (if no images)',
        type: 'number',
        default: 1,
      },
    ],
  },

  // SECURITY ENGINE TOOLS
  'protect-pdf': {
    id: 'protect-pdf',
    title: 'Protect PDF',
    description: 'Add password protection to PDF',
    category: 'Security',
    engine: 'security',
    icon: Lock,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
    options: [
      {
        id: 'userPassword',
        label: 'User Password (to open file)',
        type: 'text',
        placeholder: 'Enter password',
        required: true,
      },
      {
        id: 'ownerPassword',
        label: 'Owner Password (for permissions)',
        type: 'text',
        placeholder: 'Optional',
      },
    ],
  },

  'unlock-pdf': {
    id: 'unlock-pdf',
    title: 'Unlock PDF',
    description: 'Remove password protection from PDF',
    category: 'Security',
    engine: 'security',
    icon: LockOpen,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
    options: [
      {
        id: 'password',
        label: 'PDF Password',
        type: 'text',
        placeholder: 'Enter password to unlock',
        required: true,
      },
    ],
  },

  'pdf-watermark-remover': {
    id: 'pdf-watermark-remover',
    title: 'PDF Watermark Remover',
    description: 'Remove watermarks from PDF (best effort)',
    category: 'Security',
    engine: 'security',
    icon: Eye,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
  },

  // CONVERT ENGINE TOOLS
  'pdf-to-jpg': {
    id: 'pdf-to-jpg',
    title: 'PDF to JPG',
    description: 'Convert PDF pages to JPG images',
    category: 'Convert',
    engine: 'convert',
    icon: ImageIcon,
    accepts: ['.pdf'],
    output: '.zip',
    inputMode: 'single-file',
    options: [
      {
        id: 'dpi',
        label: 'DPI (quality)',
        type: 'select',
        default: 150,
        options: [
          { label: '72 DPI (low)', value: 72 },
          { label: '150 DPI (medium)', value: 150 },
          { label: '300 DPI (high)', value: 300 },
          { label: '600 DPI (very high)', value: 600 },
        ],
      },
      {
        id: 'pageMode',
        label: 'Pages',
        type: 'select',
        default: 'all',
        options: [
          { label: 'All Pages', value: 'all' },
          { label: 'Selected Pages', value: 'selected' },
        ],
      },
      {
        id: 'pageRange',
        label: 'Page Range (if selected)',
        type: 'text',
        placeholder: '1-5',
      },
    ],
  },

  'pdf-to-png': {
    id: 'pdf-to-png',
    title: 'PDF to PNG',
    description: 'Convert PDF pages to PNG images',
    category: 'Convert',
    engine: 'convert',
    icon: ImageIcon,
    accepts: ['.pdf'],
    output: '.zip',
    inputMode: 'single-file',
    options: [
      {
        id: 'dpi',
        label: 'DPI (quality)',
        type: 'select',
        default: 150,
        options: [
          { label: '72 DPI', value: 72 },
          { label: '150 DPI', value: 150 },
          { label: '300 DPI', value: 300 },
        ],
      },
      {
        id: 'pageMode',
        label: 'Pages',
        type: 'select',
        default: 'all',
        options: [
          { label: 'All Pages', value: 'all' },
          { label: 'Selected Pages', value: 'selected' },
        ],
      },
      {
        id: 'pageRange',
        label: 'Page Range',
        type: 'text',
        placeholder: '1-5',
      },
    ],
  },

  'pdf-to-tiff': {
    id: 'pdf-to-tiff',
    title: 'PDF to TIFF',
    description: 'Convert PDF pages to TIFF images',
    category: 'Convert',
    engine: 'convert',
    icon: ImageIcon,
    accepts: ['.pdf'],
    output: '.zip',
    inputMode: 'single-file',
    options: [
      {
        id: 'dpi',
        label: 'DPI (quality)',
        type: 'select',
        default: 150,
        options: [
          { label: '72 DPI', value: 72 },
          { label: '150 DPI', value: 150 },
          { label: '300 DPI (archival)', value: 300 },
          { label: '600 DPI (high quality)', value: 600 },
        ],
      },
      {
        id: 'pageMode',
        label: 'Pages',
        type: 'select',
        default: 'all',
        options: [
          { label: 'All Pages', value: 'all' },
          { label: 'Selected Pages', value: 'selected' },
        ],
      },
      {
        id: 'pageRange',
        label: 'Page Range (if selected)',
        type: 'text',
        placeholder: '1-5',
      },
    ],
  },

  'jpg-to-pdf': {
    id: 'jpg-to-pdf',
    title: 'JPG to PDF',
    description: 'Convert JPG images to PDF',
    category: 'Convert',
    engine: 'convert',
    icon: FileUp,
    accepts: ['.jpg', '.jpeg'],
    output: '.pdf',
    inputMode: 'multi-file',
  },

  'png-to-pdf': {
    id: 'png-to-pdf',
    title: 'PNG to PDF',
    description: 'Convert PNG images to PDF',
    category: 'Convert',
    engine: 'convert',
    icon: FileUp,
    accepts: ['.png'],
    output: '.pdf',
    inputMode: 'multi-file',
  },

  'tiff-to-pdf': {
    id: 'tiff-to-pdf',
    title: 'TIFF to PDF',
    description: 'Convert TIFF images to PDF',
    category: 'Convert',
    engine: 'convert',
    icon: FileUp,
    accepts: ['.tiff', '.tif'],
    output: '.pdf',
    inputMode: 'multi-file',
  },

  'webp-to-pdf': {
    id: 'webp-to-pdf',
    title: 'WEBP to PDF',
    description: 'Convert WEBP images to PDF',
    category: 'Convert',
    engine: 'convert',
    icon: FileUp,
    accepts: ['.webp'],
    output: '.pdf',
    inputMode: 'multi-file',
  },

  'gif-to-pdf': {
    id: 'gif-to-pdf',
    title: 'GIF to PDF',
    description: 'Convert GIF images to PDF',
    category: 'Convert',
    engine: 'convert',
    icon: FileUp,
    accepts: ['.gif'],
    output: '.pdf',
    inputMode: 'multi-file',
  },

  'heic-to-pdf': {
    id: 'heic-to-pdf',
    title: 'HEIC to PDF',
    description: 'Convert HEIC images to PDF',
    category: 'Convert',
    engine: 'convert',
    icon: FileUp,
    accepts: ['.heic'],
    output: '.pdf',
    inputMode: 'multi-file',
  },

  'eps-to-pdf': {
    id: 'eps-to-pdf',
    title: 'EPS to PDF',
    description: 'Convert EPS images to PDF',
    category: 'Convert',
    engine: 'convert',
    icon: FileUp,
    accepts: ['.eps'],
    output: '.pdf',
    inputMode: 'multi-file',
  },

  'images-to-pdf': {
    id: 'images-to-pdf',
    title: 'Images to PDF',
    description: 'Convert multiple images to PDF',
    category: 'Convert',
    engine: 'convert',
    icon: FileUp,
    accepts: ['.jpg', '.png', '.tiff', '.webp', '.gif', '.heic'],
    output: '.pdf',
    inputMode: 'multi-file',
    multipleFiles: true,
  },

  'pdf-to-word': {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    description: 'Convert PDF to Word document (best effort)',
    category: 'Convert',
    engine: 'convert',
    icon: FileText,
    accepts: ['.pdf'],
    output: '.docx',
    inputMode: 'single-file',
  },

  'word-to-pdf': {
    id: 'word-to-pdf',
    title: 'Word to PDF',
    description: 'Convert Word document to PDF',
    category: 'Convert',
    engine: 'convert',
    icon: FileUp,
    accepts: ['.docx', '.doc'],
    output: '.pdf',
    inputMode: 'single-file',
  },

  'pdf-to-powerpoint': {
    id: 'pdf-to-powerpoint',
    title: 'PDF to PowerPoint',
    description: 'Convert PDF to PowerPoint (best effort)',
    category: 'Convert',
    engine: 'convert',
    icon: FileJson,
    accepts: ['.pdf'],
    output: '.pptx',
    inputMode: 'single-file',
  },

  'powerpoint-to-pdf': {
    id: 'powerpoint-to-pdf',
    title: 'PowerPoint to PDF',
    description: 'Convert PowerPoint to PDF',
    category: 'Convert',
    engine: 'convert',
    icon: FileUp,
    accepts: ['.pptx', '.ppt'],
    output: '.pdf',
    inputMode: 'single-file',
  },

  'pdf-to-excel': {
    id: 'pdf-to-excel',
    title: 'PDF to Excel',
    description: 'Extract tables from PDF to Excel',
    category: 'Convert',
    engine: 'convert',
    icon: FileJson,
    accepts: ['.pdf'],
    output: '.xlsx',
    inputMode: 'single-file',
  },

  'pdf-to-csv': {
    id: 'pdf-to-csv',
    title: 'PDF to CSV',
    description: 'Extract tables from PDF to CSV',
    category: 'Convert',
    engine: 'convert',
    icon: FileJson,
    accepts: ['.pdf'],
    output: '.csv',
    inputMode: 'single-file',
  },

  'pdf-to-text': {
    id: 'pdf-to-text',
    title: 'PDF to Text',
    description: 'Extract text from PDF',
    category: 'Convert',
    engine: 'convert',
    icon: FileText,
    accepts: ['.pdf'],
    output: '.txt',
    inputMode: 'single-file',
  },

  'pdf-to-epub': {
    id: 'pdf-to-epub',
    title: 'PDF to EPUB',
    description: 'Convert PDF to EPUB eBook',
    category: 'Convert',
    engine: 'convert',
    icon: FileUp,
    accepts: ['.pdf'],
    output: '.epub',
    inputMode: 'single-file',
  },

  'pdf-to-mobi': {
    id: 'pdf-to-mobi',
    title: 'PDF to MOBI',
    description: 'Convert PDF to MOBI eBook',
    category: 'Convert',
    engine: 'convert',
    icon: FileUp,
    accepts: ['.pdf'],
    output: '.mobi',
    inputMode: 'single-file',
  },

  'pdf-to-azw3': {
    id: 'pdf-to-azw3',
    title: 'PDF to AZW3',
    description: 'Convert PDF to AZW3 eBook',
    category: 'Convert',
    engine: 'convert',
    icon: FileUp,
    accepts: ['.pdf'],
    output: '.azw3',
    inputMode: 'single-file',
  },

  'epub-to-pdf': {
    id: 'epub-to-pdf',
    title: 'EPUB to PDF',
    description: 'Convert EPUB eBook to PDF',
    category: 'Convert',
    engine: 'convert',
    icon: FileUp,
    accepts: ['.epub'],
    output: '.pdf',
    inputMode: 'single-file',
  },

  'mobi-to-pdf': {
    id: 'mobi-to-pdf',
    title: 'MOBI to PDF',
    description: 'Convert MOBI eBook to PDF',
    category: 'Convert',
    engine: 'convert',
    icon: FileUp,
    accepts: ['.mobi'],
    output: '.pdf',
    inputMode: 'single-file',
  },

  'azw3-to-pdf': {
    id: 'azw3-to-pdf',
    title: 'AZW3 to PDF',
    description: 'Convert AZW3 eBook to PDF',
    category: 'Convert',
    engine: 'convert',
    icon: FileUp,
    accepts: ['.azw3'],
    output: '.pdf',
    inputMode: 'single-file',
  },

  'url-to-pdf': {
    id: 'url-to-pdf',
    title: 'URL to PDF',
    description: 'Convert webpage to PDF',
    category: 'Convert',
    engine: 'convert',
    icon: Link,
    accepts: [],
    output: '.pdf',
    inputMode: 'url',
    options: [
      {
        id: 'url',
        label: 'Website URL',
        type: 'url',
        placeholder: 'https://example.com',
        required: true,
      },
    ],
  },

  'ms-outlook-to-pdf': {
    id: 'ms-outlook-to-pdf',
    title: 'Outlook to PDF',
    description: 'Convert Outlook MSG file to PDF',
    category: 'Convert',
    engine: 'convert',
    icon: Mail,
    accepts: ['.msg'],
    output: '.pdf',
    inputMode: 'single-file',
  },

  // EDIT ENGINE TOOLS
  'edit-pdf': {
    id: 'edit-pdf',
    title: 'Edit PDF',
    description: 'Edit PDF content (basic operations)',
    category: 'Edit',
    engine: 'edit',
    icon: Settings,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
  },

  'add-text': {
    id: 'add-text',
    title: 'Add Text to PDF',
    description: 'Add custom text to PDF pages',
    category: 'Edit',
    engine: 'edit',
    icon: Type,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
    options: [
      {
        id: 'text',
        label: 'Text to Add',
        type: 'text',
        placeholder: 'Enter your text',
        required: true,
      },
      {
        id: 'pageNumber',
        label: 'Page Number',
        type: 'number',
        default: 1,
        min: 1,
      },
      {
        id: 'x',
        label: 'X Position',
        type: 'number',
        default: 50,
      },
      {
        id: 'y',
        label: 'Y Position',
        type: 'number',
        default: 50,
      },
      {
        id: 'fontSize',
        label: 'Font Size',
        type: 'number',
        default: 12,
        min: 8,
        max: 72,
      },
      {
        id: 'color',
        label: 'Text Color',
        type: 'select',
        default: '0,0,0',
        options: [
          { label: 'Black', value: '0,0,0' },
          { label: 'White', value: '255,255,255' },
          { label: 'Red', value: '255,0,0' },
          { label: 'Green', value: '0,128,0' },
          { label: 'Blue', value: '0,0,255' },
          { label: 'Gray', value: '128,128,128' },
        ],
      },
    ],
  },

  'add-watermark': {
    id: 'add-watermark',
    title: 'Add Watermark',
    description: 'Add watermark text to PDF pages',
    category: 'Edit',
    engine: 'edit',
    icon: Stamp,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
    options: [
      {
        id: 'text',
        label: 'Watermark Text',
        type: 'text',
        default: 'WATERMARK',
        placeholder: 'Enter watermark text',
      },
      {
        id: 'opacity',
        label: 'Opacity (0-1)',
        type: 'number',
        default: 0.3,
        min: 0,
        max: 1,
        step: 0.1,
      },
      {
        id: 'fontSize',
        label: 'Font Size',
        type: 'number',
        default: 300,
        min: 50,
        max: 800,
      },
      {
        id: 'rotation',
        label: 'Rotation (degrees)',
        type: 'number',
        default: -45,
        min: -360,
        max: 360,
      },
      {
        id: 'pageRange',
        label: 'Pages (all or comma-separated)',
        type: 'text',
        default: 'all',
      },
    ],
  },

  'add-numbers-to-pdf': {
    id: 'add-numbers-to-pdf',
    title: 'Add Page Numbers',
    description: 'Add page numbers to PDF',
    category: 'Edit',
    engine: 'edit',
    icon: Layers,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
    options: [
      {
        id: 'position',
        label: 'Position',
        type: 'select',
        default: 'bottom-right',
        options: [
          { label: 'Bottom Right', value: 'bottom-right' },
          { label: 'Bottom Center', value: 'bottom-center' },
          { label: 'Bottom Left', value: 'bottom-left' },
          { label: 'Top Right', value: 'top-right' },
          { label: 'Top Center', value: 'top-center' },
          { label: 'Top Left', value: 'top-left' },
        ],
      },
      {
        id: 'fontSize',
        label: 'Font Size',
        type: 'number',
        default: 12,
      },
      {
        id: 'startNumber',
        label: 'Start Number',
        type: 'number',
        default: 1,
      },
      {
        id: 'pageRange',
        label: 'Pages (all or comma-separated like 1-5)',
        type: 'text',
        default: 'all',
      },
    ],
  },

  'annotate-pdf': {
    id: 'annotate-pdf',
    title: 'Annotate PDF',
    description: 'Add annotations to PDF',
    category: 'Edit',
    engine: 'edit',
    icon: MessageSquare,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
    options: [
      {
        id: 'type',
        label: 'Annotation Type',
        type: 'select',
        default: 'highlight',
        options: [
          { label: 'Highlight', value: 'highlight' },
          { label: 'Note', value: 'note' },
          { label: 'Underline', value: 'underline' },
        ],
      },
      {
        id: 'pageNumber',
        label: 'Page Number',
        type: 'number',
        default: 1,
      },
      {
        id: 'text',
        label: 'Annotation Text',
        type: 'text',
        placeholder: 'Optional note',
      },
    ],
  },

  'esign-pdf': {
    id: 'esign-pdf',
    title: 'eSign PDF',
    description: 'Add electronic signature to PDF',
    category: 'Edit',
    engine: 'edit',
    icon: PenTool,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
    options: [
      {
        id: 'pageNumber',
        label: 'Page Number',
        type: 'number',
        default: 1,
      },
      {
        id: 'signatureText',
        label: 'Signature Text',
        type: 'text',
        placeholder: 'Enter name or signature',
      },
      {
        id: 'x',
        label: 'X Position',
        type: 'number',
        default: 50,
      },
      {
        id: 'y',
        label: 'Y Position',
        type: 'number',
        default: 50,
      },
    ],
  },

  // EXTRACT ENGINE TOOLS
  'extract-text-from-pdf': {
    id: 'extract-text-from-pdf',
    title: 'Extract Text from PDF',
    description: 'Extract all text from PDF',
    category: 'Extract',
    engine: 'extract',
    icon: FileText,
    accepts: ['.pdf'],
    output: '.txt',
    inputMode: 'single-file',
    options: [
      {
        id: 'pageRange',
        label: 'Page Range (empty = all)',
        type: 'text',
        placeholder: '1-5',
      },
      {
        id: 'ocrFallback',
        label: 'Use OCR for scanned pages',
        type: 'checkbox',
        default: false,
      },
    ],
  },

  'extract-images-pdf': {
    id: 'extract-images-pdf',
    title: 'Extract Images from PDF',
    description: 'Extract all images from PDF',
    category: 'Extract',
    engine: 'extract',
    icon: ImageIcon,
    accepts: ['.pdf'],
    output: '.zip',
    inputMode: 'single-file',
    options: [
      {
        id: 'format',
        label: 'Image Format',
        type: 'select',
        default: 'png',
        options: [
          { label: 'PNG', value: 'png' },
          { label: 'JPG', value: 'jpg' },
        ],
      },
      {
        id: 'pageRange',
        label: 'Page Range (empty = all)',
        type: 'text',
        placeholder: '1-5',
      },
    ],
  },

  'extract-tables-from-pdf': {
    id: 'extract-tables-from-pdf',
    title: 'Extract Tables from PDF',
    description: 'Extract tables from PDF to CSV or Excel',
    category: 'Extract',
    engine: 'extract',
    icon: Table,
    accepts: ['.pdf'],
    output: '.csv',
    inputMode: 'single-file',
    options: [
      {
        id: 'format',
        label: 'Output Format',
        type: 'select',
        default: 'csv',
        options: [
          { label: 'CSV', value: 'csv' },
          { label: 'Excel (XLSX)', value: 'xlsx' },
        ],
      },
      {
        id: 'pageRange',
        label: 'Page Range (empty = all)',
        type: 'text',
        placeholder: '1-5',
      },
    ],
  },

  // PHASE 5: DOCUMENT CONVERSION TOOLS
  'pdf-to-docx': {
    id: 'pdf-to-docx',
    title: 'PDF to Word',
    description: 'Convert PDF to Microsoft Word DOCX format',
    category: 'Convert',
    engine: 'convert',
    icon: File,
    accepts: ['.pdf'],
    output: '.docx',
    inputMode: 'single-file',
    options: [
      {
        id: 'pageRange',
        label: 'Page Range (empty = all)',
        type: 'text',
        placeholder: '1-5',
      },
    ],
  },

  'pdf-to-pptx': {
    id: 'pdf-to-pptx',
    title: 'PDF to PowerPoint',
    description: 'Convert PDF to PowerPoint PPTX presentation',
    category: 'Convert',
    engine: 'convert',
    icon: File,
    accepts: ['.pdf'],
    output: '.pptx',
    inputMode: 'single-file',
    options: [
      {
        id: 'pageRange',
        label: 'Page Range (empty = all)',
        type: 'text',
        placeholder: '1-5',
      },
    ],
  },

  'pdf-to-xlsx': {
    id: 'pdf-to-xlsx',
    title: 'PDF to Excel',
    description: 'Convert PDF tables and content to Excel XLSX',
    category: 'Convert',
    engine: 'convert',
    icon: File,
    accepts: ['.pdf'],
    output: '.xlsx',
    inputMode: 'single-file',
    options: [
      {
        id: 'pageRange',
        label: 'Page Range (empty = all)',
        type: 'text',
        placeholder: '1-5',
      },
    ],
  },

  'pdf-to-html': {
    id: 'pdf-to-html',
    title: 'PDF to HTML',
    description: 'Convert PDF to HTML web format',
    category: 'Convert',
    engine: 'convert',
    icon: Globe,
    accepts: ['.pdf'],
    output: '.html',
    inputMode: 'single-file',
    options: [
      {
        id: 'pageRange',
        label: 'Page Range (empty = all)',
        type: 'text',
        placeholder: '1-5',
      },
    ],
  },

  'pdf-to-rtf': {
    id: 'pdf-to-rtf',
    title: 'PDF to RTF',
    description: 'Convert PDF to Rich Text Format',
    category: 'Convert',
    engine: 'convert',
    icon: FileCode,
    accepts: ['.pdf'],
    output: '.rtf',
    inputMode: 'single-file',
    options: [
      {
        id: 'pageRange',
        label: 'Page Range (empty = all)',
        type: 'text',
        placeholder: '1-5',
      },
    ],
  },

  // ADVANCED TOOLS
  'compress-pdf': {
    id: 'compress-pdf',
    title: 'Compress PDF',
    description: 'Reduce PDF file size',
    category: 'Advanced',
    engine: 'core',
    icon: Archive,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
    options: [
      {
        id: 'level',
        label: 'Compression Level',
        type: 'select',
        default: 'medium',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
      },
    ],
  },

  'pdf-translator': {
    id: 'pdf-translator',
    title: 'PDF Translator',
    description: 'Translate PDF content',
    category: 'Advanced',
    engine: 'ocr_translate',
    icon: Languages,
    accepts: ['.pdf'],
    output: '.txt',
    inputMode: 'single-file',
    options: [
      {
        id: 'targetLanguage',
        label: 'Target Language',
        type: 'select',
        default: 'es',
        options: [
          { label: 'Spanish (es)', value: 'es' },
          { label: 'French (fr)', value: 'fr' },
          { label: 'German (de)', value: 'de' },
          { label: 'Chinese (zh)', value: 'zh' },
          { label: 'Japanese (ja)', value: 'ja' },
          { label: 'Portuguese (pt)', value: 'pt' },
        ],
      },
      {
        id: 'outputMode',
        label: 'Output Format',
        type: 'select',
        default: 'text',
        options: [
          { label: 'Text File', value: 'text' },
          { label: 'PDF', value: 'pdf' },
        ],
      },
      {
        id: 'pageRange',
        label: 'Page Range (empty = all)',
        type: 'text',
        placeholder: '1-5',
      },
    ],
  },

  // PHASE 6: ADVANCED TOOLS
  'pdf-ocr': {
    id: 'pdf-ocr',
    title: 'PDF OCR',
    description: 'Extract text from scanned PDFs using OCR',
    category: 'Advanced',
    engine: 'ocr_translate',
    icon: Wand2,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
    options: [
      {
        id: 'language',
        label: 'OCR Language',
        type: 'select',
        default: 'eng',
        options: [
          { label: 'English', value: 'eng' },
          { label: 'Spanish', value: 'spa' },
          { label: 'French', value: 'fra' },
          { label: 'German', value: 'deu' },
          { label: 'Chinese', value: 'chi_sim' },
          { label: 'Japanese', value: 'jpn' },
          { label: 'Arabic', value: 'ara' },
          { label: 'Russian', value: 'rus' },
        ],
      },
      {
        id: 'outputFormat',
        label: 'Output Format',
        type: 'select',
        default: 'pdf',
        options: [
          { label: 'Searchable PDF', value: 'pdf' },
          { label: 'Text File', value: 'txt' },
        ],
      },
      {
        id: 'pageRange',
        label: 'Page Range (empty = all)',
        type: 'text',
        placeholder: '1-5',
      },
    ],
  },

  'pdf-deskew': {
    id: 'pdf-deskew',
    title: 'PDF Deskew',
    description: 'Straighten tilted or skewed scanned pages',
    category: 'Advanced',
    engine: 'ocr_translate',
    icon: RotateCw,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
    options: [
      {
        id: 'pageRange',
        label: 'Page Range (empty = all)',
        type: 'text',
        placeholder: '1-5',
      },
    ],
  },

  'pdf-enhance-scan': {
    id: 'pdf-enhance-scan',
    title: 'Enhance Scanned PDF',
    description: 'Improve quality of scanned documents (contrast, sharpness, denoise)',
    category: 'Advanced',
    engine: 'ocr_translate',
    icon: Sparkles,
    accepts: ['.pdf'],
    output: '.pdf',
    inputMode: 'single-file',
    options: [
      {
        id: 'level',
        label: 'Enhancement Level',
        type: 'select',
        default: 'medium',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
      },
      {
        id: 'pageRange',
        label: 'Page Range (empty = all)',
        type: 'text',
        placeholder: '1-5',
      },
    ],
  },
};

// Get all tools as array
export function getAllPdfTools(): PdfToolConfig[] {
  return Object.values(pdfTools);
}

// Get tool by ID
export function getPdfToolById(id: string): PdfToolConfig | undefined {
  return pdfTools[id];
}

// Get tools by category
export function getPdfToolsByCategory(
  category: PdfToolConfig['category']
): PdfToolConfig[] {
  return Object.values(pdfTools).filter((tool) => tool.category === category);
}

// Get tools by engine
export function getPdfToolsByEngine(
  engine: PdfToolConfig['engine']
): PdfToolConfig[] {
  return Object.values(pdfTools).filter((tool) => tool.engine === engine);
}
