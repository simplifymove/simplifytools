import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Compressor - Reduce File Size & Optimize | SimplifyConvert',
  description: 'Compress JPG, PNG, WebP images instantly. Maintain quality while reducing file size by up to 80%. Free online tool.',
  keywords: ['compress image', 'image compressor', 'image optimization', 'reduce file size', 'optimize image', 'free tool', 'online compressor'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/compress-image',
    siteName: 'SimplifyConvert',
    title: 'Image Compressor - Reduce File Size & Optimize',
    description: 'Compress JPG, PNG, WebP images instantly while maintaining quality. Reduce file size up to 80%.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Image Compressor Tool' }],
  },
  twitter: { card: 'summary_large_image', title: 'Image Compressor - Optimize & Compress Images', description: 'Reduce image file size by up to 80% while keeping quality. Free online image compressor.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/compress-image' },
};

export default function CompressImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

