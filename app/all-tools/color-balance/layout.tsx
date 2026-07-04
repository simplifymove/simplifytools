import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Color Balance Tool - Free RGB Adjustment',
  description: 'Adjust RGB color balance independently. Perfect for color correction and white balance adjustments in photos.',
  keywords: [
    'color balance',
    'RGB adjustment',
    'white balance',
    'color correction',
    'photo color',
    'color grading',
    'image color',
    'photo editing',
  ],
  openGraph: {
    title: 'Color Balance Tool',
    description: 'Adjust RGB colors and white balance in images',
    url: 'https://simplifyconvert.com/all-tools/color-balance',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/color-balance' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

