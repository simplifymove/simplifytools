import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Text to Image - Custom Text Overlay Tool | SimplifyConvert',
  description: 'Add text to an image in your browser, customize font, size, color, opacity, position, alignment, and shadow, then download the result as PNG.',
  keywords: ['add text to image', 'text overlay', 'image text', 'add caption to image', 'text on photo', 'image text editor'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/add-text',
    siteName: 'SimplifyConvert',
    title: 'Add Text to Image - Custom Text Overlay Tool',
    description: 'Add customizable text overlays to images and download the finished result as PNG.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Add Text to Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Add Text to Image - Custom Text Overlay Tool', description: 'Add customizable text overlays to images and download the finished result as PNG.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/add-text' },
};

export default function AddTextLayout({ children }: { children: React.ReactNode }) {
  return children;
}
