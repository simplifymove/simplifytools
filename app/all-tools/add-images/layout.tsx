import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Images - Combine Multiple Images on a Canvas | SimplifyConvert',
  description: 'Combine up to 10 images on a customizable canvas, adjust placement and background color, and generate the finished composition as PNG.',
  keywords: ['add images', 'combine images', 'image composition', 'image collage', 'multiple images', 'merge images'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/add-images',
    siteName: 'SimplifyConvert',
    title: 'Add Images - Combine Multiple Images on a Canvas',
    description: 'Arrange up to 10 images on a customizable canvas and export the composition as PNG.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Add Images' }],
  },
  twitter: { card: 'summary_large_image', title: 'Add Images - Combine Multiple Images on a Canvas', description: 'Arrange up to 10 images on a customizable canvas and export the composition as PNG.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/add-images' },
};

export default function AddImagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

