import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dream Effect - Free Online Psychedelic Distortion Tool',
  description: 'Create psychedelic dream effects and surreal distortions. Transform images into dreamy, abstract artwork instantly.',
  keywords: ['dream effect', 'psychedelic', 'distortion effect', 'surreal art', 'image effect', 'online tool'],
  openGraph: {
    title: 'Dream Effect - Free Online Psychedelic Distortion Tool',
    description: 'Create psychedelic dream effects and surreal distortions instantly.',
    url: 'https://simplifyconvert.com/all-tools/dream-effect',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/dream-effect' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

