import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Colorize Photo - Free Online Photo Colorization Tool | Convert B&W to Color',
  description: 'Apply sepia, warm, cool, or custom color tones to supported images with browser-based processing.',
  keywords: [
    'colorize photo',
    'colorize image',
    'restore photo',
    'black and white to color',
    'photo colorization',
    'vintage photo restoration',
    'sepia effect',
    'add color to bw photo',
    'free photo editor',
    'online colorizer',
    'restore old photos',
    'photo enhancement'
  ],
  authors: [{ name: 'SimplifyConvert' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/colorize-photo',
    siteName: 'SimplifyConvert',
    title: 'Colorize Photo - Free Online Photo Colorization Tool',
    description: 'Add colors to black and white photos. Restore vintage photographs with multiple tone options.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'Colorize Photo Tool' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Colorize Photo - Free Online Photo Colorization Tool',
    description: 'Apply selectable color tones to black-and-white or other supported images in your browser.',
    images: ['https://simplifyconvert.com/og-image.jpg']
  },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/colorize-photo' },
  robots: 'index, follow',
  applicationName: 'SimplifyConvert',
}

export default function ColorizePhotoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

