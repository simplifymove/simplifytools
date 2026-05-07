import { MetadataRoute } from 'next';
import { allTools } from '@/app/data/tools';

// Import nested tools from libraries
import { aiWriteTools } from '@/app/lib/ai-tools';
import { codeTools } from '@/app/lib/code-tools';
import { dataTools } from '@/app/lib/data-tools';
import { pdfTools } from '@/app/lib/pdf-tools';
import { videoTools } from '@/app/lib/video-tools';
import { imageToolsRegistry } from '@/app/lib/image-tools-registry';

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
 * Extract tool IDs from nested tool libraries
 * Handles Record<string, Tool> structures
 */
function extractToolIds(toolsObject: any): string[] {
  if (!toolsObject) return [];

  // Handle Record<string, Tool> - extract keys as tool IDs
  if (typeof toolsObject === 'object' && !Array.isArray(toolsObject)) {
    return Object.keys(toolsObject).filter(key => {
      // Skip non-tool properties (functions, special keys, etc.)
      return typeof toolsObject[key] === 'object' && 
             toolsObject[key] !== null &&
             (toolsObject[key].id !== undefined || true); // Most tools have id property
    });
  }

  // Handle array of tools
  if (Array.isArray(toolsObject)) {
    return toolsObject
      .filter(tool => tool && (tool.id || tool.key))
      .map(tool => tool.id || tool.key);
  }

  return [];
}

/**
 * Generate dynamic XML sitemap for search engines
 * Includes:
 * - Homepage
 * - Main tool pages from tools.ts (/all-tools/[slug])
 * - Nested tool pages from libraries (/all-tools/[category]/[slug])
 * - Category pages
 *
 * Excludes:
 * - Problematic tools (YouTube, Instagram, TikTok downloaders)
 * - Pages without routes or tool data
 * - Redirects and admin/private pages
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 1. ADD HOMEPAGE - highest priority
  sitemapEntries.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  });

  // 2. MAIN TOOLS from tools.ts
  const validMainTools = allTools.filter((tool) => {
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

  // Add main tool pages
  validMainTools.forEach((tool) => {
    sitemapEntries.push({
      url: `${BASE_URL}${tool.route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  });

  // 3. NESTED TOOLS from libraries
  const nestedToolMappings = [
    {
      tools: extractToolIds(aiWriteTools),
      route: '/all-tools/ai-tools',
      label: 'AI Tools',
    },
    {
      tools: extractToolIds(pdfTools),
      route: '/all-tools/pdf',
      label: 'PDF Tools',
    },
    {
      tools: extractToolIds(videoTools),
      route: '/all-tools/video',
      label: 'Video Tools',
    },
    {
      tools: extractToolIds(codeTools),
      route: '/all-tools/code',
      label: 'Code Tools',
    },
    {
      tools: extractToolIds(dataTools),
      route: '/all-tools/data',
      label: 'Data Tools',
    },
    {
      tools: extractToolIds(imageToolsRegistry),
      route: '/all-tools/image-tools',
      label: 'Image Tools Registry',
    },
  ];

  const addedCategories = new Set<string>();

  // Add nested tool pages and category pages
  nestedToolMappings.forEach(({ tools, route, label }) => {
    if (tools.length === 0) return;

    // Add category page (if not already added)
    if (!addedCategories.has(route)) {
      sitemapEntries.push({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      addedCategories.add(route);
    }

    // Add individual nested tool pages
    tools.forEach((toolId) => {
      // Convert tool ID to URL-friendly slug
      const slug = toolId
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');

      sitemapEntries.push({
        url: `${BASE_URL}${route}/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  });

  // 4. ADD CATEGORY PAGES FROM MAIN TOOLS
  const categoriesSet = new Set<string>();
  validMainTools.forEach((tool) => {
    const categorySlug = tool.category
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    categoriesSet.add(categorySlug);
  });

  Array.from(categoriesSet)
    .sort()
    .forEach((categorySlug) => {
      const categoryUrl = `${BASE_URL}/all-tools/${categorySlug}`;
      if (!addedCategories.has(categoryUrl)) {
        sitemapEntries.push({
          url: categoryUrl,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
        addedCategories.add(categoryUrl);
      }
    });

  // 5. REMOVE DUPLICATES using Set
  const urlSet = new Set<string>();
  const deduplicatedSitemap = sitemapEntries.filter((entry) => {
    if (urlSet.has(entry.url)) {
      return false; // Skip duplicate
    }
    urlSet.add(entry.url);
    return true; // Keep unique entry
  });

  // Sort by URL priority: homepage first, then by path
  deduplicatedSitemap.sort((a, b) => {
    if (a.url === BASE_URL) return -1;
    if (b.url === BASE_URL) return 1;
    return a.url.localeCompare(b.url);
  });

  return deduplicatedSitemap;
}
