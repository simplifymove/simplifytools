import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chromatic Aberration - Free Online RGB Channel Separation Tool',
  description: 'Create chromatic aberration and RGB channel separation effects. Apply professional color-shift distortions to your images.',
  keywords: ['chromatic aberration', 'RGB separation', 'color shift', 'channel effect', 'image effect', 'online tool'],
  openGraph: {
    title: 'Chromatic Aberration - Free Online RGB Channel Separation Tool',
    description: 'Create chromatic aberration and RGB channel separation effects instantly.',
    url: 'https://simplifyconvert.com/all-tools/chromatic-aberration',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
