import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EPS to SVG Converter - Convert Vector Artwork | SimplifyConvert',
  description: 'Convert EPS vector artwork to SVG using server-side vector conversion for editable SVG output.',
  keywords: ['eps to svg', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/eps-to-svg',
    siteName: 'SimplifyConvert',
    title: 'EPS to SVG Converter - Convert Vector Artwork',
    description: 'Convert EPS vector artwork to SVG using server-side vector conversion for editable SVG output.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'EPS to SVG' }],
  },
  twitter: { card: 'summary_large_image', title: 'EPS to SVG', description: 'Convert EPS vector artwork to SVG using server-side vector conversion for editable SVG output.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/eps-to-svg' },
};

export default function EpsToSvgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
