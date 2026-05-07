import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Images - Free Image Composition Tool | SimplifyConvert',
  description: 'Add and overlay multiple images together. Create composite images effortlessly.',
  keywords: ['add images', 'overlay images', 'compose images', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/add-images',
    siteName: 'SimplifyConvert',
    title: 'Add Images - Free Image Composition Tool',
    description: 'Add and overlay multiple images together.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Add Images' }],
  },
  twitter: { card: 'summary_large_image', title: 'Add Images - Free Image Composition Tool', description: 'Add and overlay multiple images together.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/add-images' },
};

export default function AddImagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

