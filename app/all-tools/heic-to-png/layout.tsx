import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HEIC to PNG - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit heic to png online instantly. Free tool without signup required.',
  keywords: ['heic to png', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/heic-to-png',
    siteName: 'SimplifyConvert',
    title: 'HEIC to PNG - Free Online Tool',
    description: 'Convert and edit heic to png online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'HEIC to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'HEIC to PNG', description: 'Convert and edit heic to png online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/heic-to-png' },
};

export default function HeicToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
