import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Border - Free Image Border Editor | SimplifyConvert',
  description: 'Add custom borders to your images. Create frames and edges with various styles.',
  keywords: ['add border', 'image border', 'frame image', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/add-border',
    siteName: 'SimplifyConvert',
    title: 'Add Border - Free Image Border Editor',
    description: 'Add custom borders to your images.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Add Border' }],
  },
  twitter: { card: 'summary_large_image', title: 'Add Border - Free Image Border Editor', description: 'Add custom borders to your images.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/add-border' },
};

export default function AddBorderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
