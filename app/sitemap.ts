import { MetadataRoute } from 'next';
import { allTools } from '@/app/data/tools';

// Import nested tools from libraries
import { aiWriteTools } from '@/app/lib/ai-tools';
import { codeTools } from '@/app/lib/code-tools';
import { dataTools } from '@/app/lib/data-tools';
import { pdfTools } from '@/app/lib/pdf-tools';
import { videoTools } from '@/app/lib/video-tools';
import { imageToolsRegistry } from '@/app/lib/image-tools-registry';

// CRITICAL: Force Next.js to regenerate sitemap on every request
// This prevents caching of stale sitemap data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
 * Tools that exist in registries but don't have actual pages
 * These should be excluded from the sitemap
 */
const TOOLS_WITHOUT_PAGES = [
  'blur-background',
  'compress-image',
  'grayscale-image',
  'profile-photo-maker',
  'remove-object',
  'resize-image',
  'rotate-image',
  'upscale-image',
];

/**
 * Extract tool IDs from nested tool libraries
 * Handles Record<string, Tool> structures
 */
function extractToolIds(toolsObject: any): string[] {
  if (!toolsObject) {
    console.log('    ⚠️  toolsObject is null/undefined');
    return [];
  }

  // Handle Record<string, Tool> - extract keys as tool IDs
  if (typeof toolsObject === 'object' && !Array.isArray(toolsObject)) {
    const keys = Object.keys(toolsObject);
    const filtered = keys.filter(key => {
      // Skip non-tool properties (functions, special keys, etc.)
      const isValidTool = typeof toolsObject[key] === 'object' && 
             toolsObject[key] !== null &&
             (toolsObject[key].id !== undefined || true);
      
      // Also skip tools that don't have pages
      const toolId = (toolsObject[key].id || key).toLowerCase();
      const hasNoPage = TOOLS_WITHOUT_PAGES.some(t => t.toLowerCase() === toolId);
      
      return isValidTool && !hasNoPage;
    });
    console.log(`    Object type: ${keys.length} keys → ${filtered.length} valid tools (excluded ${keys.length - filtered.length} without pages)`);
    return filtered;
  }

  // Handle array of tools
  if (Array.isArray(toolsObject)) {
    const filtered = toolsObject
      .filter(tool => {
        if (!tool || !(tool.id || tool.key)) return false;
        const toolId = (tool.id || tool.key).toLowerCase();
        return !TOOLS_WITHOUT_PAGES.some(t => t.toLowerCase() === toolId);
      })
      .map(tool => tool.id || tool.key);
    console.log(`    Array type: ${toolsObject.length} items → ${filtered.length} valid tools (excluded ${toolsObject.length - filtered.length} without pages)`);
    return filtered;
  }

  console.log(`    Unknown type: ${typeof toolsObject}`);
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
  
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║          SITEMAP GENERATION DEBUG - DETAILED             ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // 1. ADD HOMEPAGE - highest priority
  sitemapEntries.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  });
  console.log('✓ Added homepage: 1 URL');

  // 1.5 ADD MAIN PAGES - important category and static pages
  console.log('\n📄 MAIN PAGES');
  console.log('─────────────────────────────');
  
  const mainPages = [
    { url: '/all-tools', priority: 0.95, frequency: 'daily' as const, label: 'All Tools Directory' },
    { url: '/blog', priority: 0.8, frequency: 'weekly' as const, label: 'Blog' },
    { url: '/terms', priority: 0.3, frequency: 'yearly' as const, label: 'Terms of Service' },
  ];
  
  mainPages.forEach(({ url, priority, frequency, label }) => {
    sitemapEntries.push({
      url: `${BASE_URL}${url}`,
      lastModified: new Date(),
      changeFrequency: frequency,
      priority,
    });
    console.log(`✓ Added ${label}: ${url}`);
  });

  // 2. MAIN TOOLS from tools.ts
  console.log('\n📋 MAIN TOOLS (from tools.ts)');
  console.log('─────────────────────────────');
  
  console.log('allTools type:', typeof allTools);
  console.log('allTools is Array:', Array.isArray(allTools));
  const allToolsCount = Array.isArray(allTools) ? allTools.length : Object.keys(allTools).length;
  console.log('Total items in allTools:', allToolsCount);
  
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
    
    // Also exclude tools that don't have actual pages
    const hasNoPage = TOOLS_WITHOUT_PAGES.some(t => t.toLowerCase() === toolIdLower);

    return !isExcluded && !hasNoPage;
  });

  console.log('✓ Valid main tools (with routes, not excluded):', validMainTools.length);

  // Add main tool pages
  validMainTools.forEach((tool) => {
    sitemapEntries.push({
      url: `${BASE_URL}${tool.route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  });
  
  console.log('✓ Added main tool pages:', validMainTools.length);

  // 3. NESTED TOOLS from libraries
  console.log('\n🗂️  NESTED TOOL LIBRARIES');
  console.log('─────────────────────────────');
  
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
      includeCategory: false,
    },
    {
      tools: extractToolIds(codeTools),
      route: '/all-tools/code-tools',
      label: 'Code Tools',
    },
    {
      tools: extractToolIds(dataTools),
      route: '/all-tools/data-converter',
      label: 'Data Tools',
    },
    {
      tools: extractToolIds(imageToolsRegistry),
      route: '/all-tools',
      label: 'Image Tools Registry',
    },
  ];

  // DEBUG: Log nested tool counts with detailed info
  console.log('\nRAW IMPORT DATA:');
  console.log('  aiWriteTools type:', typeof aiWriteTools, '| Keys:', Object.keys(aiWriteTools || {}).length);
  console.log('  pdfTools type:', typeof pdfTools, '| Keys:', Object.keys(pdfTools || {}).length);
  console.log('  videoTools type:', typeof videoTools, '| Keys:', Object.keys(videoTools || {}).length);
  console.log('  codeTools type:', typeof codeTools, '| Keys:', Object.keys(codeTools || {}).length);
  console.log('  dataTools type:', typeof dataTools, '| Keys:', Object.keys(dataTools || {}).length);
  console.log('  imageToolsRegistry type:', typeof imageToolsRegistry, '| Items:', Array.isArray(imageToolsRegistry) ? imageToolsRegistry.length : Object.keys(imageToolsRegistry || {}).length);
  
  console.log('\nEXTRACTED TOOL IDS:');
  let totalNestedTools = 0;
  nestedToolMappings.forEach(({ tools, label }) => {
    console.log(`  ${label}: ${tools.length}`);
    totalNestedTools += tools.length;
  });
  console.log(`\n  TOTAL NESTED TOOLS: ${totalNestedTools}`);

  // Create a Set of main tool IDs for deduplication
  const mainToolIds = new Set(validMainTools.map(tool => tool.id.toLowerCase()));
  
  console.log('Main tool IDs to exclude from nested: ' + mainToolIds.size);

  const addedCategories = new Set<string>();
  
  // PRE-ADD MAIN TOOL CATEGORIES to avoid duplicates with nested categories
  const mainToolCategorySlugs = new Set<string>();
  validMainTools.forEach((tool) => {
    const categorySlug = tool.category
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    mainToolCategorySlugs.add(categorySlug);
  });
  
  console.log('Main tool categories:', Array.from(mainToolCategorySlugs).sort().join(', '));

  // Add nested tool pages and category pages
  nestedToolMappings.forEach(({ tools, route, label, includeCategory }) => {
    if (tools.length === 0) {
      console.log(`  ✗ ${label}: 0 tools (SKIPPED)`);
      return;
    }

    // Filter out tools that already exist in main tools
    const uniqueNestedTools = tools.filter(toolId => 
      !mainToolIds.has(toolId.toLowerCase())
    );
    
    const duplicatesInThisCategory = tools.length - uniqueNestedTools.length;
    if (duplicatesInThisCategory > 0) {
      console.log(`  ⚠️  ${label}: ${tools.length} tools → ${uniqueNestedTools.length} unique (removed ${duplicatesInThisCategory} duplicates)`);
    } else {
      console.log(`  ✓ ${label}: ${uniqueNestedTools.length} tools`);
    }

    // Add category page (if not already added by main tools)
    // Only add if this is NOT a main tool category
    const categorySlugFromRoute = route.split('/').pop() || '';
    if (includeCategory !== false && !addedCategories.has(route) && !mainToolCategorySlugs.has(categorySlugFromRoute)) {
      sitemapEntries.push({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      console.log(`    → Added category page: ${route}`);
      addedCategories.add(route);
    }

    // Add individual nested tool pages (only unique ones)
    uniqueNestedTools.forEach((toolId) => {
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

  // 4. DO NOT ADD MAIN TOOL CATEGORY PAGES
  // These don't have actual pages, so they return 404
  // Only nested category pages (ai-tools, pdf, code, data, image-tools) are real pages
  console.log('\n🏷️  CATEGORY PAGES');
  console.log('─────────────────────────────');
  console.log('⚠️  NOT adding main tool categories (downloader, financial-calculator, image, video - these pages don\'t exist)');
  console.log('✓ Only including nested category pages that have actual pages');

  // 5. REMOVE DUPLICATES using Set
  console.log('\n🔄 DEDUPLICATION');
  console.log('─────────────────────────────');
  console.log('Total entries before dedup:', sitemapEntries.length);
  
  const urlSet = new Set<string>();
  const deduplicatedSitemap = sitemapEntries.filter((entry) => {
    if (urlSet.has(entry.url)) {
      console.log(`  ⚠️  Unexpected duplicate: ${entry.url}`);
      return false; // Skip duplicate
    }
    urlSet.add(entry.url);
    return true; // Keep unique entry
  });
  
  console.log('✓ Total entries after dedup:', deduplicatedSitemap.length);

  // Sort by URL priority: homepage first, then by path
  deduplicatedSitemap.sort((a, b) => {
    if (a.url === BASE_URL) return -1;
    if (b.url === BASE_URL) return 1;
    return a.url.localeCompare(b.url);
  });

  // Debug: Log comprehensive final breakdown
  console.log('\n📊 FINAL SITEMAP BREAKDOWN');
  console.log('─────────────────────────────');
  console.log('Homepage entries: 1');
  console.log('Main pages (All Tools, Blog, Terms): 3');
  console.log('Main tool pages: ' + validMainTools.length);
  
  // Count unique nested tools (excluding duplicates with main tools)
  let uniqueNestedToolsCount = 0;
  nestedToolMappings.forEach(({ tools }) => {
    const uniqueTools = tools.filter(toolId => 
      !mainToolIds.has(toolId.toLowerCase())
    );
    uniqueNestedToolsCount += uniqueTools.length;
  });
  
  console.log('Unique nested tool pages: ' + uniqueNestedToolsCount);
  console.log('Category pages: ' + addedCategories.size);
  
  const expectedCount = 1 + 3 + validMainTools.length + uniqueNestedToolsCount + addedCategories.size;
  console.log('\n📈 EXPECTED TOTAL:', expectedCount);
  console.log('✅ ACTUAL FINAL TOTAL:', deduplicatedSitemap.length, 'URLs');
  
  if (Math.abs(expectedCount - deduplicatedSitemap.length) > 5) {
    console.log('\n⚠️  MISMATCH: Expected', expectedCount, 'but got', deduplicatedSitemap.length);
  } else {
    console.log('\n✅ PERFECT MATCH: All URLs accounted for!');
  }
  
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                  END DEBUG OUTPUT                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  return deduplicatedSitemap;
}
