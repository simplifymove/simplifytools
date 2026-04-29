import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free PDF Tools - Merge, Split & Compress PDFs',
  description: 'Use free PDF tools to merge, split, compress, convert, and edit PDFs online. No signup needed. Fast, secure, completely free.',
  keywords: ['free PDF tools', 'PDF converter', 'merge PDF', 'split PDF', 'compress PDF', 'PDF editor online'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/pdf-tools',
    siteName: 'SimplifyConvert',
    title: 'Free PDF Tools - Merge, Split & Compress PDFs',
    description: 'Merge, split, compress, convert and edit PDFs online for free. No signup required.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Free PDF tools online for merging, splitting, and compressing PDF files',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free PDF Tools - Merge, Split & Compress PDFs',
    description: 'Merge, split, compress, convert and edit PDFs online for free. No signup required.',
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

