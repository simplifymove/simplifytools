import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF to Text - Free PDF Text Extractor | SimplifyConvert',
  description: 'Extract text from PDF files instantly. Convert documents to editable text format.',
  keywords: ['pdf to text', 'extract text', 'convert pdf', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/pdf-to-text',
    siteName: 'SimplifyConvert',
    title: 'PDF to Text - Free PDF Text Extractor',
    description: 'Extract text from PDF files instantly.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PDF to Text' }],
  },
  twitter: { card: 'summary_large_image', title: 'PDF to Text - Free PDF Text Extractor', description: 'Extract text from PDF files instantly.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/pdf-to-text' },
};

export default function PdfToTextLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

