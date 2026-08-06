import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BMP to PNG Converter - Lossless PNG Output | SimplifyConvert',
  description: 'Convert BMP images to PNG format using server-side conversion and lossless PNG encoding.',
  keywords: ['bmp to png', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/bmp-to-png',
    siteName: 'SimplifyConvert',
    title: 'BMP to PNG Converter - Lossless PNG Output',
    description: 'Convert BMP images to PNG format using server-side conversion and lossless PNG encoding.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'BMP to PNG' }],
  },
  twitter: { card: 'summary_large_image', title: 'BMP to PNG', description: 'Convert BMP images to PNG format using server-side conversion and lossless PNG encoding.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/bmp-to-png' },
};

export default function BmpToPngLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
