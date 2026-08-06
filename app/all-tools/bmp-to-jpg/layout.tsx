import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BMP to JPG Converter - Convert BMP to JPEG | SimplifyConvert',
  description: 'Convert BMP images to JPG format with server-side image conversion and JPEG output.',
  keywords: ['bmp to jpg', 'bmp to jpeg', 'convert bmp', 'image converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/bmp-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'BMP to JPG - Free Image Converter',
    description: 'Convert BMP images to JPG format instantly.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'BMP to JPG Converter' }],
  },
  twitter: { card: 'summary_large_image', title: 'BMP to JPG Converter', description: 'Convert BMP to JPG instantly.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/bmp-to-jpg' },
};

export default function BmpToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
