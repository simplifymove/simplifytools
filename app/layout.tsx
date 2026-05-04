import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { generateOrganizationSchema, generateWebSiteSchema } from "./lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Free Online Tools to Convert PDFs, Images & Videos",
  description: "Use 200+ free online tools to convert PDFs, images, videos, and files instantly. No signup needed. Fast, secure, and free forever.",
  keywords: [
    "free online tools",
    "online converter",
    "file converter",
    "image converter",
    "video converter",
    "PDF tools",
    "free image editor",
    "free video converter",
    "free PDF editor",
    "online tool suite",
    "file conversion tool",
    "free conversion tool",
  ],
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
    title: "Free Online Tools to Convert PDFs, Images & Videos",
    description: "Convert images, videos, PDFs and more. 200+ free online tools, no signup required.",
    images: [
      {
        url: "https://simplifyconvert.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Free Online Tools - Convert Images, Videos, PDFs Instantly",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Tools to Convert PDFs, Images & Videos",
    description: "200+ free online tools for image, video, PDF, and file conversion.",
    images: ["https://simplifyconvert.com/og-image.jpg"],
    creator: "@simplifyconvert",
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
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* JSON-LD Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        
        {/* Google Tag Manager (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1G9BR41W9G"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-1G9BR41W9G');
            `,
          }}
        />

        {/* PDF.js Library is imported directly in PdfPageReorderer component */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}



