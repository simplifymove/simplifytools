import { Metadata } from 'next';
import { getPdfToolById } from '@/app/lib/pdf-tools';

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
      title: 'Merge PDF Files Online - Fast & Free Tool',
      description: 'Combine multiple PDF files into one document instantly. Free PDF merger tool - no registration required. Fast, secure, and preserves formatting.',
      keywords: ['merge PDF', 'combine PDF files', 'PDF merger', 'join PDFs', 'free PDF tool', 'online PDF merger'],
    },
    'split-pdf': {
      title: 'Split PDF Online Free | Extract PDF Pages',
      description: 'Split PDF files by pages or ranges. Free online tool to extract, separate, and divide PDFs instantly without registration.',
      keywords: ['split PDF', 'separate PDF pages', 'extract PDF', 'divide PDF', 'PDF splitter', 'free PDF tool'],
    },
    'rotate-pdf': {
      title: 'Rotate PDF Pages - Free Online Tool (No Signup)',
      description: 'Rotate PDF pages 90°, 180°, or 270° online instantly. Free tool, no signup required. Fix PDF orientation, preserves quality, download in seconds.',
      keywords: ['rotate PDF', 'rotate PDF pages', 'PDF rotation tool', 'rotate PDF 90 degrees', 'free PDF rotator', 'PDF page orientation'],
    },
    'rearrange-pdf': {
      title: 'Rearrange PDF Pages Online Free | Reorder PDF',
      description: 'Rearrange PDF pages in custom order instantly. Free online tool to reorder pages by entering desired sequence. No registration needed. Fast, simple page ordering.',
      keywords: ['rearrange PDF', 'reorder PDF pages', 'PDF page reordering', 'arrange PDF pages', 'rearrange PDF online', 'PDF reorganizer'],
    },
    'crop-pdf': {
      title: 'Crop PDF Pages Online Free - Visual PDF Cropper Tool',
      description: 'Crop and trim PDF pages online instantly with our free visual editor. Remove margins, resize pages, extract specific areas without losing quality. No software needed.',
      keywords: ['crop PDF', 'crop PDF pages', 'PDF cropper', 'trim PDF margins', 'resize PDF pages online free', 'remove PDF margins', 'extract PDF areas'],
    },
    'pdf-page-deleter': {
      title: 'Delete PDF Pages Online Free - Easy PDF Page Remover',
      description: 'Remove unwanted pages from PDF files instantly with our free online page deleter. Select specific pages to delete, no software needed. Download your edited PDF immediately.',
      keywords: ['delete PDF pages', 'remove PDF pages', 'PDF page deleter online', 'remove pages from PDF free', 'delete specific pages PDF', 'edit PDF remove pages'],
    },
    'create-pdf': {
      title: 'Create PDF from Images Online Free - Image to PDF Converter',
      description: 'Convert JPG, PNG, and TIFF images to PDF documents online instantly. Merge multiple images into one PDF with adjustable compression. No signup required.',
      keywords: ['create PDF from images', 'image to PDF converter online', 'convert images to PDF free', 'merge images to PDF', 'JPG to PDF online', 'make PDF from photos'],
    },
    'protect-pdf': {
      title: 'Password Protect PDF Online Free - Encrypt PDF Documents',
      description: 'Add password protection to PDF files instantly. Secure your documents with encryption online - no software needed. Free PDF password protection tool, instant download.',
      keywords: ['protect PDF', 'password protect PDF online', 'encrypt PDF file', 'PDF security password', 'secure PDF documents free', 'lock PDF with password'],
    },
    'unlock-pdf': {
      title: 'Unlock PDF Online Free - Remove Password Protection',
      description: 'Remove password protection from encrypted PDF files instantly. Unlock password-protected PDFs online for free. No software needed. Fast, secure processing.',
      keywords: ['unlock PDF', 'remove PDF password', 'unlock password protected PDF', 'decrypt PDF', 'remove password from PDF', 'unlock encrypted PDF'],
    },
    'pdf-watermark-remover': {
      title: 'Remove PDF Watermarks Online - Free Watermark Remover',
      description: 'Remove watermarks from PDF documents instantly. Free online watermark remover for PDFs - no software needed. Remove text, graphics, annotations. Fast, secure processing.',
      keywords: ['remove PDF watermark', 'PDF watermark remover', 'remove watermark from PDF', 'watermark removal online', 'free PDF watermark remover', 'remove PDF text', 'delete PDF watermark'],
    },
    'pdf-to-jpg': {
      title: 'Convert PDF to JPG Free - Online PDF to Image Tool',
      description: 'Convert PDF pages to high-quality JPG images online for free. Fast converter with multiple DPI options (72-600 DPI). No software needed. Extract all PDF pages as JPG images instantly.',
      keywords: ['PDF to JPG converter', 'convert PDF to JPG free', 'PDF to image conversion', 'extract images from PDF', 'convert PDF pages to JPG online', 'PDF to JPG free tool'],
    },
    'pdf-to-png': {
      title: 'Convert PDF to PNG Free - Online PNG Converter Tool',
      description: 'Convert PDF pages to high-quality PNG images with transparent backgrounds online for free. No software needed. Support for transparency, lossless compression. Extract all PDF pages as PNG images instantly.',
      keywords: ['PDF to PNG converter', 'convert PDF to PNG free', 'PDF to PNG online', 'convert PDF pages to PNG', 'transparent PNG from PDF', 'PDF to PNG free tool'],
    },
    'pdf-to-tiff': {
      title: 'Convert PDF to TIFF Free - Online TIFF Converter Tool',
      description: 'Convert PDF pages to high-quality TIFF images online for free. Professional TIFF converter with multiple DPI options (72-600 DPI). No software needed. Extract all PDF pages as TIFF instantly.',
      keywords: ['PDF to TIFF converter', 'convert PDF to TIFF free', 'TIFF converter online', 'convert PDF pages to TIFF', 'PDF to TIFF online', 'PDF to TIFF free tool'],
    },
    'jpg-to-pdf': {
      title: 'Convert JPG to PDF Free - Online JPG to PDF Converter',
      description: 'Convert JPG, JPEG, and PNG images to high-quality PDF documents online for free. Merge multiple images into a single PDF, adjust compression (0–9), and download instantly. No installation required.',
      keywords: ['JPG to PDF converter', 'convert JPG to PDF free', 'image to PDF online', 'create PDF from images', 'merge images to PDF', 'JPG to PDF free tool', 'online JPG converter'],
    },
    'png-to-pdf': {
      title: 'Convert PNG to PDF Free Online - PNG to PDF Converter',
      description: 'Convert PNG images to professional PDF documents online for free. Merge multiple PNGs, adjust compression (0–9), and download instantly. No installation required.',
      keywords: ['PNG to PDF converter', 'convert PNG to PDF free', 'PNG to PDF online', 'image to PDF converter', 'create PDF from PNG', 'PNG to PDF free tool'],
    },
    'tiff-to-pdf': {
      title: 'Convert TIFF to PDF Free Online - TIFF to PDF Converter',
      description: 'Convert TIFF images to professional PDF documents online for free. Merge multiple TIFFs, adjust compression (0–9), and download instantly. No installation required.',
      keywords: ['TIFF to PDF converter', 'convert TIFF to PDF free', 'TIFF to PDF online', 'TIFF image to PDF', 'bulk TIFF converter', 'TIFF to PDF free tool'],
    },
    'webp-to-pdf': {
      title: 'Convert WebP to PDF Free Online - WebP to PDF Converter',
      description: 'Convert WebP images to professional PDF documents online for free. Merge multiple WebP files, adjust compression (0–9), and download instantly. No installation required.',
      keywords: ['WebP to PDF converter', 'convert WebP to PDF free', 'WebP to PDF online', 'WebP image to PDF', 'modern image converter', 'WebP to PDF free tool'],
    },
    'gif-to-pdf': {
      title: 'Convert GIF to PDF Free Online - GIF to PDF Converter',
      description: 'Convert GIF images to professional PDF documents online for free. Merge multiple GIFs, adjust compression (0–9), and download instantly. No installation required.',
      keywords: ['GIF to PDF converter', 'convert GIF to PDF free', 'GIF to PDF online', 'animated GIF converter', 'merge GIFs to PDF', 'GIF to PDF free tool'],
    },
    'heic-to-pdf': {
      title: 'Convert HEIC to PDF Free Online - HEIC to PDF Converter',
      description: 'Convert HEIC images to professional PDF documents online for free. Merge multiple HEIC files from iPhone or iPad, adjust compression (0–9), and download instantly. No installation required.',
      keywords: ['HEIC to PDF converter', 'convert HEIC to PDF free', 'HEIC to PDF online', 'iPhone photo converter', 'merge HEIC to PDF', 'HEIC to PDF free tool'],
    },
    'eps-to-pdf': {
      title: 'Convert EPS to PDF Online Free (No Illustrator Needed)',
      description: 'Convert EPS files without Adobe Illustrator. Convert EPS to PDF online free. Works as EPS file viewer. Merge multiple EPS files, adjust compression (0–9), and download instantly.',
      keywords: ['EPS to PDF converter', 'convert EPS to PDF free', 'convert EPS without Adobe', 'Illustrator EPS to PDF', 'EPS file viewer PDF', 'batch convert EPS', 'EPS to PDF online'],
    },
    'images-to-pdf': {
      title: 'Convert Images to PDF Online Free (Merge Photos & Pictures)',
      description: 'Merge multiple images (JPG, PNG, GIF, WEBP, TIFF, HEIC) into PDF online free. Batch convert, adjust compression (0–9), reorder files, and download instantly. No signup required.',
      keywords: ['convert images to PDF', 'image to PDF converter', 'merge images to PDF', 'batch image to PDF', 'create PDF from images', 'multiple images to PDF free', 'JPG PNG to PDF'],
    },
    'pdf-to-word': {
      title: 'Convert PDF to Word Online Free - Edit PDFs Easily',
      description: 'Convert PDF to Word (DOCX) documents online for free. Extract text and preserve formatting instantly. Edit PDFs in Microsoft Word without software. No registration required.',
      keywords: ['PDF to Word converter', 'convert PDF to Word', 'PDF to DOCX', 'edit PDF in Word', 'extract PDF to Word free', 'PDF to Word online'],
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

export default function PdfSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
