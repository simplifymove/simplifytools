import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cleanup Picture - Denoise, Smooth & Enhance Images | SimplifyConvert',
  description: 'Clean up images with adjustable denoise, smoothing, and contrast enhancement controls, preview the changes, and download the result as PNG.',
  keywords: ['cleanup picture', 'image denoise', 'smooth image', 'image enhancement', 'reduce image noise', 'photo cleanup'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/cleanup-picture',
    siteName: 'SimplifyConvert',
    title: 'Cleanup Picture - Denoise, Smooth & Enhance Images',
    description: 'Apply adjustable denoise, smoothing, and contrast enhancement effects to an image.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Cleanup Picture' }],
  },
  twitter: { card: 'summary_large_image', title: 'Cleanup Picture - Denoise, Smooth & Enhance Images', description: 'Apply adjustable denoise, smoothing, and contrast enhancement effects to an image.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/cleanup-picture' },
};

export default function CleanupPictureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

