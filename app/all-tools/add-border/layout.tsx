import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Border to Image - Create Custom Image Borders | SimplifyConvert',
  description: 'Add an adjustable border around an image, choose the border appearance, preview the result, and download the processed image.',
  keywords: ['add border', 'image border', 'frame image', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/add-border',
    siteName: 'SimplifyConvert',
    title: 'Add Border - Free Image Border Editor',
    description: 'Add custom borders to your images.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Add Border' }],
  },
  twitter: { card: 'summary_large_image', title: 'Add Border - Free Image Border Editor', description: 'Add custom borders to your images.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/add-border' },
};

export default function AddBorderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

