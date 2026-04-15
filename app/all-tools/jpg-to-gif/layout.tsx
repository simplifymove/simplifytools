import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JPG to GIF - Free Static Image Converter | SimplifyConvert',
  description: 'Convert JPG images to GIF format. Create simple animations from sequences.',
  keywords: ['jpg to gif', 'convert jpg', 'image animator', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/jpg-to-gif',
    siteName: 'SimplifyConvert',
    title: 'JPG to GIF - Free Static Image Converter',
    description: 'Convert JPG images to GIF format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'JPG to GIF' }],
  },
  twitter: { card: 'summary_large_image', title: 'JPG to GIF - Free Static Image Converter', description: 'Convert JPG images to GIF format.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/jpg-to-gif' },
};

export default function JpgToGifLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
