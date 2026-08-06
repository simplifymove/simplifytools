import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Film Noir Effect - High-Contrast Monochrome Image | SimplifyConvert',
  description: 'Apply a film-noir-style monochrome and contrast effect to JPG, PNG, or WebP images directly in your browser.',
  keywords: ['film noir', 'black and white', 'high contrast', 'dramatic', 'photo effect', 'online tool'],
  openGraph: {
    title: 'Film Noir - Free Online High Contrast Black & White Tool',
    description: 'Convert photos to classic film noir style with dramatic high contrast.',
    url: 'https://simplifyconvert.com/all-tools/film-noir',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/film-noir' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

