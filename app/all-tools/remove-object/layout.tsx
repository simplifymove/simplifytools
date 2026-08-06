import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Remove Object from Image - Mask & Inpaint Online | SimplifyConvert',
  description: 'Remove unwanted image areas with a painted mask, Telea or Navier-Stokes inpainting, and adjustable inpaint radius controls.',
  keywords: ['remove object from image', 'object remover', 'image inpainting', 'Telea inpainting', 'Navier-Stokes inpainting', 'image editor'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/remove-object',
    siteName: 'SimplifyConvert',
    title: 'Remove Object from Image - Mask & Inpaint Online',
    description: 'Paint a mask over unwanted image areas and process them with adjustable inpainting controls.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Remove Object' }],
  },
  twitter: { card: 'summary_large_image', title: 'Remove Object from Image - Mask & Inpaint Online', description: 'Paint a mask over unwanted image areas and process them with adjustable inpainting controls.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/remove-object' },
};

export default function RemoveObjectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

