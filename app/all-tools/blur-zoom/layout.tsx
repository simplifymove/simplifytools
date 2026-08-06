import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zoom Blur - Create a Radial Blur Effect | SimplifyConvert',
  description: 'Create a radial zoom-blur effect from the image center in your browser, adjust the effect strength, and download the processed result.',
  keywords: ['blur zoom', 'zoom blur', 'motion blur', 'radial blur', 'speed effect', 'online tool'],
  openGraph: {
    title: 'Blur Zoom - Free Online Radial Zoom Blur Tool',
    description: 'Apply a radial zoom-blur effect from the image center.',
    url: 'https://simplifyconvert.com/all-tools/blur-zoom',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/blur-zoom' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

