import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebP to PNG - Free Format Converter | SimplifyConvert',
  description: 'Convert WebP to PNG format with transparency support. Perfect for design projects.',
  keywords: ['webp to png', 'convert webp', 'image converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/webp-to-png',
    siteName: 'SimplifyConvert',
    title: 'WebP to PNG - Free Format Converter',
    description: 'Convert WebP to PNG format with transparency support.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'WebP to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'WebP to PNG - Free Format Converter', description: 'Convert WebP to PNG format with transparency support.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/webp-to-png' },
};

export default function WebpToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
