import { Metadata } from 'next';
import { getToolById } from '@/app/lib/ai-tools';

interface Params {
  slug: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolById(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found - SimplifyConvert',
      robots: { index: false },
    };
  }

  const baseUrl = 'https://simplifyconvert.com';
  const canonicalUrl = `${baseUrl}/all-tools/text-to-speech/${slug}`;

  return {
    title: `${tool.title} - Free Text to Speech Tool | SimplifyConvert`,
    description: tool.description,
    keywords: [tool.title, 'text to speech', 'voice generator', 'ai tool', 'free tool'],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      siteName: 'SimplifyConvert',
      title: `${tool.title} - Free Text to Speech Tool`,
      description: tool.description,
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: tool.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.title} - Free Text to Speech Tool`,
      description: tool.description,
      images: [`${baseUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function TextToSpeechSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
