import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebP to JPG - Compatibility and Quality Tradeoffs',
  description: 'Convert a WebP still image to same-dimension JPEG with adjustable quality, while accounting for transparency, animation, metadata, and recompression limits.',
  keywords: ['WebP to JPG', 'convert WebP to JPG', 'WebP converter', 'free image converter', 'online converter', 'format conversion', 'image compatibility'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/webp-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'WebP to JPG - Compatibility and Quality Tradeoffs',
    description: 'Create a JPEG compatibility copy from WebP and inspect transparency and re-encoding changes.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'WebP to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'WebP to JPG Converter', description: 'Convert WebP to JPEG with adjustable quality and explicit format limitations.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/webp-to-jpg' },
};

export default function WebpToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
