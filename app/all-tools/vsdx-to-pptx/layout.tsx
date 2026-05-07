import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VSDX to PPTX - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit vsdx to pptx online instantly. Free tool without signup required.',
  keywords: ['vsdx to pptx', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/vsdx-to-pptx',
    siteName: 'SimplifyConvert',
    title: 'VSDX to PPTX - Free Online Tool',
    description: 'Convert and edit vsdx to pptx online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'VSDX to PPTX' }],
  },
  twitter: { card: 'summary_large_image', title: 'VSDX to PPTX', description: 'Convert and edit vsdx to pptx online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/vsdx-to-pptx' },
};

export default function VsdxToPptxLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
