import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'White Balance Tool - Free Color Temperature Adjuster',
  description: 'Adjust white balance and color temperature. Fix color casts and correct warm or cool lighting in photos.',
  keywords: [
    'white balance',
    'color temperature',
    'color cast',
    'white balance correction',
    'photo color',
    'temperature adjustment',
    'auto white balance',
    'photo editing',
  ],
  openGraph: {
    title: 'White Balance Tool',
    description: 'Adjust white balance and color temperature in images',
    url: 'https://simplifyconvert.com/all-tools/white-balance',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/white-balance' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

