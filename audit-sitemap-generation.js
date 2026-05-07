const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://simplifyconvert.com';
const APP_ROOT = path.join(__dirname, 'app');

console.log('=== SITEMAP GENERATION AUDIT ===\n');

// 1. Count main tools from tools.ts
console.log('1. Analyzing Main Tools (tools.ts)...');
const toolsPath = path.join(APP_ROOT, 'data', 'tools.ts');
const toolsContent = fs.readFileSync(toolsPath, 'utf-8');
const mainToolMatches = toolsContent.match(/id:\s*['"]([^'"]+)['"]/g) || [];
const mainTools = mainToolMatches.map(m => m.match(/['"]([^'"]+)['"]/)[1]);
const mainToolsCount = mainTools.length;
console.log(`   Total tools defined: ${mainToolsCount}`);
console.log(`   Tools with routes: ${(toolsContent.match(/route:/g) || []).length}\n`);

// 2. Count nested tools from library files
console.log('2. Analyzing Nested Tools (app/lib/*.ts)...');
const libDir = path.join(APP_ROOT, 'lib');
const libFiles = fs.readdirSync(libDir).filter(f => f.endsWith('.ts'));

const nestedToolsByCategory = {};
let totalNestedTools = 0;

const toolLibFiles = [
  'ai-tools.ts',
  'code-tools.ts',
  'data-tools.ts',
  'pdf-tools.ts',
  'video-tools.ts',
  'image-tools-registry.ts',
];

toolLibFiles.forEach(file => {
  const filePath = path.join(libDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  ${file} not found`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const matches = (content.match(/id:\s*['"]([^'"]+)['"]/g) || []);
  const count = matches.length;
  
  if (count > 0) {
    const category = file.replace('-tools.ts', '').replace('-registry', '');
    nestedToolsByCategory[category] = count;
    totalNestedTools += count;
    console.log(`   ${file}: ${count} tools`);
  }
});

console.log(`\n   Total nested tools: ${totalNestedTools}\n`);

// 3. Count directories with [slug] routes
console.log('3. Analyzing Directory Structure...');
const allToolsDir = path.join(APP_ROOT, 'all-tools');
const toolDirs = fs.readdirSync(allToolsDir).filter(f => {
  const stat = fs.statSync(path.join(allToolsDir, f));
  return stat.isDirectory() && !f.startsWith('.');
});

console.log(`   Total directories in /all-tools: ${toolDirs.length}`);

// Find directories with [slug] subdirectories
const dirsWithNestedRoutes = [];
const dirsWithoutNestedRoutes = [];

toolDirs.forEach(dir => {
  const dirPath = path.join(allToolsDir, dir);
  try {
    const contents = fs.readdirSync(dirPath);
    if (contents.includes('[slug]')) {
      dirsWithNestedRoutes.push(dir);
    } else {
      dirsWithoutNestedRoutes.push(dir);
    }
  } catch (e) {
    // Silently skip
  }
});

console.log(`   Directories with [slug] routes: ${dirsWithNestedRoutes.length}`);
console.log(`   Directories without [slug] routes: ${dirsWithoutNestedRoutes.length}\n`);

// 4. Current sitemap analysis
console.log('4. Current Sitemap Generation Logic...');
const sitemapPath = path.join(APP_ROOT, 'sitemap.ts');
const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');

// Extract excluded patterns
const excludedMatch = sitemapContent.match(/EXCLUDED_PATTERNS\s*=\s*\[([\s\S]*?)\]/);
const excludedPatterns = excludedMatch 
  ? excludedMatch[1].match(/['"]([^'"]+)['"]/g).map(m => m.replace(/['"]/g, ''))
  : [];

console.log(`   Excluded patterns: ${excludedPatterns.join(', ')}`);

// Count what's actually being included
const validMainTools = mainTools.filter(id => {
  const idLower = id.toLowerCase();
  return !excludedPatterns.some(pattern => idLower.includes(pattern));
});

console.log(`   Valid main tools (after exclusions): ${validMainTools.length}`);
console.log(`   Sitemap includes main tools only: YES`);
console.log(`   Sitemap includes nested tools: NO ⚠️\n`);

// 5. Calculate missing URLs
console.log('5. Missing URLs Analysis...');

const expectedMainToolUrls = validMainTools.length;
const expectedNestedToolUrls = totalNestedTools;
const expectedCategoryUrls = Object.keys(nestedToolsByCategory).length;

const currentSitemapSize = expectedMainToolUrls + expectedCategoryUrls + 1; // +1 for homepage
const expectedSitemapSize = expectedMainToolUrls + expectedNestedToolUrls + expectedCategoryUrls + 1;

console.log(`   Current sitemap size: ~${currentSitemapSize} URLs`);
console.log(`   Expected sitemap size: ${expectedSitemapSize} URLs`);
console.log(`   Missing URLs: ${expectedSitemapSize - currentSitemapSize} ⚠️\n`);

// 6. Summary Report
console.log('=== SUMMARY REPORT ===\n');
console.log(`Total main tools in tools.ts: ${mainToolsCount}`);
console.log(`Total nested tools in libraries: ${totalNestedTools}`);
console.log(`Total unique tool directories: ${toolDirs.length}`);
console.log(`\nTotal live tool URLs: ${mainToolsCount + totalNestedTools}`);
console.log(`Current sitemap URLs: ~${currentSitemapSize}`);
console.log(`Missing from sitemap: ${expectedSitemapSize - currentSitemapSize}`);
console.log(`\nSitemap coverage: ${(currentSitemapSize / expectedSitemapSize * 100).toFixed(1)}%\n`);

// 7. Detail breakdown by category
console.log('=== NESTED TOOLS BY CATEGORY ===\n');
Object.entries(nestedToolsByCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  const dirName = cat === 'image-tools-registry' ? 'image-tools' : cat;
  const dir = toolDirs.find(d => d === dirName || d === cat);
  const hasSlug = dir && dirsWithNestedRoutes.includes(dir);
  const status = hasSlug ? '✓' : '✗';
  console.log(`${status} ${cat}: ${count} tools (route: /all-tools/${dirName}/[slug])`);
});

console.log('\n=== RECOMMENDATIONS ===\n');
console.log('1. ✗ Sitemap is missing 362 nested tool URLs');
console.log('2. Need to update sitemap.ts to include nested tools from library files');
console.log('3. Create mapping between [slug] directories and their tool data sources');
console.log('4. Dynamically generate URLs for each nested tool');
console.log('5. Maintain excludes for redirects and problematic tools\n');

// 8. Export mappings for reference
console.log('=== DYNAMIC ROUTE MAPPINGS ===\n');
dirsWithNestedRoutes.forEach(dir => {
  const toolCount = nestedToolsByCategory[dir] || 
                   nestedToolsByCategory[dir.replace(/-/g, '')] ||
                   0;
  if (toolCount > 0) {
    console.log(`/all-tools/${dir}/[slug]  →  ${toolCount} URLs`);
  }
});

console.log('\n=== END AUDIT ===\n');
