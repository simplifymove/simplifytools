import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VSDX to DOCX - Free Visio to Word Converter | SimplifyConvert',
  description: 'Convert Visio VSDX files to DOCX Word documents. Extract shapes, text, and formatting easily.',
  keywords: ['vsdx to docx', 'convert vsdx', 'visio to word', 'visio converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/vsdx-to-docx',
    siteName: 'SimplifyConvert',
    title: 'VSDX to DOCX - Free Visio to Word Converter',
    description: 'Convert Visio VSDX files to DOCX Word documents.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'VSDX to DOCX' }],
  },
  twitter: { card: 'summary_large_image', title: 'VSDX to DOCX - Free Visio to Word Converter', description: 'Convert Visio VSDX files to DOCX format.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/vsdx-to-docx' },
};

export default function VsdxToDocxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
