import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VHS Effect - Retro Glitch Image Effect | SimplifyConvert',
  description: 'Add a retro VHS-style glitch effect to JPG, PNG, or WebP images, adjust the intensity, and download the processed JPEG.',
  keywords: ['vhs effect', 'retro vhs', 'vhs glitch', 'vintage video', 'distortion effect', 'online tool'],
  openGraph: {
    title: 'VHS Effect - Retro Glitch Image Effect',
    description: 'Add a retro VHS-style glitch effect to JPG, PNG, or WebP images, adjust the intensity, and download the processed JPEG.',
    url: 'https://simplifyconvert.com/all-tools/vhs-effect',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/vhs-effect' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

