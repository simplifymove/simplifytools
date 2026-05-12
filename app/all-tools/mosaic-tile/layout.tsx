import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mosaic Tile - Free Online Mosaic Pattern Creator',
  description: 'Create mosaic and tile pattern effects. Generate beautiful mosaic artwork from photos.',
  keywords: ['mosaic', 'tile effect', 'mosaic pattern', 'tiled', 'art effect', 'online tool'],
  openGraph: {
    title: 'Mosaic Tile - Free Online Mosaic Pattern Creator',
    description: 'Create mosaic and tile pattern effects instantly.',
    url: 'https://simplifyconvert.com/all-tools/mosaic-tile',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
