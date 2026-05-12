import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tilt Shift Effect - Free Online Miniature Focus Tool',
  description: 'Create tilt-shift effect with selective focus. Transform photos into miniature-like images with depth-of-field blur.',
  keywords: ['tilt shift', 'selective focus', 'miniature effect', 'depth blur', 'photo effect', 'online tool'],
  openGraph: {
    title: 'Tilt Shift Effect - Free Online Miniature Focus Tool',
    description: 'Create beautiful tilt-shift effects with selective focus on your images.',
    url: 'https://simplifyconvert.com/all-tools/tilt-shift',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
