import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Tools - Compress, Convert, Resize, Enhance Images Online | SimplifyConvert',
  description: 'Free image tools online. Compress, convert, resize, enhance, and edit images. JPG, PNG, WebP, BMP converters. No upload limits.',
  keywords: ['image converter', 'image editor', 'compress image', 'resize image', 'image enhancement', 'online image tools'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/image-tools',
    siteName: 'SimplifyConvert',
    title: 'Image Tools - Free Online Image Converter & Editor',
    description: 'Compress, convert, resize and enhance images online for free. JPG, PNG, WebP, BMP and more.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Image Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Tools - Free Online Image Converter & Editor',
    description: 'Compress, convert, resize and enhance images online for free.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/image-tools',
  },
};

export default function ImageToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
