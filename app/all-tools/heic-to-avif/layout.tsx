import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HEIC to AVIF Converter - Convert HEIC Images Online | SimplifyConvert',
  description:
    'Convert HEIC and HEIF images to AVIF online with adjustable quality. Create AVIF images from HEIC photos and download the converted result.',
  keywords: [
    'HEIC to AVIF',
    'convert HEIC to AVIF',
    'HEIC AVIF converter',
    'HEIF to AVIF',
    'AVIF image converter',
  ],
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/heic-to-avif',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/heic-to-avif',
    siteName: 'SimplifyConvert',
    title: 'HEIC to AVIF Converter',
    description:
      'Convert HEIC and HEIF images to AVIF online with adjustable output quality.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HEIC to AVIF Converter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HEIC to AVIF Converter | SimplifyConvert',
    description:
      'Convert HEIC and HEIF images to AVIF online with adjustable output quality.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
};

export default function HeicToAvifLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
