import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EPS to PNG - Free Vector to Raster Converter | SimplifyConvert',
  description: 'Convert EPS vector graphics to PNG images. Rasterize and preview vector files.',
  keywords: ['eps to png', 'convert eps', 'vector to image', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/eps-to-png',
    siteName: 'SimplifyConvert',
    title: 'EPS to PNG - Free Vector to Raster Converter',
    description: 'Convert EPS vector graphics to PNG images.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'EPS to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'EPS to PNG - Free Vector to Raster Converter', description: 'Convert EPS vector graphics to PNG images.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/eps-to-png' },
};

export default function EpsToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

