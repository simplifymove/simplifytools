import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'E-Sign PDF - Free Digital Signature Tool | SimplifyConvert',
  description: 'Add digital signatures to your PDF documents with ease. Free e-sign tool without signup required.',
  keywords: ['e-sign', 'sign pdf', 'digital signature', 'online signing'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/pdf/esign-pdf',
    siteName: 'SimplifyConvert',
    title: 'E-Sign PDF - Free Digital Signature Tool',
    description: 'Add digital signatures to your PDF documents with ease.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'E-Sign PDF Tool' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Sign PDF - Free Digital Signature Tool',
    description: 'Add digital signatures to your PDF documents with ease.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  // Correct canonical URL - self-canonical instead of parent page
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/pdf/esign-pdf' },
};

export default function EsignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

