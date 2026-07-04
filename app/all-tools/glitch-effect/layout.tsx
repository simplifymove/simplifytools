import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Glitch Effect - Free Online Digital Glitch Creator',
  description: 'Create digital glitch and corruption effects on images. Transform photos with stunning glitch artifacts and distortions.',
  keywords: ['glitch effect', 'digital glitch', 'corruption effect', 'image distortion', 'photo editor', 'online tool'],
  openGraph: {
    title: 'Glitch Effect - Free Online Digital Glitch Creator',
    description: 'Create digital glitch and corruption effects on your images instantly.',
    url: 'https://simplifyconvert.com/all-tools/glitch-effect',
    type: 'website',
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/glitch-effect' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

