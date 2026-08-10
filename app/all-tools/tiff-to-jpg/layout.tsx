import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TIFF to JPG - Free Online Tool | SimplifyConvert',
  description: 'Convert TIFF images to JPG with adjustable JPEG quality and server-assisted processing.',
  keywords: ['tiff to jpg', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/tiff-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'TIFF to JPG - Free Online Tool',
    description: 'Convert TIFF images to JPG with adjustable JPEG quality and server-assisted processing.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'TIFF to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'TIFF to JPG', description: 'Convert TIFF images to JPG with adjustable JPEG quality and server-assisted processing.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/tiff-to-jpg' },
};

export default function TiffToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
