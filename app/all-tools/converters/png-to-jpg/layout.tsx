import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PNG to JPG - Free Image Format Converter | SimplifyConvert',
  description: 'Convert PNG images to JPG format. Reduce file size and improve compatibility.',
  keywords: ['png to jpg', 'convert png', 'image converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/png-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'PNG to JPG - Free Image Format Converter',
    description: 'Convert PNG images to JPG format.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'PNG to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'PNG to JPG - Free Image Format Converter', description: 'Convert PNG images to JPG format.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/png-to-jpg' },
};

export default function PngToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
