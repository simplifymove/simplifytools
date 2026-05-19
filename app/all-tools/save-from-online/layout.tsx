import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download YouTube, TikTok & Videos Online - Free Downloader',
  description: 'Free online downloader for YouTube, TikTok, Instagram, and more. Download videos, images, documents, and audio files. No registration required.',
  keywords: ['youtube downloader', 'download youtube videos', 'tiktok video downloader', 'instagram downloader', 'online video downloader', 'video downloader online', 'download videos from websites', 'free downloader', 'download files online'],
  openGraph: {
    title: 'Download YouTube, TikTok & Videos Online - Free Downloader',
    description: 'Free online downloader for YouTube, TikTok, Instagram, and more. Download videos, images, documents, and audio files. No registration required.',
    type: 'website',
    url: 'https://simplifyconvert.com/all-tools/save-from-online',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Download YouTube, TikTok & Videos Online - Free Downloader',
    description: 'Free online downloader for YouTube, TikTok, Instagram, and more. Download videos, images, documents, and audio files. No registration required.',
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

