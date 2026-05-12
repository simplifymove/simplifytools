import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brightness Contrast Adjuster - Free Online Tool',
  description: 'Adjust brightness and contrast levels in your images. Perfect for photo enhancement and adjustment with easy-to-use sliders.',
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
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
