import type { Metadata } from 'next';

export const GUIDE_PUBLISHED_DATE = '2026-08-01';
export const GUIDE_DISPLAY_DATE = 'August 1, 2026';

export const blogGuides = [
  {
    slug: 'merge-split-compress-ocr-pdf-guide',
    title: 'Merge vs Split vs Compress vs OCR: Which PDF Tool Should You Use?',
    description: 'Choose the right PDF operation by separating page organization, file-size reduction, text recognition, and editable-document needs.',
    category: 'PDF',
    readTime: '10 min',
    marker: 'A PDF workflow starts with the problem, not the button',
  },
  {
    slug: 'jpg-png-webp-avif-image-formats',
    title: 'JPG vs PNG vs WebP vs AVIF: Which Image Format Should You Use?',
    description: 'Compare four common image formats by compression, transparency, browser use, editing needs, and realistic file-size tradeoffs.',
    category: 'Images',
    readTime: '11 min',
    marker: 'There is no universally best image format',
  },
  {
    slug: 'image-compression-quality-file-size',
    title: 'How Image Compression Affects Quality, Dimensions and File Size',
    description: 'Understand how encoding quality, pixel dimensions, image content, and repeated recompression affect image size and appearance.',
    category: 'Images',
    readTime: '10 min',
    marker: 'Compression and resizing solve different problems',
  },
  {
    slug: 'csv-excel-json-data-formats',
    title: 'CSV vs Excel vs JSON: Which Data Format Should You Choose?',
    description: 'Select a data format by comparing flat tables, spreadsheet features, nested structures, data types, and conversion risks.',
    category: 'Data',
    readTime: '12 min',
    marker: 'The right data format depends on who or what must use it next',
  },
  {
    slug: 'video-compression-resolution-bitrate-codec',
    title: 'Video Compression Explained: Resolution, Bitrate, Codec and File Size',
    description: 'Make practical video compression decisions by understanding resolution, bitrate, codecs, containers, frame rate, and audio.',
    category: 'Video',
    readTime: '11 min',
    marker: 'Video size is the result of several interacting choices',
  },
] as const;

export const existingBlogGuide = {
  slug: 'jpg-to-png-conversion-guide',
  title: 'How to Convert JPG to PNG Without Losing Quality',
  description: 'Learn what changes—and what does not—when a JPEG image is re-encoded as PNG.',
  category: 'Images',
  readTime: '5 min',
} as const;

export function guideMetadata(slug: string): Metadata {
  const guide = blogGuides.find((item) => item.slug === slug);
  if (!guide) throw new Error(`Unknown editorial guide: ${slug}`);

  const url = `https://simplifyconvert.com/blog/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.description,
    authors: [{ name: 'SimplifyConvert' }],
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      locale: 'en_US',
      siteName: 'SimplifyConvert',
      url,
      title: guide.title,
      description: guide.description,
      publishedTime: `${GUIDE_PUBLISHED_DATE}T00:00:00+05:30`,
    },
    twitter: {
      card: 'summary',
      title: guide.title,
      description: guide.description,
    },
  };
}
