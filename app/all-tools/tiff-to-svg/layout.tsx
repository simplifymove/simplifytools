import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TIFF to SVG - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit tiff to svg online instantly. Free tool without signup required.',
  keywords: ['tiff to svg', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/tiff-to-svg',
    siteName: 'SimplifyConvert',
    title: 'TIFF to SVG - Free Online Tool',
    description: 'Convert and edit tiff to svg online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'TIFF to SVG' }],
  },
  twitter: { card: 'summary_large_image', title: 'TIFF to SVG', description: 'Convert and edit tiff to svg online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/tiff-to-svg' },
};

export default function TiffToSvgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
