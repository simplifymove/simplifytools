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
const SITEMAP_DEBUG =
  process.env.NODE_ENV === 'development' || process.env.SITEMAP_DEBUG === 'true';

function sitemapDebugLog(...args: Parameters<typeof console.log>) {
  if (SITEMAP_DEBUG) {
    console.log(...args);
  }
}

// Exact legacy downloader identifiers that must not enter the sitemap.
// Platform-named AI generators and provider-dependent public tools remain eligible.
const EXCLUDED_TOOL_IDS = new Set([
  'instagram-dl',
  'tiktok-dl',
  'instagram-reels',
  'tiktok-watermark',
]);

const UNFINISHED_TOOL_IDS = new Set<string>([]);

// Redirect-only aliases must never compete with their canonical destinations.
const REDIRECT_ONLY_TOOL_ROUTES = new Set([
  '/all-tools/pdf-to-jpg',
  '/all-tools/pdf-to-text',
  '/all-tools/image-compressor',
  '/all-tools/mp4-to-gif',
  '/all-tools/pdf',
  '/all-tools/ai-write',
]);

// Temporarily excluded while its calculation model is under review.
const NOINDEX_TOOL_ROUTES = new Set([
  '/all-tools/financial-calculators/india-tax',
]);

function isExcludedTool(id: string, _title = ''): boolean {
  const idLower = id.toLowerCase();

  return UNFINISHED_TOOL_IDS.has(idLower) || EXCLUDED_TOOL_IDS.has(idLower);
}

/**
 * Extract tool IDs from nested tool libraries
 * Handles Record<string, Tool> structures
 */
function extractToolIds(toolsObject: any): string[] {
  if (!toolsObject) {
    sitemapDebugLog('    ⚠️  toolsObject is null/undefined');
    return [];
  }

  // Handle Record<string, Tool> - extract keys as tool IDs
  if (typeof toolsObject === 'object' && !Array.isArray(toolsObject)) {
    const keys = Object.keys(toolsObject);
    const filtered = keys.filter(key => {
      // Skip non-tool properties (functions, special keys, etc.)
      const isValidTool = typeof toolsObject[key] === 'object' && 
             toolsObject[key] !== null;
      
      const toolId = toolsObject[key].id || key;
      const toolTitle = toolsObject[key].title || '';

      return isValidTool && !isExcludedTool(toolId, toolTitle);
    });
    sitemapDebugLog(`    Object type: ${keys.length} keys → ${filtered.length} valid tools (excluded ${keys.length - filtered.length} restricted tools)`);
    return filtered;
  }

  // Handle array of tools
  if (Array.isArray(toolsObject)) {
    const filtered = toolsObject
      .filter(tool => {
        if (!tool || !(tool.id || tool.key)) return false;
        const toolId = tool.id || tool.key;
        return !isExcludedTool(toolId, tool.title || '');
      })
      .map(tool => tool.id || tool.key);
    sitemapDebugLog(`    Array type: ${toolsObject.length} items → ${filtered.length} valid tools (excluded ${toolsObject.length - filtered.length} restricted tools)`);
    return filtered;
  }

  sitemapDebugLog(`    Unknown type: ${typeof toolsObject}`);
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
  
  sitemapDebugLog('\n╔════════════════════════════════════════════════════════╗');
  sitemapDebugLog('║          SITEMAP GENERATION DEBUG - DETAILED             ║');
  sitemapDebugLog('╚════════════════════════════════════════════════════════╝\n');

  // 1. ADD HOMEPAGE - highest priority
  sitemapEntries.push({
    url: BASE_URL,
    changeFrequency: 'daily',
    priority: 1.0,
  });
  sitemapDebugLog('✓ Added homepage: 1 URL');

  // 1.5 ADD MAIN PAGES - important category and static pages
  sitemapDebugLog('\n📄 MAIN PAGES');
  sitemapDebugLog('─────────────────────────────');
  
  const mainPages = [
    { url: '/all-tools', priority: 0.95, frequency: 'daily' as const, label: 'All Tools Directory' },
    { url: '/blog', priority: 0.8, frequency: 'weekly' as const, label: 'Blog' },
    { url: '/blog/jpg-to-png-conversion-guide', priority: 0.7, frequency: 'monthly' as const, label: 'JPG to PNG Blog Guide' },
    { url: '/blog/merge-split-compress-ocr-pdf-guide', priority: 0.7, frequency: 'monthly' as const, label: 'PDF Workflow Guide' },
    { url: '/blog/jpg-png-webp-avif-image-formats', priority: 0.7, frequency: 'monthly' as const, label: 'Image Formats Guide' },
    { url: '/blog/image-compression-quality-file-size', priority: 0.7, frequency: 'monthly' as const, label: 'Image Compression Guide' },
    { url: '/blog/csv-excel-json-data-formats', priority: 0.7, frequency: 'monthly' as const, label: 'Data Formats Guide' },
    { url: '/blog/video-compression-resolution-bitrate-codec', priority: 0.7, frequency: 'monthly' as const, label: 'Video Compression Guide' },
    { url: '/blog/how-simplifyconvert-works', priority: 0.7, frequency: 'monthly' as const, label: 'How SimplifyConvert Works Guide' },
    { url: '/blog/all-tools-guide', priority: 0.7, frequency: 'monthly' as const, label: 'All Tools Guide' },
    { url: '/blog/pdf-tools-guide', priority: 0.7, frequency: 'monthly' as const, label: 'PDF Tools Guide' },
    { url: '/blog/image-tools-guide', priority: 0.7, frequency: 'monthly' as const, label: 'Image Tools Guide' },
    { url: '/blog/video-tools-guide', priority: 0.7, frequency: 'monthly' as const, label: 'Video Tools Guide' },
    { url: '/blog/data-tools-guide', priority: 0.7, frequency: 'monthly' as const, label: 'Data Tools Guide' },
    { url: '/blog/ai-studio-guide', priority: 0.7, frequency: 'monthly' as const, label: 'AI Studio Guide' },
    { url: '/blog/ai-presentation-maker-guide', priority: 0.7, frequency: 'monthly' as const, label: 'AI Presentation Maker Guide' },
    { url: '/blog/ai-document-maker-guide', priority: 0.7, frequency: 'monthly' as const, label: 'AI Document Maker Guide' },
    { url: '/blog/ai-spreadsheet-maker-guide', priority: 0.7, frequency: 'monthly' as const, label: 'AI Spreadsheet Maker Guide' },
    { url: '/blog/compress-image-online-guide', priority: 0.7, frequency: 'monthly' as const, label: 'Compress Image Guide' },
    { url: '/blog/remove-background-online-guide', priority: 0.7, frequency: 'monthly' as const, label: 'Remove Background Guide' },
    { url: '/blog/merge-pdf-online-guide', priority: 0.7, frequency: 'monthly' as const, label: 'Merge PDF Guide' },
    { url: '/about', priority: 0.5, frequency: 'monthly' as const, label: 'About' },
    { url: '/contact', priority: 0.4, frequency: 'yearly' as const, label: 'Contact' },
    { url: '/privacy', priority: 0.3, frequency: 'yearly' as const, label: 'Privacy Policy' },
    { url: '/terms', priority: 0.3, frequency: 'yearly' as const, label: 'Terms of Service' },
    { url: '/cookies', priority: 0.3, frequency: 'yearly' as const, label: 'Cookie Policy' },
    { url: '/ai-code-assistant', priority: 0.7, frequency: 'monthly' as const, label: 'AI Code Assistant' },
    { url: '/ai-code-assistant/docs', priority: 0.6, frequency: 'monthly' as const, label: 'AI Code Assistant Documentation' },
    { url: '/ai-code-assistant/pricing', priority: 0.6, frequency: 'monthly' as const, label: 'AI Code Assistant Pricing' },
    { url: '/ai-studio', priority: 0.8, frequency: 'weekly' as const, label: 'AI Studio' },
    { url: '/ai-studio/pricing', priority: 0.7, frequency: 'monthly' as const, label: 'AI Studio Pricing' },
    { url: '/all-tools/image-tools', priority: 0.8, frequency: 'weekly' as const, label: 'Image Tools' },
    { url: '/all-tools/pdf-tools', priority: 0.8, frequency: 'weekly' as const, label: 'PDF Tools' },
    { url: '/all-tools/video-tools', priority: 0.8, frequency: 'weekly' as const, label: 'Video Tools' },
    { url: '/all-tools/financial-calculators', priority: 0.7, frequency: 'monthly' as const, label: 'Financial Calculators' },
    { url: '/all-tools/resume-maker', priority: 0.7, frequency: 'monthly' as const, label: 'Resume Maker' },
    { url: '/all-tools/text-to-speech', priority: 0.7, frequency: 'monthly' as const, label: 'Text to Speech' },
    { url: '/all-tools/pdf/add-text', priority: 0.6, frequency: 'monthly' as const, label: 'Add Text to PDF' },
    { url: '/all-tools/eps-to-png', priority: 0.6, frequency: 'monthly' as const, label: 'EPS to PNG' },
    { url: '/all-tools/batch-compress-images', priority: 0.6, frequency: 'monthly' as const, label: 'Batch Compress Images' },
    { url: '/all-tools/batch-resize-images', priority: 0.6, frequency: 'monthly' as const, label: 'Batch Resize Images' },
  ];
  
  mainPages.forEach(({ url, priority, frequency, label }) => {
    sitemapEntries.push({
      url: `${BASE_URL}${url}`,
      changeFrequency: frequency,
      priority,
    });
    sitemapDebugLog(`✓ Added ${label}: ${url}`);
  });

  // 2. MAIN TOOLS from tools.ts
  sitemapDebugLog('\n📋 MAIN TOOLS (from tools.ts)');
  sitemapDebugLog('─────────────────────────────');
  
  sitemapDebugLog('allTools type:', typeof allTools);
  sitemapDebugLog('allTools is Array:', Array.isArray(allTools));
  const allToolsCount = Array.isArray(allTools) ? allTools.length : Object.keys(allTools).length;
  sitemapDebugLog('Total items in allTools:', allToolsCount);
  
  const validMainTools = allTools.filter((tool) => {
    // Must have a route
    if (!tool.route) return false;

    // Check if tool ID or title matches excluded patterns
    const toolIdLower = tool.id.toLowerCase();
    const titleLower = tool.title.toLowerCase();

    return !isExcludedTool(toolIdLower, titleLower)
      && !REDIRECT_ONLY_TOOL_ROUTES.has(tool.route)
      && !NOINDEX_TOOL_ROUTES.has(tool.route);
  });

  sitemapDebugLog('✓ Valid main tools (with routes, not excluded):', validMainTools.length);

  // Add main tool pages
  validMainTools.forEach((tool) => {
    sitemapEntries.push({
      url: `${BASE_URL}${tool.route}`,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  });
  
  sitemapDebugLog('✓ Added main tool pages:', validMainTools.length);

  // 3. NESTED TOOLS from libraries
  sitemapDebugLog('\n🗂️  NESTED TOOL LIBRARIES');
  sitemapDebugLog('─────────────────────────────');
  
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
      includeCategory: false,
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
      route: '/all-tools/data',
      label: 'Data Tools',
    },
    {
      tools: extractToolIds(imageToolsRegistry),
      route: '/all-tools',
      label: 'Image Tools Registry',
    },
  ];

  // DEBUG: Log nested tool counts with detailed info
  sitemapDebugLog('\nRAW IMPORT DATA:');
  sitemapDebugLog('  aiWriteTools type:', typeof aiWriteTools, '| Keys:', Object.keys(aiWriteTools || {}).length);
  sitemapDebugLog('  pdfTools type:', typeof pdfTools, '| Keys:', Object.keys(pdfTools || {}).length);
  sitemapDebugLog('  videoTools type:', typeof videoTools, '| Keys:', Object.keys(videoTools || {}).length);
  sitemapDebugLog('  codeTools type:', typeof codeTools, '| Keys:', Object.keys(codeTools || {}).length);
  sitemapDebugLog('  dataTools type:', typeof dataTools, '| Keys:', Object.keys(dataTools || {}).length);
  sitemapDebugLog('  imageToolsRegistry type:', typeof imageToolsRegistry, '| Items:', Array.isArray(imageToolsRegistry) ? imageToolsRegistry.length : Object.keys(imageToolsRegistry || {}).length);
  
  sitemapDebugLog('\nEXTRACTED TOOL IDS:');
  let totalNestedTools = 0;
  nestedToolMappings.forEach(({ tools, label }) => {
    sitemapDebugLog(`  ${label}: ${tools.length}`);
    totalNestedTools += tools.length;
  });
  sitemapDebugLog(`\n  TOTAL NESTED TOOLS: ${totalNestedTools}`);

  // Create a Set of main tool IDs for deduplication
  const mainToolIds = new Set(validMainTools.map(tool => tool.id.toLowerCase()));
  
  sitemapDebugLog('Main tool IDs to exclude from nested: ' + mainToolIds.size);

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
  
  sitemapDebugLog('Main tool categories:', Array.from(mainToolCategorySlugs).sort().join(', '));

  // Add nested tool pages and category pages
  nestedToolMappings.forEach(({ tools, route, label, includeCategory }) => {
    if (tools.length === 0) {
      sitemapDebugLog(`  ✗ ${label}: 0 tools (SKIPPED)`);
      return;
    }

    // Filter out tools that already exist in main tools
    const uniqueNestedTools = tools.filter(toolId => 
      !mainToolIds.has(toolId.toLowerCase())
    );
    
    const duplicatesInThisCategory = tools.length - uniqueNestedTools.length;
    if (duplicatesInThisCategory > 0) {
      sitemapDebugLog(`  ⚠️  ${label}: ${tools.length} tools → ${uniqueNestedTools.length} unique (removed ${duplicatesInThisCategory} duplicates)`);
    } else {
      sitemapDebugLog(`  ✓ ${label}: ${uniqueNestedTools.length} tools`);
    }

    // Add category page (if not already added by main tools)
    // Only add if this is NOT a main tool category
    const categorySlugFromRoute = route.split('/').pop() || '';
    if (includeCategory !== false && !addedCategories.has(route) && !mainToolCategorySlugs.has(categorySlugFromRoute)) {
      sitemapEntries.push({
        url: `${BASE_URL}${route}`,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      sitemapDebugLog(`    → Added category page: ${route}`);
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
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  });

  // 4. DO NOT ADD MAIN TOOL CATEGORY PAGES
  // These don't have actual pages, so they return 404
  // Only nested category pages (ai-tools, pdf, code, data, image-tools) are real pages
  sitemapDebugLog('\n🏷️  CATEGORY PAGES');
  sitemapDebugLog('─────────────────────────────');
  sitemapDebugLog('⚠️  NOT adding main tool categories (downloader, financial-calculator, image, video - these pages don\'t exist)');
  sitemapDebugLog('✓ Only including nested category pages that have actual pages');

  // 5. REMOVE DUPLICATES using Set
  sitemapDebugLog('\n🔄 DEDUPLICATION');
  sitemapDebugLog('─────────────────────────────');
  sitemapDebugLog('Total entries before dedup:', sitemapEntries.length);
  
  const urlSet = new Set<string>();
  const deduplicatedSitemap = sitemapEntries.filter((entry) => {
    if (urlSet.has(entry.url)) {
      sitemapDebugLog(`  ⚠️  Unexpected duplicate: ${entry.url}`);
      return false; // Skip duplicate
    }
    urlSet.add(entry.url);
    return true; // Keep unique entry
  });
  
  sitemapDebugLog('✓ Total entries after dedup:', deduplicatedSitemap.length);

  // Sort by URL priority: homepage first, then by path
  deduplicatedSitemap.sort((a, b) => {
    if (a.url === BASE_URL) return -1;
    if (b.url === BASE_URL) return 1;
    return a.url.localeCompare(b.url);
  });

  // Debug: Log comprehensive final breakdown
  sitemapDebugLog('\n📊 FINAL SITEMAP BREAKDOWN');
  sitemapDebugLog('─────────────────────────────');
  sitemapDebugLog('Homepage entries: 1');
  sitemapDebugLog('Main pages: ' + mainPages.length);
  sitemapDebugLog('Main tool pages: ' + validMainTools.length);
  
  // Count unique nested tools (excluding duplicates with main tools)
  let uniqueNestedToolsCount = 0;
  nestedToolMappings.forEach(({ tools }) => {
    const uniqueTools = tools.filter(toolId => 
      !mainToolIds.has(toolId.toLowerCase())
    );
    uniqueNestedToolsCount += uniqueTools.length;
  });
  
  sitemapDebugLog('Unique nested tool pages: ' + uniqueNestedToolsCount);
  sitemapDebugLog('Category pages: ' + addedCategories.size);
  
  const expectedCount = 1 + mainPages.length + validMainTools.length + uniqueNestedToolsCount + addedCategories.size;
  sitemapDebugLog('\n📈 EXPECTED TOTAL:', expectedCount);
  sitemapDebugLog('✅ ACTUAL FINAL TOTAL:', deduplicatedSitemap.length, 'URLs');
  
  if (Math.abs(expectedCount - deduplicatedSitemap.length) > 5) {
    sitemapDebugLog('\n⚠️  MISMATCH: Expected', expectedCount, 'but got', deduplicatedSitemap.length);
  } else {
    sitemapDebugLog('\n✅ PERFECT MATCH: All URLs accounted for!');
  }
  
  sitemapDebugLog('\n╔════════════════════════════════════════════════════════╗');
  sitemapDebugLog('║                  END DEBUG OUTPUT                        ║');
  sitemapDebugLog('╚════════════════════════════════════════════════════════╝\n');

  return deduplicatedSitemap;
}
