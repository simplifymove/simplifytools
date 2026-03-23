import { Metadata } from 'next';
import { getImageToolById } from '@/app/lib/image-tools-registry';

interface Params {
  slug: string;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getImageToolById(slug);

  if (!tool) {
    return {
      title: 'Tool Not Found - SimplifyConvert',
      robots: { index: false },
    };
  }

  const baseUrl = 'https://simplifyconvert.com';
  const canonicalUrl = `${baseUrl}/all-tools/profile-photo-maker/${slug}`;

  return {
    title: `${tool.title} - Free Profile Photo Maker | SimplifyConvert`,
    description: tool.description,
    keywords: [tool.title, 'profile photo', 'photo maker', 'free tool'],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      siteName: 'SimplifyConvert',
      title: `${tool.title} - Free Profile Photo Maker`,
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
      title: `${tool.title} - Free Profile Photo Maker`,
      description: tool.description,
      images: [`${baseUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function ProfilePhotoMakerSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
