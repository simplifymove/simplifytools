import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Swirl Distortion - Free Online Twisting Vortex Tool',
  description: 'Create twisting vortex and swirl distortion effects. Apply dynamic swirling transformations to images.',
  keywords: ['swirl effect', 'distortion', 'vortex', 'twisting', 'swirl distortion', 'online tool'],
  openGraph: {
    title: 'Swirl Distortion - Free Online Twisting Vortex Tool',
    description: 'Create twisting vortex and swirl distortion effects instantly.',
    url: 'https://simplifyconvert.com/all-tools/swirl-distortion',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
