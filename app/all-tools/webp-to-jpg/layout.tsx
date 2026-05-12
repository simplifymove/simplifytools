import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebP to JPG Converter - Free Format Conversion | SimplifyConvert',
  description: 'Convert WebP images to JPG format instantly. Maintain quality, ensure compatibility. Perfect for web and sharing. No signup needed.',
  keywords: ['WebP to JPG', 'convert WebP to JPG', 'WebP converter', 'free image converter', 'online converter', 'format conversion', 'image compatibility'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/webp-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'WebP to JPG - Free Online Tool',
    description: 'Convert and edit webp to jpg online instantly. Free tool without signup required.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'WebP to JPG' }],
  },
  twitter: { card: 'summary_large_image', title: 'WebP to JPG', description: 'Convert and edit webp to jpg online instantly. Free tool without signup required.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/webp-to-jpg' },
};

export default function WebpToJpgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
