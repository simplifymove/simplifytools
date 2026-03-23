import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JPG to WebP - Free High-Quality Image Converter | SimplifyConvert',
  description: 'Convert JPG to WebP format with superior compression. Optimize images for web performance.',
  keywords: ['jpg to webp', 'convert webp', 'image optimizer', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/jpg-to-webp',
    siteName: 'SimplifyConvert',
    title: 'JPG to WebP - Free High-Quality Image Converter',
    description: 'Convert JPG to WebP format with superior compression.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'JPG to WebP' }],
  },
  twitter: { card: 'summary_large_image', title: 'JPG to WebP - Free High-Quality Image Converter', description: 'Convert JPG to WebP format with superior compression.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/jpg-to-webp' },
};

export default function JpgToWebpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
