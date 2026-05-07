import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BMP to PNG - Free Online Tool | SimplifyConvert',
  description: 'Convert and edit bmp to png online instantly. Free tool without signup required.',
  keywords: ['bmp to png', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/bmp-to-png',
    siteName: 'SimplifyConvert',
    title: 'BMP to PNG - Free Online Tool',
    description: 'Convert and edit bmp to png online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'BMP to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'BMP to PNG', description: 'Convert and edit bmp to png online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/bmp-to-png' },
};

export default function BmpToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
