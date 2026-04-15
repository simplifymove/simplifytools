import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JPG to SVG - Free Vector Tracer | SimplifyConvert',
  description: 'Convert JPG images to SVG vector graphics. Trace and vectorize your designs.',
  keywords: ['jpg to svg', 'vectorize jpg', 'image tracer', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/jpg-to-svg',
    siteName: 'SimplifyConvert',
    title: 'JPG to SVG - Free Vector Tracer',
    description: 'Convert JPG images to SVG vector graphics.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'JPG to SVG' }],
  },
  twitter: { card: 'summary_large_image', title: 'JPG to SVG - Free Vector Tracer', description: 'Convert JPG images to SVG vector graphics.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/jpg-to-svg' },
};

export default function JpgToSvgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

