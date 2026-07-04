import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lens Flare - Free Online Lens Flare Effect Tool',
  description: 'Add optical lens flare effects to your photos. Create stunning lens flare artifacts with customizable positioning.',
  keywords: ['lens flare', 'optical effect', 'light effect', 'photo effect', 'image editor', 'online tool'],
  openGraph: {
    title: 'Lens Flare - Free Online Lens Flare Effect Tool',
    description: 'Add optical lens flare effects to your photos with custom positioning.',
    url: 'https://simplifyconvert.com/all-tools/lens-flare',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/lens-flare' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

