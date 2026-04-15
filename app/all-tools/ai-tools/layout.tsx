import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Writing Tools - Blog Generator, Paragraph Writer, Email Composer | SimplifyConvert',
  description: 'Free AI writing tools online. Generate blog posts, write paragraphs, compose emails, and create content instantly. No signup required.',
  keywords: ['AI writer', 'blog generator', 'content writer', 'email writer', 'paragraph writer', 'AI tools'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/ai-tools',
    siteName: 'SimplifyConvert',
    title: 'AI Writing Tools - Free Online Content Generator',
    description: 'Generate blogs, emails, paragraphs and more with free AI writing tools. No signup required.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Writing Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Writing Tools - Free Online Content Generator',
    description: 'Generate blogs, emails, paragraphs and more with free AI writing tools.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/ai-tools',
  },
};

export default function AIToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

