import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TIFF to PNG - Free Lossless Format Converter | SimplifyConvert',
  description: 'Convert TIFF images to PNG format with transparency support. Preserve image quality.',
  keywords: ['tiff to png', 'convert tiff', 'image converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/tiff-to-png',
    siteName: 'SimplifyConvert',
    title: 'TIFF to PNG - Free Lossless Format Converter',
    description: 'Convert TIFF images to PNG format with transparency support.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'TIFF to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'TIFF to PNG - Free Lossless Format Converter', description: 'Convert TIFF images to PNG format with transparency support.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/tiff-to-png' },
};

export default function TiffToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

