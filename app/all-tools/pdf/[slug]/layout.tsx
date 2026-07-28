import { Metadata } from 'next';
import { getPdfToolById } from '@/app/lib/pdf-tools';
import {
  generateBreadcrumbSchema,
  generateSoftwareApplicationSchema,
} from '@/app/lib/seo';

interface Params {
  slug: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getPdfToolById(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found - SimplifyConvert',
      robots: { index: false },
    };
  }

  const baseUrl = 'https://simplifyconvert.com';
  const canonicalUrl = `${baseUrl}/all-tools/pdf/${slug}`;

  // SEO-optimized metadata per tool
  const seoConfig: Record<string, { title: string; description: string; keywords: string[] }> = {
    'merge-pdf': {
      title: 'Merge PDF Files Online - Combine PDFs Free',
      description: 'Combine two or more PDF files in your chosen order and download one merged PDF without rasterizing the original pages.',
      keywords: ['merge PDF', 'combine PDF files', 'PDF merger', 'join PDFs', 'free PDF tool', 'online PDF merger'],
    },
    'split-pdf': {
      title: 'Split PDF Online Free | Extract PDF Pages',
      description: 'Split a PDF into individual pages, a selected page range, or every nth page, then download the resulting PDF files.',
      keywords: ['split PDF', 'separate PDF pages', 'extract PDF', 'divide PDF', 'PDF splitter', 'free PDF tool'],
    },
    'rotate-pdf': {
      title: 'Rotate PDF Pages - Free Online Tool (No Signup)',
      description: 'Rotate all or selected PDF pages by 90°, 180°, or 270° and download the updated PDF without rasterizing page content.',
      keywords: ['rotate PDF', 'rotate PDF pages', 'PDF rotation tool', 'rotate PDF 90 degrees', 'free PDF rotator', 'PDF page orientation'],
    },
    'rearrange-pdf': {
      title: 'Rearrange PDF Pages Online Free | Reorder PDF',
      description: 'Place every page of a PDF into a custom sequence and download a new document with the selected page order.',
      keywords: ['rearrange PDF', 'reorder PDF pages', 'PDF page reordering', 'arrange PDF pages', 'rearrange PDF online', 'PDF reorganizer'],
    },
    'crop-pdf': {
      title: 'Crop PDF Pages Online Free - Visual PDF Cropper Tool',
      description: 'Crop all or selected PDF pages to a chosen area and download the updated PDF without re-encoding the remaining page content.',
      keywords: ['crop PDF', 'crop PDF pages', 'PDF cropper', 'trim PDF margins', 'resize PDF pages online free', 'remove PDF margins', 'extract PDF areas'],
    },
    'pdf-page-deleter': {
      title: 'Delete PDF Pages Online Free - Easy PDF Page Remover',
      description: 'Choose specific pages to remove from a PDF and download a new document containing the remaining pages.',
      keywords: ['delete PDF pages', 'remove PDF pages', 'PDF page deleter online', 'remove pages from PDF free', 'delete specific pages PDF', 'edit PDF remove pages'],
    },
    'create-pdf': {
      title: 'Create PDF from Images Online Free - Image to PDF Converter',
      description: 'Combine JPG, PNG, or TIFF images into one PDF in upload order, or create a PDF containing a selected number of blank pages.',
      keywords: ['create PDF from images', 'image to PDF converter online', 'convert images to PDF free', 'merge images to PDF', 'JPG to PDF online', 'make PDF from photos'],
    },
    'protect-pdf': {
      title: 'Password Protect PDF Online Free - Encrypt PDF Documents',
      description: 'Add user-password encryption to a PDF, optionally set an owner password, and download the password-protected document.',
      keywords: ['protect PDF', 'password protect PDF online', 'encrypt PDF file', 'PDF security password', 'PDF password encryption', 'lock PDF with password'],
    },
    'unlock-pdf': {
      title: 'Unlock PDF Online Free - Remove Password Protection',
      description: 'Provide the correct password to decrypt a protected PDF and download a new PDF without password encryption.',
      keywords: ['unlock PDF', 'remove PDF password', 'unlock password protected PDF', 'decrypt PDF', 'remove password from PDF', 'unlock encrypted PDF'],
    },
    'pdf-watermark-remover': {
      title: 'Remove PDF Watermarks Online - Free Watermark Remover',
      description: 'Use detection-based processing to target common PDF watermarks. Results vary with watermark type and document structure.',
      keywords: ['remove PDF watermark', 'PDF watermark remover', 'remove watermark from PDF', 'watermark removal online', 'free PDF watermark remover', 'remove PDF text', 'delete PDF watermark'],
    },
    'pdf-to-jpg': {
      title: 'Convert PDF to JPG Free - Online PDF to Image Tool',
      description: 'Render all or selected PDF pages as JPG images at 72, 150, 300, or 600 DPI; multiple page images are packaged in a ZIP file.',
      keywords: ['PDF to JPG converter', 'convert PDF to JPG free', 'PDF to image conversion', 'extract images from PDF', 'convert PDF pages to JPG online', 'PDF to JPG free tool'],
    },
    'pdf-to-png': {
      title: 'Convert PDF to PNG Free - Online PNG Converter Tool',
      description: 'Render all or selected PDF pages as alpha-capable PNG images at 72, 150, or 300 DPI; multiple page images are packaged in a ZIP file.',
      keywords: ['PDF to PNG converter', 'convert PDF to PNG free', 'PDF to PNG online', 'convert PDF pages to PNG', 'transparent PNG from PDF', 'PDF to PNG free tool'],
    },
    'pdf-to-tiff': {
      title: 'Convert PDF to TIFF Free - Online TIFF Converter Tool',
      description: 'Render all or selected PDF pages as LZW-compressed TIFF images at 72, 150, 300, or 600 DPI; multiple images are packaged in a ZIP file.',
      keywords: ['PDF to TIFF converter', 'convert PDF to TIFF free', 'TIFF converter online', 'convert PDF pages to TIFF', 'PDF to TIFF online', 'PDF to TIFF free tool'],
    },
    'jpg-to-pdf': {
      title: 'Convert JPG to PDF Free - Online JPG to PDF Converter',
      description: 'Combine JPG, JPEG, or PNG images in upload order into one PDF, scaling larger images to fit separate document pages.',
      keywords: ['JPG to PDF converter', 'convert JPG to PDF free', 'image to PDF online', 'create PDF from images', 'merge images to PDF', 'JPG to PDF free tool', 'online JPG converter'],
    },
    'png-to-pdf': {
      title: 'Convert PNG to PDF Free Online - PNG to PDF Converter',
      description: 'Combine multiple PNG images into one PDF, placing each image on a separate page and flattening transparent areas onto white.',
      keywords: ['PNG to PDF converter', 'convert PNG to PDF free', 'PNG to PDF online', 'image to PDF converter', 'create PDF from PNG', 'PNG to PDF free tool'],
    },
    'tiff-to-pdf': {
      title: 'Convert TIFF to PDF Free Online - TIFF to PDF Converter',
      description: 'Combine multiple TIFF images into one PDF, placing each uploaded image on a separate page in the resulting document.',
      keywords: ['TIFF to PDF converter', 'convert TIFF to PDF free', 'TIFF to PDF online', 'TIFF image to PDF', 'bulk TIFF converter', 'TIFF to PDF free tool'],
    },
    'webp-to-pdf': {
      title: 'Convert WebP to PDF Free Online - WebP to PDF Converter',
      description: 'Combine multiple WebP images into one PDF, placing each uploaded image on a separate page in the resulting document.',
      keywords: ['WebP to PDF converter', 'convert WebP to PDF free', 'WebP to PDF online', 'WebP image to PDF', 'modern image converter', 'WebP to PDF free tool'],
    },
    'gif-to-pdf': {
      title: 'Convert GIF to PDF Free Online - GIF to PDF Converter',
      description: 'Convert the first frame of each GIF into a static PDF page and combine multiple uploaded GIF files into one document.',
      keywords: ['GIF to PDF converter', 'convert GIF to PDF free', 'GIF to PDF online', 'animated GIF converter', 'merge GIFs to PDF', 'GIF to PDF free tool'],
    },
    'heic-to-pdf': {
      title: 'Convert HEIC to PDF Free Online - HEIC to PDF Converter',
      description: 'Combine multiple HEIC images into one PDF, placing each uploaded image on a separate page and scaling larger images to fit.',
      keywords: ['HEIC to PDF converter', 'convert HEIC to PDF free', 'HEIC to PDF online', 'iPhone photo converter', 'merge HEIC to PDF', 'HEIC to PDF free tool'],
    },
    'eps-to-pdf': {
      title: 'Convert EPS to PDF Online Free (No Illustrator Needed)',
      description: 'Rasterize the first page of each EPS file with available PyMuPDF and Ghostscript support, then combine the rendered pages into a PDF.',
      keywords: ['EPS to PDF converter', 'convert EPS to PDF free', 'convert EPS without Adobe', 'Illustrator EPS to PDF', 'EPS file viewer PDF', 'batch convert EPS', 'EPS to PDF online'],
    },
    'images-to-pdf': {
      title: 'Convert Images to PDF Online Free (Merge Photos & Pictures)',
      description: 'Combine JPG, PNG, GIF, WebP, TIFF, or HEIC images into one PDF, with one static page for each uploaded image.',
      keywords: ['convert images to PDF', 'image to PDF converter', 'merge images to PDF', 'batch image to PDF', 'create PDF from images', 'multiple images to PDF free', 'JPG PNG to PDF'],
    },
    'pdf-to-word': {
      title: 'Convert PDF to Word Online Free - Edit PDFs Easily',
      description: 'Extract PDF text into a DOCX document, using OCR as a fallback for pages without extractable text; original page layout is not retained.',
      keywords: ['PDF to Word converter', 'convert PDF to Word', 'PDF to DOCX', 'edit PDF in Word', 'extract PDF to Word free', 'PDF to Word online'],
    },
    'word-to-pdf': {
      title: 'Word to PDF Converter - Convert DOC and DOCX Files',
      description: 'Convert a DOC or DOCX document with LibreOffice and download the resulting PDF without requiring desktop conversion software.',
      keywords: ['Word to PDF', 'DOC to PDF', 'DOCX to PDF', 'convert Word document', 'Word document converter', 'PDF converter'],
    },
    'powerpoint-to-pdf': {
      title: 'PowerPoint to PDF Converter - Convert PPT and PPTX',
      description: 'Convert a PPT or PPTX presentation with LibreOffice and download the resulting PDF for easier document sharing.',
      keywords: ['PowerPoint to PDF', 'PPT to PDF', 'PPTX to PDF', 'presentation to PDF', 'convert PowerPoint', 'PDF converter'],
    },
    'pdf-to-text': {
      title: 'PDF to Text Converter - Extract PDF Text to TXT',
      description: 'Extract available text from all or selected PDF pages into a TXT file, with page markers separating the extracted content.',
      keywords: ['PDF to text', 'PDF to TXT', 'extract PDF text', 'convert PDF to text', 'PDF text extractor', 'TXT converter'],
    },
    'pdf-to-epub': {
      title: 'PDF to EPUB Converter - Create an EPUB eBook',
      description: 'Convert a PDF document to an EPUB eBook using the Calibre conversion engine and download the resulting EPUB file.',
      keywords: ['PDF to EPUB', 'convert PDF to EPUB', 'PDF eBook converter', 'create EPUB', 'EPUB converter', 'Calibre conversion'],
    },
    'epub-to-pdf': {
      title: 'EPUB to PDF Converter - Convert an EPUB eBook',
      description: 'Convert an EPUB eBook to a PDF document using the Calibre conversion engine and download the resulting PDF file.',
      keywords: ['EPUB to PDF', 'convert EPUB to PDF', 'eBook to PDF', 'EPUB converter', 'Calibre conversion', 'PDF document'],
    },
    'mobi-to-pdf': {
      title: 'MOBI to PDF Converter - Convert a MOBI eBook',
      description: 'Convert a MOBI eBook to a PDF document using the Calibre conversion engine and download the resulting PDF file.',
      keywords: ['MOBI to PDF', 'convert MOBI to PDF', 'eBook to PDF', 'MOBI converter', 'Calibre conversion', 'PDF document'],
    },
    'azw3-to-pdf': {
      title: 'AZW3 to PDF Converter - Convert a Kindle eBook',
      description: 'Convert an AZW3 eBook to a PDF document using the Calibre conversion engine and download the resulting PDF file.',
      keywords: ['AZW3 to PDF', 'convert AZW3 to PDF', 'Kindle to PDF', 'eBook converter', 'Calibre conversion', 'PDF document'],
    },
    'url-to-pdf': {
      title: 'URL to PDF Converter - Save a Webpage as PDF',
      description: 'Capture a full webpage as a screenshot and place it in a PDF, using the supplied public URL as the source.',
      keywords: ['URL to PDF', 'webpage to PDF', 'website screenshot PDF', 'save webpage as PDF', 'web capture', 'online PDF converter'],
    },
    'edit-pdf': {
      title: 'Edit PDF Text Online - Visual PDF Editor',
      description: 'Edit supported PDF text through the visual preview and download the resulting PDF with the submitted text changes.',
      keywords: ['edit PDF', 'PDF text editor', 'edit PDF text online', 'visual PDF editor', 'change PDF text', 'PDF editing tool'],
    },
    'add-text': {
      title: 'Add Text to PDF - Position Custom Text on a Page',
      description: 'Add custom text to a selected PDF page with controls for position, font size, and color, then download the updated PDF.',
      keywords: ['add text to PDF', 'write on PDF', 'PDF text tool', 'insert text PDF', 'edit PDF page', 'PDF editor'],
    },
    'add-watermark': {
      title: 'Add Watermark to PDF - Customize Text Watermarks',
      description: 'Add a text watermark to selected PDF pages with adjustable opacity, font size, and rotation, then download the marked PDF.',
      keywords: ['add watermark to PDF', 'PDF text watermark', 'watermark PDF pages', 'custom PDF watermark', 'PDF branding', 'mark PDF'],
    },
    'add-numbers-to-pdf': {
      title: 'Add Page Numbers to PDF - Choose Position and Range',
      description: 'Add sequential numbers to all or selected PDF pages with a chosen position, starting number, and font size.',
      keywords: ['add page numbers PDF', 'number PDF pages', 'PDF pagination', 'page number position', 'number selected pages', 'PDF editor'],
    },
    'annotate-pdf': {
      title: 'Annotate PDF Online - Add Highlights, Notes, and Marks',
      description: 'Add supported highlights, underlines, comments, text notes, or freehand marks to PDF pages and download the annotated PDF.',
      keywords: ['annotate PDF', 'highlight PDF', 'add notes to PDF', 'underline PDF text', 'PDF comments', 'PDF markup'],
    },
    'esign-pdf': {
      title: 'eSign PDF - Add an Electronic Signature Image',
      description: 'Place an image-based electronic signature on one or more PDF pages and download the signed document without certificate validation.',
      keywords: ['eSign PDF', 'add signature to PDF', 'electronic signature image', 'sign PDF pages', 'PDF signature tool', 'image signature'],
    },
    'extract-text-from-pdf': {
      title: 'Extract Text from PDF - Save PDF Content as TXT',
      description: 'Extract available text from all or selected PDF pages into a TXT file, with optional OCR fallback for scanned pages.',
      keywords: ['extract text from PDF', 'PDF text extractor', 'PDF to TXT', 'OCR PDF text', 'copy PDF text', 'extract selected pages'],
    },
    'extract-images-pdf': {
      title: 'Extract Images from PDF - Export Embedded Images',
      description: 'Extract embedded images from all or selected PDF pages as PNG or JPG files, with multiple results packaged in a ZIP archive.',
      keywords: ['extract images from PDF', 'PDF image extractor', 'export PDF images', 'PDF to PNG', 'PDF to JPG', 'embedded images'],
    },
    'extract-tables-from-pdf': {
      title: 'Extract PDF Tables - Export the First Table to CSV or XLSX',
      description: 'Detect tables in all or selected PDF pages and export the first detected table as a CSV or XLSX spreadsheet.',
      keywords: ['extract PDF tables', 'PDF table to CSV', 'PDF table to Excel', 'PDF to XLSX', 'table extractor', 'spreadsheet export'],
    },
    'pdf-to-docx': {
      title: 'PDF to DOCX Converter - Extract Text with OCR Fallback',
      description: 'Extract text from all or selected PDF pages into DOCX, using OCR when a page has no text layer; original layout is not retained.',
      keywords: ['PDF to DOCX', 'convert PDF to Word', 'PDF text to DOCX', 'OCR PDF to Word', 'PDF document converter', 'extract PDF text'],
    },
    'pdf-to-pptx': {
      title: 'PDF to PPTX Converter - Convert PDF Pages to Slides',
      description: 'Convert all or selected PDF pages into image-based slides in a PPTX presentation, with one PDF page placed on each slide.',
      keywords: ['PDF to PPTX', 'PDF to PowerPoint', 'convert PDF pages to slides', 'PDF presentation converter', 'image-based slides', 'PPTX converter'],
    },
    'pdf-to-xlsx': {
      title: 'PDF to XLSX Converter - Extract Tables to Excel',
      description: 'Extract detected PDF tables into page-based XLSX worksheets, using page text as a fallback when no table is detected.',
      keywords: ['PDF to XLSX', 'PDF to Excel', 'extract PDF tables', 'PDF spreadsheet converter', 'tables to Excel', 'XLSX converter'],
    },
    'pdf-to-html': {
      title: 'PDF to HTML Converter - Extract PDF Text for the Web',
      description: 'Extract text from all or selected PDF pages into a structured HTML file, using OCR when a page has no text layer.',
      keywords: ['PDF to HTML', 'convert PDF to HTML', 'extract PDF text', 'OCR PDF to HTML', 'HTML document converter', 'PDF web format'],
    },
    'pdf-to-rtf': {
      title: 'PDF to RTF Converter - Extract PDF Text to Rich Text',
      description: 'Extract text from all or selected PDF pages into an RTF document, using OCR when a page has no text layer.',
      keywords: ['PDF to RTF', 'convert PDF to rich text', 'extract PDF text', 'OCR PDF to RTF', 'RTF converter', 'PDF document converter'],
    },
    'compress-pdf': {
      title: 'Compress PDF - Reduce PDF File Size',
      description: 'Apply stream and object compression to a PDF with low, medium, or high settings; file-size reduction depends on its contents.',
      keywords: ['compress PDF', 'reduce PDF size', 'PDF compression', 'shrink PDF file', 'optimize PDF', 'smaller PDF'],
    },
    'pdf-translator': {
      title: 'PDF Translator - Translate Extractable PDF Text',
      description: 'Translate extractable text from selected PDF pages into a chosen language and export the result as TXT or PDF.',
      keywords: ['PDF translator', 'translate PDF text', 'PDF language converter', 'translated PDF', 'PDF to text translation', 'document translator'],
    },
    'pdf-ocr': {
      title: 'PDF OCR - Recognize Text in Scanned PDF Pages',
      description: 'Use OCR on all or selected scanned PDF pages and export recognized text as DOCX, TXT, or a searchable PDF.',
      keywords: ['PDF OCR', 'scanned PDF text', 'OCR PDF to Word', 'searchable PDF', 'extract scanned text', 'PDF to TXT OCR'],
    },
    'pdf-deskew': {
      title: 'Deskew PDF - Straighten Scanned PDF Pages',
      description: 'Detect page tilt, straighten all or selected scanned PDF pages, and export the corrected pages in a rasterized PDF.',
      keywords: ['deskew PDF', 'straighten scanned PDF', 'fix tilted PDF', 'rotate scanned pages', 'scan correction', 'PDF alignment'],
    },
    'pdf-enhance-scan': {
      title: 'Enhance Scanned PDF - Denoise Scanned Pages',
      description: 'Apply denoising to all or selected scanned PDF pages and export the processed pages as a rasterized PDF.',
      keywords: ['enhance scanned PDF', 'denoise PDF', 'clean scanned pages', 'improve PDF scan', 'scanned document tool', 'PDF denoising'],
    },
  };

  const config = seoConfig[slug] || {
    title: `${tool.title} - Free Online PDF Tool | SimplifyConvert`,
    description: tool.description,
    keywords: [tool.title, 'PDF tool', 'PDF converter', 'free tool'],
  };

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      siteName: 'SimplifyConvert',
      title: config.title,
      description: config.description,
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: tool.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [`${baseUrl}/og-image.jpg`],
      creator: '@SimplifyConvert',
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

const PAGE_LEVEL_SOFTWARE_SCHEMA_TOOL_IDS = new Set([
  'eps-to-pdf',
  'heic-to-pdf',
  'images-to-pdf',
  'pdf-to-word',
]);

export default async function PdfSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const tool = getPdfToolById(slug);

  if (!tool) {
    return <>{children}</>;
  }

  const canonicalUrl = `https://simplifyconvert.com/all-tools/pdf/${slug}`;
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: 'https://simplifyconvert.com' },
    { name: 'PDF Tools', url: 'https://simplifyconvert.com/all-tools/pdf' },
    { name: tool.title, url: canonicalUrl },
  ]);
  const softwareSchema = generateSoftwareApplicationSchema({
    name: tool.title,
    description: tool.description,
    url: canonicalUrl,
    applicationCategory: 'UtilitiesApplication',
  });

  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {!PAGE_LEVEL_SOFTWARE_SCHEMA_TOOL_IDS.has(tool.id) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      )}
    </>
  );
}
