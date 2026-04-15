import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Tools - Free Online Converters, Editors & AI Tools | SimplifyConvert',
  description: 'Explore 100+ free online tools including image converters, video editors, PDF tools, AI writers, and data conversion utilities. No signup required.',
  keywords: ['online tools', 'converter', 'editor', 'free tools', 'image converter', 'video converter', 'pdf tools'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools',
    siteName: 'SimplifyConvert',
    title: 'All Tools - Free Online Converters & Editors',
    description: 'Explore 100+ free online tools for images, videos, PDFs, AI writing, and data conversion.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SimplifyConvert - All Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Tools - Free Online Converters & Editors',
    description: 'Explore 100+ free online tools for images, videos, PDFs, AI writing, and data conversion.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools',
  },
};

export default function AllToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

