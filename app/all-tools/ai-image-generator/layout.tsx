import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Image Generator - Free AI Text to Image Tool | SimplifyConvert',
  description: 'Generate stunning images from text descriptions using advanced AI technology. Create artwork, illustrations, and designs instantly.',
  keywords: ['AI image generator', 'text to image', 'AI art', 'image generator', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/ai-image-generator',
    siteName: 'SimplifyConvert',
    title: 'AI Image Generator - Free AI Text to Image Tool',
    description: 'Generate stunning images from text descriptions using advanced AI technology.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Image Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Image Generator - Free AI Text to Image Tool',
    description: 'Generate stunning images from text descriptions using advanced AI technology.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/ai-image-generator',
  },
};

export default function AiImageGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
