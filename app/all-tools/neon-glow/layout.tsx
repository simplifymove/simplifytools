import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Neon Glow Effect - Free Online Neon Lighting Tool',
  description: 'Create vibrant neon lighting effects on your photos. Transform images with glowing neon colors and effects instantly.',
  keywords: ['neon effect', 'glow effect', 'neon light', 'image effect', 'photo editor', 'online tool'],
  openGraph: {
    title: 'Neon Glow Effect - Free Online Neon Lighting Tool',
    description: 'Create vibrant neon lighting effects on your photos instantly.',
    url: 'https://simplifyconvert.com/all-tools/neon-glow',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
