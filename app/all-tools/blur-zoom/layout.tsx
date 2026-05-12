import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blur Zoom - Free Online Radial Zoom Blur Tool',
  description: 'Apply radial zoom blur effects from center. Create dynamic motion blur and zoom effects instantly.',
  keywords: ['blur zoom', 'zoom blur', 'motion blur', 'radial blur', 'speed effect', 'online tool'],
  openGraph: {
    title: 'Blur Zoom - Free Online Radial Zoom Blur Tool',
    description: 'Apply radial zoom blur effects from center instantly.',
    url: 'https://simplifyconvert.com/all-tools/blur-zoom',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
