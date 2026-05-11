import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit PDF Online Free - SimplifyConvert',
  description: 'Edit PDF text content with visual preview and inline editing. Click on any text to edit, zoom controls, and instant download. Fast, secure, no signup needed.',
  openGraph: {
    title: 'Edit PDF Online Free',
    description: 'Edit PDF text content with visual preview and inline editing',
    type: 'website',
  },
};

export default function EditPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
