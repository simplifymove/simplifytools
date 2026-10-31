import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download Files from Public URLs | SimplifyConvert',
  description: 'Download supported files from direct public URLs. Additional public media sources may work when a compatible download provider is available.',
  keywords: ['public file downloader', 'direct URL downloader', 'download file from URL', 'online file downloader'],
  openGraph: {
    title: 'Download Files from Public URLs',
    description: 'Download supported files from direct public URLs. Additional public media sources depend on provider availability.',
    type: 'website',
    url: 'https://simplifyconvert.com/all-tools/save-from-online',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Download Files from Public URLs',
    description: 'Download supported files from direct public URLs. Additional public media sources depend on provider availability.',
  },
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/save-from-online',
  },
};

export default function SaveFromOnlineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
