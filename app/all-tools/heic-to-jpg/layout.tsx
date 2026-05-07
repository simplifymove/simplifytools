import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HEIC to JPG - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit heic to jpg online instantly. Free tool without signup required.',
  keywords: ['heic to jpg', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/heic-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'HEIC to JPG - Free Online Tool',
    description: 'Convert and edit heic to jpg online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'HEIC to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'HEIC to JPG', description: 'Convert and edit heic to jpg online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/heic-to-jpg' },
};

export default function HeicToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
