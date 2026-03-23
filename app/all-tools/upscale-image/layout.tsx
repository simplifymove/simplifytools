import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upscale Image - Free Image Upscaler Tool | SimplifyConvert',
  description: 'Enhance and enlarge images without quality loss. Increase image resolution using AI technology.',
  keywords: ['upscale image', 'image upscaler', 'image enlarger', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/upscale-image',
    siteName: 'SimplifyConvert',
    title: 'Upscale Image - Free Image Upscaler Tool',
    description: 'Enhance and enlarge images without quality loss.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Upscale Image' }],
  },
  twitter: { card: 'summary_large_image', title: 'Upscale Image - Free Image Upscaler Tool', description: 'Enhance and enlarge images without quality loss.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/upscale-image' },
};

export default function UpscaleImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
