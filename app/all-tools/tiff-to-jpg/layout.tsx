import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TIFF to JPG - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit tiff to jpg online instantly. Free tool without signup required.',
  keywords: ['tiff to jpg', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/tiff-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'TIFF to JPG - Free Online Tool',
    description: 'Convert and edit tiff to jpg online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'TIFF to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'TIFF to JPG', description: 'Convert and edit tiff to jpg online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/tiff-to-jpg' },
};

export default function TiffToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
