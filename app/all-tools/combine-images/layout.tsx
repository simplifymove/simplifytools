import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Combine Images - Free Image Merger & Collage Maker | SimplifyConvert',
  description: 'Combine multiple images into one. Create collages and image compositions easily.',
  keywords: ['combine images', 'merge images', 'image collage', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/combine-images',
    siteName: 'SimplifyConvert',
    title: 'Combine Images - Free Image Merger & Collage Maker',
    description: 'Combine multiple images into one.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Combine Images' }],
  },
  twitter: { card: 'summary_large_image', title: 'Combine Images - Free Image Merger & Collage Maker', description: 'Combine multiple images into one.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/combine-images' },
};

export default function CombineImagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

