import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Text Diff Checker - Compare Text Differences Online | SimplifyConvert',
  description:
    'Compare two texts online and highlight added and removed lines. Review replacements as removals and additions, with file input and PDF or CSV export.',
  keywords: [
    'text diff checker',
    'compare text',
    'text comparison',
    'find text differences',
    'compare two texts',
    'diff checker',
  ],
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/code-tools/text-diff',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/code-tools/text-diff',
    siteName: 'SimplifyConvert',
    title: 'Text Diff Checker - Compare Text Differences Online',
    description:
      'Compare two texts and identify added and removed lines, including replacements shown as removals and additions.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Text Diff Checker | SimplifyConvert',
    description:
      'Compare two texts and identify added and removed lines, including replacements shown as removals and additions.',
  },
};

export default function TextDiffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
