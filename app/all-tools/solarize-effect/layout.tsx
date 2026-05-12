import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solarize Effect - Free Online Photo Editor',
  description: 'Create photographic solarization effects with free online tool. Transform images with inverted tone curves and artistic effects.',
  keywords: [
    'solarize effect',
    'solarization',
    'photographic effect',
    'photo art',
    'tone inversion',
    'artistic filter',
    'image effect',
    'photo manipulation',
  ],
  openGraph: {
    title: 'Solarize Effect',
    description: 'Create stunning photographic solarization effects instantly',
    url: 'https://simplifyconvert.com/all-tools/solarize-effect',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
