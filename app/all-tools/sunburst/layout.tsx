import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sunburst Effect - Free Online Light Rays Creator',
  description: 'Add radial sunburst and light ray effects to photos. Create stunning sunburst lighting instantly.',
  keywords: ['sunburst', 'light rays', 'radial effect', 'light effect', 'photo effect', 'online tool'],
  openGraph: {
    title: 'Sunburst Effect - Free Online Light Rays Creator',
    description: 'Add radial sunburst and light ray effects to your photos instantly.',
    url: 'https://simplifyconvert.com/all-tools/sunburst',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
