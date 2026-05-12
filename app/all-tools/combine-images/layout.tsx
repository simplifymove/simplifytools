import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Combine Images - Free Online Image Merger & Collage Maker Tool',
  description: 'Combine multiple images into one with flexible layout options. Create stunning image collages, merge photos, and compose image layouts. Free online tool with no sign-up required.',
  keywords: [
    'combine images',
    'merge images',
    'image collage maker',
    'photo merger',
    'image composition',
    'free image tool',
    'online image combiner',
    'collage creator',
    'horizontal merge',
    'vertical merge',
    'grid layout',
    'image editor'
  ],
  authors: [{ name: 'SimplifyConvert' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/combine-images',
    siteName: 'SimplifyConvert',
    title: 'Combine Images - Free Online Image Merger & Collage Maker',
    description: 'Combine multiple images into one with flexible layout options. Create stunning collages and image compositions easily.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Combine Images Tool' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Combine Images - Free Online Image Merger & Collage Maker',
    description: 'Merge multiple images into one. Create collages and compositions with flexible layouts.',
    images: ['https://simplifyconvert.com/og-image.jpg']
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/combine-images' },
  robots: 'index, follow',
  applicationName: 'SimplifyConvert',
};

export default function CombineImagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

