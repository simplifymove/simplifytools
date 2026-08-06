import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kaleidoscope Effect - Symmetrical Image Patterns | SimplifyConvert',
  description: 'Transform JPG, PNG, or WebP images into kaleidoscope-style patterns by adjusting the number of segments and downloading a JPEG.',
  keywords: ['kaleidoscope', 'symmetrical patterns', 'pattern effect', 'art effect', 'image effect', 'online tool'],
  openGraph: {
    title: 'Kaleidoscope Effect - Symmetrical Image Patterns',
    description: 'Transform JPG, PNG, or WebP images into kaleidoscope-style patterns by adjusting the number of segments and downloading a JPEG.',
    url: 'https://simplifyconvert.com/all-tools/kaleidoscope',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/kaleidoscope' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

