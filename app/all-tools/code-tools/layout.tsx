import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Code Tools: Format, Minify & Validate Code',
  description: 'Free online code tools for developers. Format, minify, validate, and convert code in JavaScript, HTML, CSS, JSON, XML, and more. 49 tools, no signup required.',
  keywords: ['free code tools', 'code formatter', 'code minifier', 'online code editor', 'code validator', 'developer tools online', 'JSON formatter', 'HTML minifier'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/code-tools',
    siteName: 'SimplifyConvert',
    title: 'Free Code Tools: Format, Minify & Validate Code',
    description: 'Free online code tools for developers. 49 tools to format, minify, validate, and convert code instantly. No signup required.',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Free code tools to format, minify, validate and convert code for developers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Code Tools: Format, Minify & Validate Code',
    description: 'Free online code tools for developers. 49 tools to format, minify, validate, and convert code instantly.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/code-tools',
  },
};

export default function CodeToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

