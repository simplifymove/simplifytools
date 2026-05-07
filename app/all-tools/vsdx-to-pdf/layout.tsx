import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VSDX to PDF - Free Visio to PDF Converter | SimplifyConvert',
  description: 'Convert Visio VSDX files to PDF format. Export diagrams easily and share.',
  keywords: ['vsdx to pdf', 'convert vsdx', 'visio converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/vsdx-to-pdf',
    siteName: 'SimplifyConvert',
    title: 'VSDX to PDF - Free Visio to PDF Converter',
    description: 'Convert Visio VSDX files to PDF format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'VSDX to PDF' }],
  },
  twitter: { card: 'summary_large_image', title: 'VSDX to PDF - Free Visio to PDF Converter', description: 'Convert Visio VSDX files to PDF format.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/vsdx-to-pdf' },
};

export default function VsdxToPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

