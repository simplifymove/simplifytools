import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kaleidoscope Effect - Free Online Symmetrical Pattern Creator',
  description: 'Generate beautiful kaleidoscope and symmetrical pattern effects. Create stunning symmetrical artwork from your photos.',
  keywords: ['kaleidoscope', 'symmetrical patterns', 'pattern effect', 'art effect', 'image effect', 'online tool'],
  openGraph: {
    title: 'Kaleidoscope Effect - Free Online Symmetrical Pattern Creator',
    description: 'Generate beautiful kaleidoscope and symmetrical patterns instantly.',
    url: 'https://simplifyconvert.com/all-tools/kaleidoscope',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/kaleidoscope' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

