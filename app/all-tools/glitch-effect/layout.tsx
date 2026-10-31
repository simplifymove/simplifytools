import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Glitch Effect - Digital Image Distortion Tool | SimplifyConvert',
  description: 'Apply randomized digital glitch distortions to JPG, PNG, or WebP images, adjust intensity, and download the processed JPEG.',
  keywords: ['glitch effect', 'digital glitch', 'corruption effect', 'image distortion', 'photo editor', 'online tool'],
  openGraph: {
    title: 'Glitch Effect - Digital Image Distortion Tool',
    description: 'Apply randomized digital glitch distortions to JPG, PNG, or WebP images, adjust intensity, and download the processed JPEG.',
    url: 'https://simplifyconvert.com/all-tools/glitch-effect',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/glitch-effect' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

