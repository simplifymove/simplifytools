import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PNG to WebP - Free Modern Image Format Converter | SimplifyConvert',
  description: 'Convert PNG to WebP format with optimal compression. Perfect for web optimization.',
  keywords: ['png to webp', 'convert webp', 'image optimizer', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/png-to-webp',
    siteName: 'SimplifyConvert',
    title: 'PNG to WebP - Free Modern Image Format Converter',
    description: 'Convert PNG to WebP format with optimal compression.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PNG to WebP' }],
  },
  twitter: { card: 'summary_large_image', title: 'PNG to WebP - Free Modern Image Format Converter', description: 'Convert PNG to WebP format with optimal compression.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/png-to-webp' },
};

export default function PngToWebpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
