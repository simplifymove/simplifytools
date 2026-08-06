import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Splitter - Split Images into Grid Tiles | SimplifyConvert',
  description: 'Split an image into 1-6 rows and columns in your browser, preview the grid, and download individual segments as PNG files.',
  keywords: ['image splitter', 'split image into grid', 'image grid splitter', 'divide image', 'image tiles', 'split image online'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/image-splitter',
    siteName: 'SimplifyConvert',
    title: 'Image Splitter - Split Images into Grid Tiles',
    description: 'Split an image into rows and columns and download individual PNG tiles.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Image Splitter' }],
  },
  twitter: { card: 'summary_large_image', title: 'Image Splitter - Split Images into Grid Tiles', description: 'Split an image into rows and columns and download individual PNG tiles.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/image-splitter' },
};

export default function ImageSplitterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

