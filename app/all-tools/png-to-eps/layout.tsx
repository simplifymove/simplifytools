import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PNG to EPS - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit png to eps online instantly. Free tool without signup required.',
  keywords: ['png to eps', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/png-to-eps',
    siteName: 'SimplifyConvert',
    title: 'PNG to EPS - Free Online Tool',
    description: 'Convert and edit png to eps online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PNG to EPS' }],
  },
  twitter: { card: 'summary_large_image', title: 'PNG to EPS', description: 'Convert and edit png to eps online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/png-to-eps' },
};

export default function PngToEpsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
