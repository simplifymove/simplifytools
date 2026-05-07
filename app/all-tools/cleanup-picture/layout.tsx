import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cleanup Picture - Free Image Cleanup Tool | SimplifyConvert',
  description: 'Remove unwanted objects and blemishes from images. Clean up photos instantly.',
  keywords: ['cleanup picture', 'remove objects', 'image editor', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/cleanup-picture',
    siteName: 'SimplifyConvert',
    title: 'Cleanup Picture - Free Image Cleanup Tool',
    description: 'Remove unwanted objects and blemishes from images.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Cleanup Picture' }],
  },
  twitter: { card: 'summary_large_image', title: 'Cleanup Picture - Free Image Cleanup Tool', description: 'Remove unwanted objects and blemishes from images.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/cleanup-picture' },
};

export default function CleanupPictureLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

