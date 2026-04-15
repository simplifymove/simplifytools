import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HEIC to PNG - Free Apple Image Format Converter | SimplifyConvert',
  description: 'Convert HEIC images to PNG format with transparency. Perfect for web use.',
  keywords: ['heic to png', 'convert heic', 'image converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/heic-to-png',
    siteName: 'SimplifyConvert',
    title: 'HEIC to PNG - Free Apple Image Format Converter',
    description: 'Convert HEIC images to PNG format with transparency.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'HEIC to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'HEIC to PNG - Free Apple Image Format Converter', description: 'Convert HEIC images to PNG format with transparency.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/heic-to-png' },
};

export default function HeicToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
