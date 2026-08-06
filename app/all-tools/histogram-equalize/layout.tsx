import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Histogram Equalization - Improve Image Contrast | SimplifyConvert',
  description: 'Apply histogram equalization in your browser to redistribute tonal values and improve contrast in suitable JPG, PNG, or WebP images.',
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
    description: 'Redistribute tonal values with histogram equalization to improve contrast in suitable images.',
    url: 'https://simplifyconvert.com/all-tools/histogram-equalize',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/histogram-equalize' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

