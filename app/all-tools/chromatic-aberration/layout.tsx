import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chromatic Aberration - RGB Channel Shift Effect | SimplifyConvert',
  description: 'Create an RGB channel-shift effect on JPG, PNG, or WebP images, control the pixel offset, and download the result as JPEG.',
  keywords: ['chromatic aberration', 'RGB separation', 'color shift', 'channel effect', 'image effect', 'online tool'],
  openGraph: {
    title: 'Chromatic Aberration - RGB Channel Shift Effect',
    description: 'Create an RGB channel-shift effect on JPG, PNG, or WebP images, control the pixel offset, and download the result as JPEG.',
    url: 'https://simplifyconvert.com/all-tools/chromatic-aberration',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/chromatic-aberration' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

