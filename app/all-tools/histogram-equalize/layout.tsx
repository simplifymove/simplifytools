import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Histogram Equalization - Auto Contrast Enhancer',
  description: 'Automatically enhance image contrast using histogram equalization. Improve visibility and detail in dark or overexposed photos.',
  keywords: [
    'histogram equalization',
    'contrast enhancement',
    'auto contrast',
    'image enhancement',
    'brightness correction',
    'tone mapping',
    'visibility improvement',
    'photo enhancement',
  ],
  openGraph: {
    title: 'Histogram Equalize',
    description: 'Auto-enhance contrast with advanced histogram equalization',
    url: 'https://simplifyconvert.com/all-tools/histogram-equalize',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
