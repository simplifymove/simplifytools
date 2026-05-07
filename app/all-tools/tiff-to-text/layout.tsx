import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TIFF to Text - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit tiff to text online instantly. Free tool without signup required.',
  keywords: ['tiff to text', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/tiff-to-text',
    siteName: 'SimplifyConvert',
    title: 'TIFF to Text - Free Online Tool',
    description: 'Convert and edit tiff to text online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'TIFF to Text' }],
  },
  twitter: { card: 'summary_large_image', title: 'TIFF to Text', description: 'Convert and edit tiff to text online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/tiff-to-text' },
};

export default function TiffToTextLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
