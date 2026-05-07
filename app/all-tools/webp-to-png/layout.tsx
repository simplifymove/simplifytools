import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebP to PNG - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit webp to png online instantly. Free tool without signup required.',
  keywords: ['webp to png', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/webp-to-png',
    siteName: 'SimplifyConvert',
    title: 'WebP to PNG - Free Online Tool',
    description: 'Convert and edit webp to png online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'WebP to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'WebP to PNG', description: 'Convert and edit webp to png online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/webp-to-png' },
};

export default function WebpToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
