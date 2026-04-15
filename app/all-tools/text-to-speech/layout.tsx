import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Text to Speech - Free Text to Speech Converter | SimplifyConvert',
  description: 'Convert text to natural-sounding speech. Create audio from written content instantly.',
  keywords: ['text to speech', 'TTS', 'voice generator', 'audio converter', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/text-to-speech',
    siteName: 'SimplifyConvert',
    title: 'Text to Speech - Free Text to Speech Converter',
    description: 'Convert text to natural-sounding speech.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Text to Speech' }],
  },
  twitter: { card: 'summary_large_image', title: 'Text to Speech - Free Text to Speech Converter', description: 'Convert text to natural-sounding speech.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/text-to-speech' },
};

export default function TextToSpeechLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

