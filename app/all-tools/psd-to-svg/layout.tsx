import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PSD to SVG Converter - Embed PSD Rendering in SVG | SimplifyConvert',
  description: 'Convert a Photoshop PSD into an SVG document containing the rendered PSD image. The output uses embedded raster content, not editable vector paths.',
  keywords: ['psd to svg', 'convert psd to svg', 'photoshop psd to svg', 'embedded image svg', 'psd converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/psd-to-svg',
    siteName: 'SimplifyConvert',
    title: 'PSD to SVG Converter - Render PSD into SVG',
    description: 'Convert a Photoshop PSD into an SVG document containing an embedded raster rendering of the design.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PSD to SVG Converter' }],
  },
  twitter: { card: 'summary_large_image', title: 'PSD to SVG Converter', description: 'Convert a Photoshop PSD into an SVG document containing an embedded raster rendering.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/psd-to-svg' },
};

export default function PsdToSvgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

