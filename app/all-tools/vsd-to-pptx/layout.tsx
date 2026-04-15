import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VSD to PPTX - Free Visio to PowerPoint Converter | SimplifyConvert',
  description: 'Convert Visio VSD diagrams to PPTX PowerPoint format. Present your diagrams.',
  keywords: ['vsd to pptx', 'convert vsd', 'visio converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/vsd-to-pptx',
    siteName: 'SimplifyConvert',
    title: 'VSD to PPTX - Free Visio to PowerPoint Converter',
    description: 'Convert Visio VSD diagrams to PPTX PowerPoint format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'VSD to PPTX' }],
  },
  twitter: { card: 'summary_large_image', title: 'VSD to PPTX - Free Visio to PowerPoint Converter', description: 'Convert Visio VSD diagrams to PPTX PowerPoint format.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/vsd-to-pptx' },
};

export default function VsdToPptxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
