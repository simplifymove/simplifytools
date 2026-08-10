import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Neon Glow Effect - Free Online Neon Lighting Tool',
  description: 'Apply neon-style lighting, glow, and color effects to photos online.',
  keywords: ['neon effect', 'glow effect', 'neon light', 'image effect', 'photo editor', 'online tool'],
  openGraph: {
    title: 'Neon Glow Effect - Free Online Neon Lighting Tool',
    description: 'Apply neon-style lighting and glow effects to photos online.',
    url: 'https://simplifyconvert.com/all-tools/neon-glow',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/neon-glow' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
