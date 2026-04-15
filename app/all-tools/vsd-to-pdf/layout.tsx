import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VSD to PDF - Free Visio to PDF Converter | SimplifyConvert',
  description: 'Convert Visio VSD diagrams to PDF format. Share and print documents easily.',
  keywords: ['vsd to pdf', 'convert vsd', 'visio converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/vsd-to-pdf',
    siteName: 'SimplifyConvert',
    title: 'VSD to PDF - Free Visio to PDF Converter',
    description: 'Convert Visio VSD diagrams to PDF format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'VSD to PDF' }],
  },
  twitter: { card: 'summary_large_image', title: 'VSD to PDF - Free Visio to PDF Converter', description: 'Convert Visio VSD diagrams to PDF format.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/vsd-to-pdf' },
};

export default function VsdToPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
