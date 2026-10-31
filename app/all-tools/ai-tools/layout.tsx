import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Writing Tools - Generate, Rewrite & Summarize',
  description: 'Browse AI-assisted tools for drafting, rewriting, summarizing, and analyzing text. Review generated output for accuracy before using it.',
  keywords: ['free AI writing tools', 'AI content generator', 'AI blog writer free', 'AI writing assistant', 'generate content with AI', 'AI tools online'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/ai-tools',
    siteName: 'SimplifyConvert',
    title: 'AI Writing Tools - Generate, Rewrite & Summarize',
    description: 'AI-assisted tools for drafting, rewriting, summarizing, and analyzing text.',
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
    title: 'AI Writing Tools - Generate, Rewrite & Summarize',
    description: 'AI-assisted tools for drafting, rewriting, summarizing, and analyzing text.',
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
