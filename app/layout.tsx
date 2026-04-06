import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SimplifyConvert - Free Image, Video, AI & Data Conversion Tools Online",
  description: "Discover 100+ free online tools for image editing, video conversion, AI writing, PDF manipulation, and data transformation. No installation required. Fast, secure, and easy to use.",
  keywords: ["image converter", "video converter", "PDF tools", "AI writing", "data conversion", "online tools", "free tools"],
  authors: [{ name: "SimplifyConvert" }],
  creator: "SimplifyConvert",
  publisher: "SimplifyConvert",
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://simplifyconvert.com",
    siteName: "SimplifyConvert",
    title: "SimplifyConvert - Free Online Tools for Image, Video & Data",
    description: "100+ free online tools for image editing, video conversion, AI writing, PDF tools, and data conversion. No signup required.",
    images: [
      {
        url: "https://simplifyconvert.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SimplifyConvert - Free Online Tools",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SimplifyConvert - Free Online Tools",
    description: "100+ free online tools for image, video, AI, PDF, and data conversion.",
    images: ["https://simplifyconvert.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://simplifyconvert.com",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SimplifyConvert",
              url: "https://simplifyconvert.com",
              logo: "https://simplifyconvert.com/logo.png",
              description: "Free online tools for image, video, AI, PDF, and data conversion",
              sameAs: [
                "https://twitter.com/simplifyconvert",
                "https://facebook.com/simplifyconvert",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: "https://simplifyconvert.com",
              name: "SimplifyConvert",
              description: "100+ free online tools for image, video, AI, PDF, and data conversion",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://simplifyconvert.com/all-tools?search={search_term_string}",
                },
                query_input: "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}



