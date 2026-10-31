import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  title: 'Free Online Tools for PDF, Images, Video & More',
  description:
    'Convert and edit PDFs, images, video, data, and code with free online tools. Create presentations, documents, and spreadsheets with Premium AI Studio.',
  alternates: {
    canonical: 'https://simplifyconvert.com',
  },
  openGraph: {
    title: 'Free Online Tools to Convert, Edit & Create Files',
    description:
      'Practical browser-based tools for PDFs, images, video, data, code, AI writing, and premium AI content creation.',
    url: 'https://simplifyconvert.com',
    siteName: 'SimplifyConvert',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SimplifyConvert online file tools and Premium AI Studio',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Tools to Convert, Edit & Create Files',
    description:
      'Practical browser-based tools for PDFs, images, video, data, code, AI writing, and premium AI content creation.',
    images: ['/og-image.jpg'],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
