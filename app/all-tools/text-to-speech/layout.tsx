import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Text to Speech Converter with Voice & MP3 Options',
  description: 'Convert text to speech using available multilingual voices, voice presets, speed and pitch settings, playback, and MP3 download.',
  keywords: ['text to speech', 'TTS converter', 'voice generator', 'natural voice', 'multilingual TTS', 'free text to speech online', 'AI voice generator', 'speech synthesis'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/text-to-speech',
    siteName: 'SimplifyConvert',
    title: 'Text to Speech Converter with Voice & MP3 Options',
    description: 'Convert text to speech with multilingual voice choices, adjustable settings, playback, and MP3 download. No signup is required to use the tool.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Text to speech converter with multilingual voice and audio settings',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Text to Speech Converter with Voice & MP3 Options',
    description: 'Convert text to speech with multilingual voice choices, adjustable settings, playback, and MP3 download.',
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

