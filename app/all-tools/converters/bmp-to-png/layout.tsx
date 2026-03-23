import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BMP to PNG - Free Lossless Image Converter | SimplifyConvert',
  description: 'Convert BMP to PNG format with transparency support. Preserve image quality.',
  keywords: ['bmp to png', 'convert bmp', 'image converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/bmp-to-png',
    siteName: 'SimplifyConvert',
    title: 'BMP to PNG - Free Lossless Image Converter',
    description: 'Convert BMP to PNG format with transparency support.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'BMP to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'BMP to PNG - Free Lossless Image Converter', description: 'Convert BMP to PNG format with transparency support.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/bmp-to-png' },
};

export default function BmpToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
