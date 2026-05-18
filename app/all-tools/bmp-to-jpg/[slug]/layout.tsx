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
  const canonicalUrl = `${baseUrl}/all-tools/bmp-to-jpg/${slug}`;
  const toolTitle = tool.title || tool.id.replace(/-/g, ' ').toUpperCase();

  return {
    title: `${toolTitle} - Free BMP to JPG Converter Tool | SimplifyConvert`,
    description: tool.description || `Convert ${tool.from?.toUpperCase()} to ${tool.to?.toUpperCase()} easily and quickly with SimplifyConvert.`,
    keywords: [toolTitle, 'bmp to jpg', 'converter', 'free tool'],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      siteName: 'SimplifyConvert',
      title: `${toolTitle} - Free BMP to JPG Converter`,
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
      title: `${toolTitle} - Free BMP to JPG Converter`,
      description: tool.description || `Convert ${tool.from?.toUpperCase()} to ${tool.to?.toUpperCase()} easily.`,
      images: [`${baseUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function BmpToJpgSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
