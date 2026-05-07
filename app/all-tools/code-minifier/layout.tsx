import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Code Minifier - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit code minifier online instantly. Free tool without signup required.',
  keywords: ['code minifier', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/code-minifier',
    siteName: 'SimplifyConvert',
    title: 'Code Minifier - Free Online Tool',
    description: 'Convert and edit code minifier online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Code Minifier' }],
  },
  twitter: { card: 'summary_large_image', title: 'Code Minifier', description: 'Convert and edit code minifier online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/code-minifier' },
};

export default function CodeMinifierLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
