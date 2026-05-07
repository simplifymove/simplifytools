import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PNG to WebP - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit png to webp online instantly. Free tool without signup required.',
  keywords: ['png to webp', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/png-to-webp',
    siteName: 'SimplifyConvert',
    title: 'PNG to WebP - Free Online Tool',
    description: 'Convert and edit png to webp online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PNG to WebP' }],
  },
  twitter: { card: 'summary_large_image', title: 'PNG to WebP', description: 'Convert and edit png to webp online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/png-to-webp' },
};

export default function PngToWebpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
