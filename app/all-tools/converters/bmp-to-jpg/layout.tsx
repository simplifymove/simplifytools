import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BMP to JPG - Free Image Format Converter | SimplifyConvert',
  description: 'Convert BMP images to JPG format. Reduce file size and improve compatibility.',
  keywords: ['bmp to jpg', 'convert bmp', 'image converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/bmp-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'BMP to JPG - Free Image Format Converter',
    description: 'Convert BMP images to JPG format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'BMP to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'BMP to JPG - Free Image Format Converter', description: 'Convert BMP images to JPG format.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/bmp-to-jpg' },
};

export default function BmpToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
