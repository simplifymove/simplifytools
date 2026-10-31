import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HEIC to JPG - Free Online Tool | SimplifyConvert',
  description: 'Convert HEIC images to JPG with server-assisted processing and prepare the converted result for download.',
  keywords: ['heic to jpg', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/heic-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'HEIC to JPG - Free Online Tool',
    description: 'Convert HEIC images to JPG with server-assisted processing and prepare the converted result for download.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'HEIC to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'HEIC to JPG', description: 'Convert HEIC images to JPG with server-assisted processing and prepare the converted result for download.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/heic-to-jpg' },
};

export default function HeicToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
