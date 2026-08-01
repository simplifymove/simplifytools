import type { Metadata } from 'next';
import AllToolsClient from './AllToolsClient';

export const metadata: Metadata = {
  title: 'All Online Tools - Browse by Task and Category',
  description: 'Browse SimplifyConvert tools for PDF, image, video, data, code, AI writing, and financial calculations. Search the directory or choose a category.',
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools',
  },
};

interface AllToolsPageProps {
  searchParams: Promise<{
    category?: string | string[];
    search?: string | string[];
  }>;
}

export default async function AllToolsPage({ searchParams }: AllToolsPageProps) {
  const resolvedSearchParams = await searchParams;
  const category = Array.isArray(resolvedSearchParams.category)
    ? resolvedSearchParams.category[0]
    : resolvedSearchParams.category;
  const search = Array.isArray(resolvedSearchParams.search)
    ? resolvedSearchParams.search[0]
    : resolvedSearchParams.search;

  return <AllToolsClient initialCategory={category} initialSearch={search} />;
}
