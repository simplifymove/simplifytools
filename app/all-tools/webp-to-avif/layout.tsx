import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebP to AVIF - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit webp to avif online instantly. Free tool without signup required.',
  keywords: ['webp to avif', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/webp-to-avif',
    siteName: 'SimplifyConvert',
    title: 'WebP to AVIF - Free Online Tool',
    description: 'Convert and edit webp to avif online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'WebP to AVIF' }],
  },
  twitter: { card: 'summary_large_image', title: 'WebP to AVIF', description: 'Convert and edit webp to avif online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/webp-to-avif' },
};

export default function WebpToAvifLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
