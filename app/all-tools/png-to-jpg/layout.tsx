import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PNG to JPG - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit png to jpg online instantly. Free tool without signup required.',
  keywords: ['png to jpg', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/png-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'PNG to JPG - Free Online Tool',
    description: 'Convert and edit png to jpg online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PNG to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'PNG to JPG', description: 'Convert and edit png to jpg online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/png-to-jpg' },
};

export default function PngToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
