import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to JPG - Convert PDF Pages to JPG Images | SimplifyConvert',
  description: 'Convert PDF pages to JPG images, choose the output resolution, and download the generated images as a ZIP file.',
  keywords: ['pdf to jpg', 'pdf to image', 'convert pdf', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/pdf-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'PDF to JPG - Free PDF to Image Converter',
    description: 'Convert PDF pages to JPG images with selectable output resolution.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PDF to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'PDF to JPG - Free PDF to Image Converter', description: 'Convert PDF pages to JPG images with selectable output resolution.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/pdf-to-jpg' },
};

export default function PdfToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

