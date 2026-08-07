'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

const ADSENSE_CLIENT_ID = 'ca-pub-4666093512004911';

export default function AdSenseScript() {
  const pathname = usePathname();

  // AI Studio is intentionally ad-free for every visitor.
  if (
    pathname === '/ai-studio' ||
    pathname?.startsWith('/ai-studio/')
  ) {
    return null;
  }

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
