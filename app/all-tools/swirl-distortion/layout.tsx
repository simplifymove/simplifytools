import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Swirl Distortion - Create Image Vortex Effects | SimplifyConvert',
  description: 'Create a swirl or vortex distortion on JPG, PNG, or WebP images by controlling the angle and radius, then download a JPEG.',
  keywords: ['swirl effect', 'distortion', 'vortex', 'twisting', 'swirl distortion', 'online tool'],
  openGraph: {
    title: 'Swirl Distortion - Create Image Vortex Effects',
    description: 'Create a swirl or vortex distortion on JPG, PNG, or WebP images by controlling the angle and radius, then download a JPEG.',
    url: 'https://simplifyconvert.com/all-tools/swirl-distortion',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/swirl-distortion' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

