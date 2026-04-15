import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remove Object - Free Object Remover Tool | SimplifyConvert',
  description: 'Remove unwanted objects from images instantly. Clean up your photos with AI technology.',
  keywords: ['remove object', 'object remover', 'image editor', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/remove-object',
    siteName: 'SimplifyConvert',
    title: 'Remove Object - Free Object Remover Tool',
    description: 'Remove unwanted objects from images instantly.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Remove Object' }],
  },
  twitter: { card: 'summary_large_image', title: 'Remove Object - Free Object Remover Tool', description: 'Remove unwanted objects from images instantly.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/remove-object' },
};

export default function RemoveObjectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

