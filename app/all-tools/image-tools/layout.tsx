import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Image Tools Online - Compress, Convert & Resize',
  description: 'Free online image tools to compress, convert, resize and enhance images. JPG, PNG, WebP converters. No signup required, fast and secure.',
  keywords: ['free image tools', 'image converter', 'compress image', 'resize image', 'image editor online', 'PNG to JPG converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/image-tools',
    siteName: 'SimplifyConvert',
    title: 'Free Image Tools Online - Compress, Convert & Resize',
    description: 'Free online image tools to compress, convert, resize and enhance images. JPG, PNG, WebP converters. No signup required.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Free image compression, conversion and editing tools online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image Tools Online - Compress, Convert & Resize',
    description: 'Free online image tools to compress, convert, resize and enhance images.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
};

export default function ImageToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
