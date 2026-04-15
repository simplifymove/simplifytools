import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remove Watermark - Free Watermark Remover Tool | SimplifyConvert',
  description: 'Remove watermarks and text from images easily. Clean up your images instantly.',
  keywords: ['remove watermark', 'watermark remover', 'image editor', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/remove-watermark',
    siteName: 'SimplifyConvert',
    title: 'Remove Watermark - Free Watermark Remover Tool',
    description: 'Remove watermarks and text from images easily.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Remove Watermark' }],
  },
  twitter: { card: 'summary_large_image', title: 'Remove Watermark - Free Watermark Remover Tool', description: 'Remove watermarks and text from images easily.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/remove-watermark' },
};

export default function RemoveWatermarkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

