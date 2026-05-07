import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EPS to SVG - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit eps to svg online instantly. Free tool without signup required.',
  keywords: ['eps to svg', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/eps-to-svg',
    siteName: 'SimplifyConvert',
    title: 'EPS to SVG - Free Online Tool',
    description: 'Convert and edit eps to svg online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'EPS to SVG' }],
  },
  twitter: { card: 'summary_large_image', title: 'EPS to SVG', description: 'Convert and edit eps to svg online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/eps-to-svg' },
};

export default function EpsToSvgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
