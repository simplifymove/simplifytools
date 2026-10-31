import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Motion Blur - Create a Directional Blur Effect | SimplifyConvert',
  description: 'Apply a directional motion-blur effect to JPG, PNG, or WebP images in your browser and adjust the effect before downloading.',
  keywords: ['motion blur', 'blur effect', 'dynamic blur', 'image effect', 'photo editor', 'online tool'],
  openGraph: {
    title: 'Motion Blur - Free Online Motion Effect Tool',
    description: 'Apply dynamic motion blur effects to your images with directional control.',
    url: 'https://simplifyconvert.com/all-tools/motion-blur',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/motion-blur' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

