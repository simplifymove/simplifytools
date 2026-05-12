import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edge Detection Tool - Free Online Image Processor',
  description: 'Detect and highlight edges in images with advanced edge detection algorithms. Find boundaries and contours automatically.',
  keywords: [
    'edge detection',
    'edge finding',
    'image edges',
    'boundary detection',
    'contour detection',
    'image processing',
    'edge filter',
    'computer vision',
  ],
  openGraph: {
    title: 'Edge Detection Tool',
    description: 'Detect and highlight edges in images instantly',
    url: 'https://simplifyconvert.com/all-tools/edge-detect',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
