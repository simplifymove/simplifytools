import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TIFF to Text OCR - Extract Text from TIFF Images | SimplifyConvert',
  description:
    'Extract text from TIFF images using OCR. Choose a recognition language and download the result as plain text or searchable PDF.',
  keywords: [
    'TIFF to text',
    'TIFF OCR',
    'extract text from TIFF',
    'TIFF to TXT',
    'TIFF searchable PDF',
    'OCR image text',
  ],
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/tiff-to-text',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/tiff-to-text',
    siteName: 'SimplifyConvert',
    title: 'TIFF to Text OCR',
    description:
      'Extract text from TIFF images using OCR with TXT or searchable PDF output.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'TIFF to Text OCR',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TIFF to Text OCR | SimplifyConvert',
    description:
      'Extract text from TIFF images using OCR with TXT or searchable PDF output.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
};

export default function TiffToTextLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
