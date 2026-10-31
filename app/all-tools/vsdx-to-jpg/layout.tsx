import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VSDX to JPG Converter - Convert Visio to JPG | SimplifyConvert',
  description: 'Convert VSDX Visio diagrams to JPG images online. Create a flattened image snapshot for easier viewing, sharing, and use in documents.',
  keywords: ['vsdx to jpg', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/vsdx-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'VSDX to JPG - Free Online Tool',
    description: 'Convert VSDX Visio diagrams to JPG images online. Create a flattened image snapshot for easier viewing, sharing, and use in documents.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'VSDX to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'VSDX to JPG', description: 'Convert VSDX Visio diagrams to JPG images online. Create a flattened image snapshot for easier viewing, sharing, and use in documents.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/vsdx-to-jpg' },
};

export default function VsdxToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
