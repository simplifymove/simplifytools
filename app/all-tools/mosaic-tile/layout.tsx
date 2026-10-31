import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mosaic Tile Effect - Create Mosaic Images | SimplifyConvert',
  description: 'Turn JPG, PNG, or WebP images into mosaic-style artwork by choosing a tile size and downloading the processed result as JPEG.',
  keywords: ['mosaic', 'tile effect', 'mosaic pattern', 'tiled', 'art effect', 'online tool'],
  openGraph: {
    title: 'Mosaic Tile Effect - Create Mosaic Images',
    description: 'Turn JPG, PNG, or WebP images into mosaic-style artwork by choosing a tile size and downloading the processed result as JPEG.',
    url: 'https://simplifyconvert.com/all-tools/mosaic-tile',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/mosaic-tile' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

