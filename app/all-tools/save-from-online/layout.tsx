import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Online Downloader for Videos, Images & Files',
  description: 'Free online downloader for supported videos, images, documents, and audio files. Paste a public URL, check formats, and save files quickly.',
  keywords: ['online downloader', 'video downloader online', 'download files online', 'online file downloader', 'download videos from websites', 'image downloader', 'free downloader', 'bulk downloader'],
  openGraph: {
    title: 'Free Online Downloader for Videos, Images & Files',
    description: 'Free online downloader for supported videos, images, documents, and audio files. Paste a public URL, check formats, and save files quickly.',
    type: 'website',
    url: 'https://simplifyconvert.com/all-tools/save-from-online',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Downloader for Videos, Images & Files',
    description: 'Free online downloader for supported videos, images, documents, and audio files. Paste a public URL, check formats, and save files quickly.',
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

