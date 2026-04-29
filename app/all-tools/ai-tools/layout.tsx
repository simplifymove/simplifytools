import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Writing Tools - Generate Content Online',
  description: 'Free AI writing tools to generate blogs, emails, and content instantly. Use our AI writer without signup. Create professional content in seconds.',
  keywords: ['free AI writing tools', 'AI content generator', 'AI blog writer free', 'AI writing assistant', 'generate content with AI', 'AI tools online'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/ai-tools',
    siteName: 'SimplifyConvert',
    title: 'Free AI Writing Tools - Generate Content Online',
    description: 'Free AI writing tools to generate blogs, emails, and content instantly. Use our AI writer without signup. Create professional content in seconds.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Free AI writing tools to generate content online and create blogs, emails, and more',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Writing Tools - Generate Content Online',
    description: 'Free AI writing tools to generate blogs, emails, and content instantly. Use our AI writer without signup.',
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

