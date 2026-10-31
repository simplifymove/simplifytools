import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collage Maker - Create Photo Collages Online | SimplifyConvert',
  description:
    'Create photo collages online with 2x2, 3x3, horizontal, and vertical layouts. Adjust image spacing, preview the result, and download your collage as PNG.',
  keywords: [
    'collage maker',
    'photo collage maker',
    'image collage',
    'online collage maker',
    'photo grid maker',
    'create collage online',
  ],
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/collage-maker',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/collage-maker',
    siteName: 'SimplifyConvert',
    title: 'Collage Maker - Create Photo Collages Online',
    description:
      'Combine multiple images into customizable collage layouts and download the result as PNG.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Collage Maker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Collage Maker | SimplifyConvert',
    description:
      'Combine multiple images into customizable collage layouts and download the result as PNG.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
};

export default function CollageMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
