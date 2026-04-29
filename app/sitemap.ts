import { MetadataRoute } from 'next';
import { allTools } from '@/app/data/tools';

const BASE_URL = 'https://simplifyconvert.com';

// Tool patterns to exclude: YouTube, Instagram, TikTok downloaders
// These are either not functional or have platform restrictions
const EXCLUDED_PATTERNS = [
  'youtube',
  'instagram',
  'tiktok',
  'instagram-dl',
  'tiktok-dl',
  'instagram-reels',
  'tiktok-watermark',
];

/**
 * Generate dynamic XML sitemap for search engines
 * Includes: homepage, category pages, and valid tool pages
 * Excludes: problematic tools, pages without routes, duplicates
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Filter tools: only valid, routed tools that aren't excluded
  const validTools = allTools.filter((tool) => {
    // Must have a route
    if (!tool.route) return false;

    // Check if tool ID or title matches excluded patterns
    const toolIdLower = tool.id.toLowerCase();
    const titleLower = tool.title.toLowerCase();

    const isExcluded = EXCLUDED_PATTERNS.some(
      (pattern) =>
        toolIdLower.includes(pattern) || titleLower.includes(pattern)
    );

    return !isExcluded;
  });

  // Extract unique categories from valid tools
  const categoriesSet = new Set<string>();
  validTools.forEach((tool) => {
    const categorySlug = tool.category
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    categoriesSet.add(categorySlug);
  });

  const categories = Array.from(categoriesSet).sort();

  // Build sitemap entries in priority order
  const sitemap: MetadataRoute.Sitemap = [
    // Homepage - highest priority, updated daily
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },

    // Category pages - medium priority, updated weekly
    ...categories.map((categorySlug) => ({
      url: `${BASE_URL}/all-tools/${categorySlug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    // Tool pages - lower priority, updated monthly
    ...validTools.map((tool) => ({
      url: `${BASE_URL}${tool.route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];

  // Remove duplicates using URL deduplication
  const urlSet = new Set<string>();
  return sitemap.filter((entry) => {
    if (urlSet.has(entry.url)) {
      return false; // Skip duplicate
    }
    urlSet.add(entry.url);
    return true; // Keep unique entry
  });
}
