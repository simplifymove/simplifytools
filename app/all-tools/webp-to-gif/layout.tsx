import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebP to GIF - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit webp to gif online instantly. Free tool without signup required.',
  keywords: ['webp to gif', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/webp-to-gif',
    siteName: 'SimplifyConvert',
    title: 'WebP to GIF - Free Online Tool',
    description: 'Convert and edit webp to gif online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'WebP to GIF' }],
  },
  twitter: { card: 'summary_large_image', title: 'WebP to GIF', description: 'Convert and edit webp to gif online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/webp-to-gif' },
};

export default function WebpToGifLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
