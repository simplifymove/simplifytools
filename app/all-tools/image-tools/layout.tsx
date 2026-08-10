import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Image Tools Online - Compress, Convert & Resize',
  description: 'Image tools for compression, resizing, cropping, format conversion, enhancement, and other supported workflows. Features and processing methods vary by tool.',
  keywords: ['free image tools', 'image converter', 'compress image', 'resize image', 'image editor online', 'PNG to JPG converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/image-tools',
    siteName: 'SimplifyConvert',
    title: 'Free Image Tools Online - Compress, Convert & Resize',
    description: 'Browse image tools for compression, resizing, cropping, conversion, enhancement, and other supported image workflows.',
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
    description: 'Browse image tools for conversion, compression, resizing, cropping, enhancement, and other supported workflows.',
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
