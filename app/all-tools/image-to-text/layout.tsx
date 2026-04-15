import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image to Text - Free OCR Converter | SimplifyConvert',
  description: 'Extract text from images using OCR. Convert scans and photos to editable text.',
  keywords: ['image to text', 'ocr', 'text recognition', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/image-to-text',
    siteName: 'SimplifyConvert',
    title: 'Image to Text - Free OCR Converter',
    description: 'Extract text from images using OCR.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Image to Text' }],
  },
  twitter: { card: 'summary_large_image', title: 'Image to Text - Free OCR Converter', description: 'Extract text from images using OCR.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/image-to-text' },
};

export default function ImageToTextLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

