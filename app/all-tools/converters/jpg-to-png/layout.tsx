import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JPG to PNG - Free Image Format Converter | SimplifyConvert',
  description: 'Convert JPG images to PNG format with transparent backgrounds. Fast and easy conversion.',
  keywords: ['jpg to png', 'convert jpg', 'image converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/jpg-to-png',
    siteName: 'SimplifyConvert',
    title: 'JPG to PNG - Free Image Format Converter',
    description: 'Convert JPG images to PNG format with transparent backgrounds.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'JPG to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'JPG to PNG - Free Image Format Converter', description: 'Convert JPG images to PNG format with transparent backgrounds.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/jpg-to-png' },
};

export default function JpgToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
