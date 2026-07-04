import { notFound, permanentRedirect } from 'next/navigation';
import { getImageToolById } from '@/app/lib/image-tools-registry';

interface Params {
  slug: string;
}

export default async function ImageToolSlugPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const tool = getImageToolById(slug);

  if (!tool) {
    notFound();
  }

  permanentRedirect(`/all-tools/${tool.slug}`);
}
