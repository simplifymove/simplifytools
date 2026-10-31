import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Color Balance Tool - Free RGB Adjustment',
  description: 'Adjust red, green, and blue channel balance independently for color correction and creative image adjustments.',
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

