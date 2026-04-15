import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TIFF to JPG - Free Image Format Converter | SimplifyConvert',
  description: 'Convert TIFF/TIF images to JPG format. Reduce file size while maintaining quality.',
  keywords: ['tiff to jpg', 'convert tiff', 'image converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/tiff-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'TIFF to JPG - Free Image Format Converter',
    description: 'Convert TIFF/TIF images to JPG format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'TIFF to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'TIFF to JPG - Free Image Format Converter', description: 'Convert TIFF/TIF images to JPG format.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/tiff-to-jpg' },
};

export default function TiffToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
