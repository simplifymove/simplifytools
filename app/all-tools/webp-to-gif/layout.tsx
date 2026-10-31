import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebP to GIF Converter - Convert WebP to Static GIF | SimplifyConvert',
  description:
    'Convert a WebP image to static GIF format online. Upload a WebP file, preview the converted result, and download the GIF.',
  keywords: [
    'WebP to GIF',
    'convert WebP to GIF',
    'WebP GIF converter',
    'static GIF converter',
    'image converter',
  ],
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/webp-to-gif',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/webp-to-gif',
    siteName: 'SimplifyConvert',
    title: 'WebP to GIF Converter',
    description:
      'Convert WebP images to static GIF format online.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'WebP to GIF Converter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebP to GIF Converter | SimplifyConvert',
    description:
      'Convert WebP images to static GIF format online.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
};

export default function WebpToGifLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
