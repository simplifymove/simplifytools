import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JPG to TIFF - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit jpg to tiff online instantly. Free tool without signup required.',
  keywords: ['jpg to tiff', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/jpg-to-tiff',
    siteName: 'SimplifyConvert',
    title: 'JPG to TIFF - Free Online Tool',
    description: 'Convert and edit jpg to tiff online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'JPG to TIFF' }],
  },
  twitter: { card: 'summary_large_image', title: 'JPG to TIFF', description: 'Convert and edit jpg to tiff online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/jpg-to-tiff' },
};

export default function JpgToTiffLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
