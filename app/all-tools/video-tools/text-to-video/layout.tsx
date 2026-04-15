import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Text to Video - AI Video Generator | tinyTools',
  description: 'Generate stunning AI videos from text prompts. Create cinematic videos, animations, and visual content in minutes. No experience needed.',
  keywords: 'text to video, AI video generator, video creation, AI video maker, generate videos from text',
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/video-tools/text-to-video',
  },
  openGraph: {
    title: 'Text to Video Generator - Create AI Videos from Text',
    description: 'Generate cinematic AI videos from simple text prompts. Fast, easy, and no technical skills required.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-text-to-video.png',
        width: 1200,
        height: 630,
        alt: 'Text to Video Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Text to Video - AI Video Generator',
    description: 'Generate AI videos from text prompts instantly',
  },
};

export default function TextToVideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

