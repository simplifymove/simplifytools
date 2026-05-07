import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JPG to AVIF - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit jpg to avif online instantly. Free tool without signup required.',
  keywords: ['jpg to avif', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/jpg-to-avif',
    siteName: 'SimplifyConvert',
    title: 'JPG to AVIF - Free Online Tool',
    description: 'Convert and edit jpg to avif online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'JPG to AVIF' }],
  },
  twitter: { card: 'summary_large_image', title: 'JPG to AVIF', description: 'Convert and edit jpg to avif online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/jpg-to-avif' },
};

export default function JpgToAvifLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
