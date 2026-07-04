import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/video-tools/universal-downloader',
  },
};

export default function UniversalDownloaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

