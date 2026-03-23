import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebP to JPG - Free Modern Format Converter | SimplifyConvert',
  description: 'Convert WebP images to JPG format. Universal compatibility and smaller file sizes.',
  keywords: ['webp to jpg', 'convert webp', 'image converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/webp-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'WebP to JPG - Free Modern Format Converter',
    description: 'Convert WebP images to JPG format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'WebP to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'WebP to JPG - Free Modern Format Converter', description: 'Convert WebP images to JPG format.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/webp-to-jpg' },
};

export default function WebpToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
