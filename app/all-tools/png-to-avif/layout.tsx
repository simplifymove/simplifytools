import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PNG to AVIF - Free Online Tool | SimplifyConvert',
  description: 'Convert PNG images to AVIF format with adjustable quality settings and server-assisted processing.',
  keywords: ['png to avif', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/png-to-avif',
    siteName: 'SimplifyConvert',
    title: 'PNG to AVIF - Free Online Tool',
    description: 'Convert PNG images to AVIF format with adjustable quality settings and server-assisted processing.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PNG to AVIF' }],
  },
  twitter: { card: 'summary_large_image', title: 'PNG to AVIF', description: 'Convert PNG images to AVIF format with adjustable quality settings and server-assisted processing.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/png-to-avif' },
};

export default function PngToAvifLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
