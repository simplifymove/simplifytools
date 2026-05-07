import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PNG to TIFF - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit png to tiff online instantly. Free tool without signup required.',
  keywords: ['png to tiff', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/png-to-tiff',
    siteName: 'SimplifyConvert',
    title: 'PNG to TIFF - Free Online Tool',
    description: 'Convert and edit png to tiff online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PNG to TIFF' }],
  },
  twitter: { card: 'summary_large_image', title: 'PNG to TIFF', description: 'Convert and edit png to tiff online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/png-to-tiff' },
};

export default function PngToTiffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
