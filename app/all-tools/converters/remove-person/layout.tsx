import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remove Person - Free AI Object Remover | SimplifyConvert',
  description: 'Remove people from images using advanced AI. Clean backgrounds instantly.',
  keywords: ['remove person', 'remove people', 'object remover', 'free tool'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/converters/remove-person',
    siteName: 'SimplifyConvert',
    title: 'Remove Person - Free AI Object Remover',
    description: 'Remove people from images using advanced AI.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Remove Person' }],
  },
  twitter: { card: 'summary_large_image', title: 'Remove Person - Free AI Object Remover', description: 'Remove people from images using advanced AI.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/converters/remove-person' },
};

export default function RemovePersonLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
