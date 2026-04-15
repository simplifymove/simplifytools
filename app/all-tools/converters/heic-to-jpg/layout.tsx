import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HEIC to JPG - Free Apple Image Format Converter | SimplifyConvert',
  description: 'Convert HEIC/HEIF images to JPG format. Compatible with all devices and platforms.',
  keywords: ['heic to jpg', 'convert heic', 'image converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/heic-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'HEIC to JPG - Free Apple Image Format Converter',
    description: 'Convert HEIC/HEIF images to JPG format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'HEIC to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'HEIC to JPG - Free Apple Image Format Converter', description: 'Convert HEIC/HEIF images to JPG format.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/heic-to-jpg' },
};

export default function HeicToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
