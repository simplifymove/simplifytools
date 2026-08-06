import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EPS to JPG - Convert Vector Artwork to JPEG | SimplifyConvert',
  description: 'Convert EPS vector artwork to JPG using server-assisted rasterization and download the generated raster image.',
  keywords: ['eps to jpg', 'convert eps', 'vector to jpg', 'eps converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/eps-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'EPS to JPG - Free Vector to Image Converter',
    description: 'Convert EPS vector graphics to JPG images.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'EPS to JPG Converter' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EPS to JPG - Free Vector to Image Converter',
    description: 'Convert EPS vector graphics to JPG images.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/eps-to-jpg' },
};

export default function EpsToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
