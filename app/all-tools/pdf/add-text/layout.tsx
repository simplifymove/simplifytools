import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Text to PDF - Free Online PDF Editor | SimplifyConvert',
  description:
    'Add custom text to your PDF files online. Click to place, drag to adjust position, customize fonts and colors, then export your edited PDF.',
  keywords: ['add text to PDF', 'PDF editor', 'text overlay', 'free PDF tool', 'online PDF editor'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/pdf/add-text',
    siteName: 'SimplifyConvert',
    title: 'Add Text to PDF - Free Online PDF Editor',
    description:
      'Add custom text to your PDF files online. Click to place, drag to adjust, customize fonts and colors.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Add Text to PDF',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Add Text to PDF - Free Online PDF Editor',
    description:
      'Add custom text to your PDF files online. Click to place, drag to adjust, customize fonts and colors.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/pdf/add-text',
  },
};

export default function AddTextLayout({ children }: { children: React.ReactNode }) {
  return children;
}

