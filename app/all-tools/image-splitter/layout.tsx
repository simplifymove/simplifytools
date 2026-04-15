import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Splitter - Free Image Division Tool | SimplifyConvert',
  description: 'Split images into grid sections. Divide photos into equal parts for tiles and grids.',
  keywords: ['image splitter', 'split image', 'divide image', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/image-splitter',
    siteName: 'SimplifyConvert',
    title: 'Image Splitter - Free Image Division Tool',
    description: 'Split images into grid sections.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Image Splitter' }],
  },
  twitter: { card: 'summary_large_image', title: 'Image Splitter - Free Image Division Tool', description: 'Split images into grid sections.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/image-splitter' },
};

export default function ImageSplitterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
