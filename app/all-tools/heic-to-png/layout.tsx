import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HEIC to PNG - Free Online Tool | SimplifyConvert',
  description: 'Convert HEIC images to PNG format with server-assisted processing and download the converted result.',
  keywords: ['heic to png', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/heic-to-png',
    siteName: 'SimplifyConvert',
    title: 'HEIC to PNG - Free Online Tool',
    description: 'Convert HEIC images to PNG format with server-assisted processing and download the converted result.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'HEIC to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'HEIC to PNG', description: 'Convert HEIC images to PNG format with server-assisted processing and download the converted result.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/heic-to-png' },
};

export default function HeicToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
