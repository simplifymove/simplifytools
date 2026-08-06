import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solarize Effect - Create Solarized Image Effects | SimplifyConvert',
  description: 'Apply a solarization-style tonal effect to JPG, PNG, or WebP images, adjust its intensity, and download the processed JPEG.',
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
    title: 'Solarize Effect - Create Solarized Image Effects',
    description: 'Apply a solarization-style tonal effect to JPG, PNG, or WebP images, adjust its intensity, and download the processed JPEG.',
    url: 'https://simplifyconvert.com/all-tools/solarize-effect',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/solarize-effect' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

