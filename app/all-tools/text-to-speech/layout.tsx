import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Text to Speech Converter with AI Voices',
  description: 'Convert text to speech instantly with 20+ neural voices, emotion control, and multilingual support. Free, no signup required.',
  keywords: ['text to speech', 'TTS converter', 'voice generator', 'natural voice', 'multilingual TTS', 'free text to speech online', 'AI voice generator', 'speech synthesis'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/text-to-speech',
    siteName: 'SimplifyConvert',
    title: 'Free Text to Speech Converter with AI Voices',
    description: 'Convert text to speech with natural neural voices in 20+ languages, emotion control, and instant download. No signup needed.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Free text to speech converter with natural neural voices and emotion control',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Text to Speech Converter with AI Voices',
    description: 'Convert text to speech instantly with neural voices, emotion control, and 20+ languages.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/text-to-speech',
  },
};

export default function TextToSpeechLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

