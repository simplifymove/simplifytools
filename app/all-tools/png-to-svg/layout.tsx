import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PNG to SVG - Free Raster to Vector Converter | SimplifyConvert',
  description: 'Convert PNG images to SVG vector format. Trace and vectorize designs.',
  keywords: ['png to svg', 'vectorize image', 'image tracer', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/png-to-svg',
    siteName: 'SimplifyConvert',
    title: 'PNG to SVG - Free Raster to Vector Converter',
    description: 'Convert PNG images to SVG vector format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PNG to SVG' }],
  },
  twitter: { card: 'summary_large_image', title: 'PNG to SVG - Free Raster to Vector Converter', description: 'Convert PNG images to SVG vector format.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/png-to-svg' },
};

export default function PngToSvgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

