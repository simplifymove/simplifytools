import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit PDF Online - Edit PDF Text | SimplifyConvert',
  description:
    'Edit PDF text online with a visual document preview. Select editable text, make changes, review the document, and download the updated PDF.',
  keywords: [
    'edit PDF',
    'edit PDF online',
    'PDF text editor',
    'edit PDF text',
    'online PDF editor',
  ],
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/pdf/edit-pdf',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/pdf/edit-pdf',
    siteName: 'SimplifyConvert',
    title: 'Edit PDF Online - Edit PDF Text',
    description:
      'Edit text in PDF documents with a visual preview and download the updated PDF.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edit PDF Online | SimplifyConvert',
    description:
      'Edit text in PDF documents with a visual preview and download the updated PDF.',
  },
};

export default function EditPdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
