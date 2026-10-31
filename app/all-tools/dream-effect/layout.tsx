import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dream Effect - Psychedelic Image Distortion | SimplifyConvert',
  description: 'Create a psychedelic dream-style distortion from JPG, PNG, or WebP images, adjust the intensity, and download the result as JPEG.',
  keywords: ['dream effect', 'psychedelic', 'distortion effect', 'surreal art', 'image effect', 'online tool'],
  openGraph: {
    title: 'Dream Effect - Psychedelic Image Distortion',
    description: 'Create a psychedelic dream-style distortion from JPG, PNG, or WebP images, adjust the intensity, and download the result as JPEG.',
    url: 'https://simplifyconvert.com/all-tools/dream-effect',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/dream-effect' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

