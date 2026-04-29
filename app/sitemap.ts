import { MetadataRoute } from 'next';
import { allTools } from '@/app/data/tools';

const BASE_URL = 'https://simplifyconvert.com';

export default function sitemap(): MetadataRoute.Sitemap {
  // Get unique categories
  const categoriesSet = new Set<string>();
  allTools.forEach((tool) => {
    const categorySlug = tool.category.toLowerCase().replace(/\s+/g, '-');
    categoriesSet.add(categorySlug);
  });

  const categories = Array.from(categoriesSet);

  // Homepage
  const homepage: MetadataRoute.Sitemap[0] = {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  };

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((categorySlug) => ({
    url: `${BASE_URL}/all-tools/${categorySlug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Tool pages - use route property from tools
  const toolPages: MetadataRoute.Sitemap = allTools
    .filter((tool) => tool.route) // Only include tools with defined routes
    .map((tool) => ({
      url: `${BASE_URL}${tool.route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  // Remove duplicates by URL
  const allPages = [homepage, ...categoryPages, ...toolPages];
  const uniqueUrls = new Set<string>();
  const uniqueSitemap: MetadataRoute.Sitemap = [];

  for (const page of allPages) {
    if (!uniqueUrls.has(page.url)) {
      uniqueUrls.add(page.url);
      uniqueSitemap.push(page);
    }
  }

  return uniqueSitemap;
}
