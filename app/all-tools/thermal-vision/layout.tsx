import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thermal Vision Effect - Heat Map Image Effect | SimplifyConvert',
  description: 'Apply a thermal-style color effect to JPG, PNG, or WebP images in your browser and download the processed result as a JPEG.',
  keywords: ['thermal vision', 'infrared', 'thermal imaging', 'heat map', 'thermal effect', 'online tool'],
  openGraph: {
    title: 'Thermal Vision Effect - Heat Map Image Effect',
    description: 'Apply a thermal-style color effect to JPG, PNG, or WebP images in your browser and download the processed result as a JPEG.',
    url: 'https://simplifyconvert.com/all-tools/thermal-vision',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/thermal-vision' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

