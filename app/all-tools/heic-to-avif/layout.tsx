import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HEIC to AVIF - Free Image Converter | SimplifyConvert',
  description: 'Convert HEIC images to modern AVIF format. Reduce file size while maintaining excellent quality. Fast, free online conversion.',
  keywords: ['HEIC to AVIF', 'image converter', 'HEIC converter', 'AVIF converter', 'free converter'],
  openGraph: {
    title: 'HEIC to AVIF Converter - SimplifyConvert',
    description: 'Convert HEIC images to AVIF format online. Reduce file size while maintaining quality.',
    type: 'website',
    url: 'https://simplifyconvert.com/all-tools/heic-to-avif',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HEIC to AVIF Converter',
      },
    ],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/heic-to-avif',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
