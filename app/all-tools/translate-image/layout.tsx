import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Translate Image - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit translate image online instantly. Free tool without signup required.',
  keywords: ['translate image', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/translate-image',
    siteName: 'SimplifyConvert',
    title: 'Translate Image - Free Online Tool',
    description: 'Convert and edit translate image online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Translate Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Translate Image', description: 'Convert and edit translate image online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/translate-image' },
};

export default function TranslateImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
