import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Tools - Merge, Split, Compress, Convert PDFs Online | SimplifyConvert',
  description: 'Free PDF tools online. Merge, split, compress, convert, and edit PDF files. Extract text, manipulate pages, and manage PDFs easily.',
  keywords: ['PDF converter', 'PDF editor', 'merge PDF', 'split PDF', 'compress PDF', 'PDF tools'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/pdf-tools',
    siteName: 'SimplifyConvert',
    title: 'PDF Tools - Free Online PDF Converter & Editor',
    description: 'Merge, split, compress, convert and edit PDFs online for free.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PDF Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDF Tools - Free Online PDF Converter & Editor',
    description: 'Merge, split, compress, convert and edit PDFs online for free.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/pdf-tools',
  },
};

export default function PDFToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

