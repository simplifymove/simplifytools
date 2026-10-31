import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'E-Sign PDF - Add Electronic Signatures Online | SimplifyConvert',
  description:
    'Add an electronic signature to PDF documents online. Draw a signature or upload a signature image, position it on PDF pages, and download the signed file.',
  keywords: [
    'e-sign PDF',
    'sign PDF online',
    'electronic signature',
    'add signature to PDF',
    'PDF signature tool',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/pdf/esign-pdf',
    siteName: 'SimplifyConvert',
    title: 'E-Sign PDF - Add Electronic Signatures Online',
    description:
      'Draw or upload an electronic signature and place it on PDF pages online.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'E-Sign PDF Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Sign PDF - Add Electronic Signatures Online',
    description:
      'Draw or upload an electronic signature and place it on PDF pages online.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/pdf/esign-pdf',
  },
};

export default function EsignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
