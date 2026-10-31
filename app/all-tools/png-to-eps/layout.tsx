import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PNG to EPS Converter - Trace PNG to EPS | SimplifyConvert',
  description: 'Convert PNG images to EPS by tracing raster shapes into vector paths. Best suited to logos, icons, symbols, and simple high-contrast artwork.',
  keywords: ['png to eps', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/png-to-eps',
    siteName: 'SimplifyConvert',
    title: 'PNG to EPS Converter - Trace PNG to EPS',
    description: 'Convert PNG images to EPS by tracing raster shapes into vector paths. Best suited to logos, icons, symbols, and simple high-contrast artwork.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PNG to EPS' }],
  },
  twitter: { card: 'summary_large_image', title: 'PNG to EPS', description: 'Convert PNG images to EPS by tracing raster shapes into vector paths. Best suited to logos, icons, symbols, and simple high-contrast artwork.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/png-to-eps' },
};

export default function PngToEpsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
