import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Write - Free AI Writing Tools | SimplifyConvert',
  description: 'Generate, rewrite, summarize, and work with text using AI-assisted writing tools. Review and edit generated content before use.',
  keywords: ['AI writing', 'content generator', 'AI writer', 'free writing tools'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/ai-tools',
    siteName: 'SimplifyConvert',
    title: 'AI Write - Free AI Writing Tools',
    description: 'Generate, edit, and enhance content with AI-powered writing tools.',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: 'AI Write' }],
  },
  twitter: { card: 'summary_large_image', title: 'AI Write - Free AI Writing Tools', description: 'Generate, edit, and enhance content with AI-powered writing tools.', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/ai-tools' },
  robots: {
    index: false,
    follow: true,
  },
};

export default function AiWriteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
