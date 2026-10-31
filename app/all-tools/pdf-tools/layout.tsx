import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Tools - Merge, Split, Compress & Convert',
  description: 'Browse PDF tools for combining, splitting, compressing, converting, editing, and signing documents. Formats and limits vary by workflow.',
  keywords: ['free PDF tools', 'PDF converter', 'merge PDF', 'split PDF', 'compress PDF', 'PDF editor online'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/pdf-tools',
    siteName: 'SimplifyConvert',
    title: 'PDF Tools - Merge, Split, Compress & Convert',
    description: 'Combine, split, compress, convert, edit, and sign PDF documents online.',
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
    title: 'PDF Tools - Merge, Split, Compress & Convert',
    description: 'Combine, split, compress, convert, edit, and sign PDF documents online.',
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
