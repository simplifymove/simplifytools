import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebP to PNG Converter - Convert WebP Images Online | SimplifyConvert',
  description:
    'Convert WebP images to PNG online with lossless PNG encoding and transparency support. Free WebP to PNG converter with no software installation required.',
  keywords: [
    'WebP to PNG',
    'convert WebP to PNG',
    'WebP PNG converter',
    'WebP image converter',
    'convert WebP online',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/webp-to-png',
    siteName: 'SimplifyConvert',
    title: 'WebP to PNG Converter | SimplifyConvert',
    description:
      'Convert WebP images to PNG with lossless PNG encoding and transparency support.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'WebP to PNG Converter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebP to PNG Converter | SimplifyConvert',
    description:
      'Convert WebP images to PNG with lossless PNG encoding and transparency support.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/webp-to-png',
  },
};

export default function WebpToPngLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
