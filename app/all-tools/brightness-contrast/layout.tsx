import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brightness & Contrast - Adjust Image Tonal Levels | SimplifyConvert',
  description: 'Adjust image brightness and contrast in your browser, preview the tonal changes, and download the processed image.',
  keywords: [
    'brightness adjuster',
    'contrast enhancer',
    'image brightness',
    'photo adjustment',
    'brightness tool',
    'contrast tool',
    'image enhancement',
    'photo editor',
  ],
  openGraph: {
    title: 'Brightness Contrast Adjuster',
    description: 'Adjust brightness and contrast in images with precision controls',
    url: 'https://simplifyconvert.com/all-tools/brightness-contrast',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/brightness-contrast' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

