import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebP to JPG - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit webp to jpg online instantly. Free tool without signup required.',
  keywords: ['webp to jpg', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/webp-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'WebP to JPG - Free Online Tool',
    description: 'Convert and edit webp to jpg online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'WebP to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'WebP to JPG', description: 'Convert and edit webp to jpg online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/webp-to-jpg' },
};

export default function WebpToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
