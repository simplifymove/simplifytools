import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TIFF to AVIF Converter - Convert TIFF Images Online | SimplifyConvert',
  description:
    'Convert TIFF images to AVIF online with adjustable quality. Create modern AVIF images from TIFF files and download the converted result.',
  keywords: [
    'TIFF to AVIF',
    'convert TIFF to AVIF',
    'TIFF AVIF converter',
    'AVIF image converter',
    'convert TIFF online',
  ],
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/tiff-to-avif',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/tiff-to-avif',
    siteName: 'SimplifyConvert',
    title: 'TIFF to AVIF Converter',
    description:
      'Convert TIFF images to AVIF online with adjustable output quality.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TIFF to AVIF Converter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TIFF to AVIF Converter | SimplifyConvert',
    description:
      'Convert TIFF images to AVIF online with adjustable output quality.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
};

export default function TiffToAvifLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
