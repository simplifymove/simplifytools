import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tilt-Shift Effect - Create Selective Image Blur | SimplifyConvert',
  description: 'Apply a tilt-shift-style selective blur effect in your browser to emphasize a focused region and soften surrounding areas.',
  keywords: ['tilt shift', 'selective focus', 'miniature effect', 'depth blur', 'photo effect', 'online tool'],
  openGraph: {
    title: 'Tilt Shift Effect - Free Online Miniature Focus Tool',
    description: 'Create beautiful tilt-shift effects with selective focus on your images.',
    url: 'https://simplifyconvert.com/all-tools/tilt-shift',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/tilt-shift' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

