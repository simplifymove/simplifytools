import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VSD to DOCX - Free Visio to Word Converter | SimplifyConvert',
  description: 'Convert Visio VSD diagrams to DOCX Word format. Export documents easily.',
  keywords: ['vsd to docx', 'convert vsd', 'visio converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/vsd-to-docx',
    siteName: 'SimplifyConvert',
    title: 'VSD to DOCX - Free Visio to Word Converter',
    description: 'Convert Visio VSD diagrams to DOCX Word format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'VSD to DOCX' }],
  },
  twitter: { card: 'summary_large_image', title: 'VSD to DOCX - Free Visio to Word Converter', description: 'Convert Visio VSD diagrams to DOCX Word format.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/vsd-to-docx' },
};

export default function VsdToDocxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

