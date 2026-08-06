import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VSD to PDF - Free Visio to PDF Converter | SimplifyConvert',
  description: 'Convert Visio VSD diagrams to PDF online for easier sharing, printing, review, and archiving with server-assisted document conversion.',
  keywords: ['vsd to pdf', 'convert vsd', 'visio converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/vsd-to-pdf',
    siteName: 'SimplifyConvert',
    title: 'VSD to PDF - Free Visio to PDF Converter',
    description: 'Convert Visio VSD diagrams to PDF online for sharing, printing, review, and archiving.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'VSD to PDF' }],
  },
  twitter: { card: 'summary_large_image', title: 'VSD to PDF - Free Visio to PDF Converter', description: 'Convert Visio VSD diagrams to PDF online for sharing, printing, review, and archiving.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/vsd-to-pdf' },
};

export default function VsdToPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

