import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thermal Vision - Free Online Thermal/Infrared Filter',
  description: 'Convert images to thermal and infrared color mapping. Create thermal vision effects instantly.',
  keywords: ['thermal vision', 'infrared', 'thermal imaging', 'heat map', 'thermal effect', 'online tool'],
  openGraph: {
    title: 'Thermal Vision - Free Online Thermal/Infrared Filter',
    description: 'Convert images to thermal and infrared color mapping instantly.',
    url: 'https://simplifyconvert.com/all-tools/thermal-vision',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
