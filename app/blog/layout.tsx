import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - SimplifyConvert | Free Online Tools Guides & Tutorials',
  description: 'Learn how to use free online tools effectively. Discover helpful guides, tips, and tutorials on image conversion, PDF editing, video processing, and data transformation.',
  keywords: [
    'image conversion guide',
    'PDF tools tutorial',
    'video editing tips',
    'data conversion guide',
    'online tools tips',
    'file conversion tutorial',
    'image optimization',
    'video compression',
    'PDF extraction',
  ],
  authors: [{ name: 'SimplifyConvert Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/blog',
    siteName: 'SimplifyConvert',
    title: 'Blog - SimplifyConvert | Free Online Tools Guides',
    description: 'Learn how to use our free online tools effectively with comprehensive guides and tutorials.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SimplifyConvert Blog - Learn Tips & Tutorials',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - SimplifyConvert',
    description: 'Free online tools tips and tutorials',
    images: ['https://simplifyconvert.com/og-image.jpg'],
    creator: '@simplifyconvert',
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/blog',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
