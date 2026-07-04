import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VHS Effect - Free Online Retro VHS Glitch Tool',
  description: 'Create retro VHS glitch and distortion effects. Transform photos into vintage video aesthetic.',
  keywords: ['vhs effect', 'retro vhs', 'vhs glitch', 'vintage video', 'distortion effect', 'online tool'],
  openGraph: {
    title: 'VHS Effect - Free Online Retro VHS Glitch Tool',
    description: 'Create retro VHS glitch and distortion effects instantly.',
    url: 'https://simplifyconvert.com/all-tools/vhs-effect',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/vhs-effect' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

