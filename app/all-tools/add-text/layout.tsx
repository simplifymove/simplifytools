import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Text to Image - Free Text Overlay Tool | SimplifyConvert',
  description: 'Add custom text to your images with various fonts, sizes, colors, and positions. Perfect for creating captions, watermarks, and more.',
  keywords: ['add text', 'text overlay', 'image text', 'watermark', 'caption', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/add-text',
    siteName: 'SimplifyConvert',
    title: 'Add Text to Image - Free Text Overlay Tool',
    description: 'Add custom text to your images with various fonts, sizes, colors, and positions.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Add Text to Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Add Text to Image - Free Text Overlay Tool', description: 'Add custom text to your images with various fonts, sizes, colors, and positions.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/add-text' },
};

export default function AddTextLayout({ children }: { children: React.ReactNode }) {
  return children;
}
