import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Code Assistant Pricing | SimplifyConvert",
  description:
    "Review SimplifyConvert AI Code Assistant pricing, plan features, and usage options.",
  alternates: {
    canonical: "https://simplifyconvert.com/ai-code-assistant/pricing",
  },
  openGraph: {
    type: "website",
    url: "https://simplifyconvert.com/ai-code-assistant/pricing",
    siteName: "SimplifyConvert",
    title: "AI Code Assistant Pricing",
    description:
      "Review SimplifyConvert AI Code Assistant pricing, plan features, and usage options.",
    images: [
      {
        url: "https://simplifyconvert.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AI Code Assistant pricing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Code Assistant Pricing",
    description:
      "Review SimplifyConvert AI Code Assistant pricing, plan features, and usage options.",
    images: ["https://simplifyconvert.com/og-image.jpg"],
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
