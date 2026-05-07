import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TIFF to AVIF - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit tiff to avif online instantly. Free tool without signup required.',
  keywords: ['tiff to avif', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/tiff-to-avif',
    siteName: 'SimplifyConvert',
    title: 'TIFF to AVIF - Free Online Tool',
    description: 'Convert and edit tiff to avif online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'TIFF to AVIF' }],
  },
  twitter: { card: 'summary_large_image', title: 'TIFF to AVIF', description: 'Convert and edit tiff to avif online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/tiff-to-avif' },
};

export default function TiffToAvifLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
