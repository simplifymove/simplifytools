import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edge Detection - Highlight Image Boundaries | SimplifyConvert',
  description: 'Highlight visible image edges with browser-based pixel processing and download the resulting edge-detection image.',
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
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/edge-detect' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

