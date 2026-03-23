import { Metadata } from 'next';
import { getConverter } from '@/app/lib/converters';

interface Params {
  slug: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getConverter(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found - SimplifyConvert',
      robots: { index: false },
    };
  }

  const baseUrl = 'https://simplifyconvert.com';
  const canonicalUrl = `${baseUrl}/all-tools/converters/${slug}`;
  const toolTitle = tool.title || tool.id.replace(/-/g, ' ').toUpperCase();

  return {
    title: `${toolTitle} - Free File Converter Tool | SimplifyConvert`,
    description: tool.description || `Convert ${tool.from?.toUpperCase()} to ${tool.to?.toUpperCase()} easily.`,
    keywords: [toolTitle, 'file converter', 'converter tool', 'free tool'],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      siteName: 'SimplifyConvert',
      title: `${toolTitle} - Free File Converter Tool`,
      description: tool.description || `Convert ${tool.from?.toUpperCase()} to ${tool.to?.toUpperCase()} easily.`,
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: toolTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${toolTitle} - Free File Converter Tool`,
      description: tool.description || `Convert ${tool.from?.toUpperCase()} to ${tool.to?.toUpperCase()} easily.`,
      images: [`${baseUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function ConvertersSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
