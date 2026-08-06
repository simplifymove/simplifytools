import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sunburst Effect - Add Radial Light Rays | SimplifyConvert',
  description: 'Add a radial sunburst-style light-ray effect to an image in your browser and adjust the visual effect before downloading.',
  keywords: ['sunburst', 'light rays', 'radial effect', 'light effect', 'photo effect', 'online tool'],
  openGraph: {
    title: 'Sunburst Effect - Free Online Light Rays Creator',
    description: 'Add a stylized radial sunburst and light-ray effect to an image.',
    url: 'https://simplifyconvert.com/all-tools/sunburst',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/sunburst' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

