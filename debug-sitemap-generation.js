// Generate the sitemap and count actual URLs
const { allTools } = require('./app/data/tools');
const { aiWriteTools } = require('./app/lib/ai-tools');
const { pdfTools } = require('./app/lib/pdf-tools');
const { videoTools } = require('./app/lib/video-tools');
const { codeTools } = require('./app/lib/code-tools');
const { dataTools } = require('./app/lib/data-tools');
const { imageToolsRegistry } = require('./app/lib/image-tools-registry');

function extractToolIds(toolsObject) {
  if (!toolsObject) return [];
  if (typeof toolsObject === 'object' && !Array.isArray(toolsObject)) {
    return Object.keys(toolsObject).filter(key => {
      return typeof toolsObject[key] === 'object' && toolsObject[key] !== null;
    });
  }
  if (Array.isArray(toolsObject)) {
    return toolsObject.filter(tool => tool && (tool.id || tool.key))
      .map(tool => tool.id || tool.key);
  }
  return [];
}

const EXCLUDED_PATTERNS = ['youtube', 'instagram', 'tiktok', 'instagram-dl', 'tiktok-dl', 'instagram-reels', 'tiktok-watermark'];

// Count main tools
const validMainTools = allTools.filter((tool) => {
  if (!tool.route) return false;
  const toolIdLower = tool.id.toLowerCase();
  const titleLower = tool.title.toLowerCase();
  const isExcluded = EXCLUDED_PATTERNS.some(pattern => 
    toolIdLower.includes(pattern) || titleLower.includes(pattern)
  );
  return !isExcluded;
});

console.log('=== ACTUAL SITEMAP GENERATION COUNT ===\n');
console.log('1. Homepage: 1');
console.log('2. Main Tools (/all-tools/[slug]): ' + validMainTools.length);

// Count nested tools
const nestedToolMappings = [
  { tools: extractToolIds(aiWriteTools), route: '/all-tools/ai-tools', label: 'AI Tools' },
  { tools: extractToolIds(pdfTools), route: '/all-tools/pdf', label: 'PDF Tools' },
  { tools: extractToolIds(videoTools), route: '/all-tools/video', label: 'Video Tools' },
  { tools: extractToolIds(codeTools), route: '/all-tools/code', label: 'Code Tools' },
  { tools: extractToolIds(dataTools), route: '/all-tools/data', label: 'Data Tools' },
  { tools: extractToolIds(imageToolsRegistry), route: '/all-tools/image-tools', label: 'Image Tools' },
];

let totalNested = 0;
let totalNestedCategories = 0;

console.log('\n3. Nested Tool Categories and URLs:');
nestedToolMappings.forEach(({ tools, route, label }) => {
  if (tools.length > 0) {
    console.log(`   - ${label} (${route}): ${tools.length} tools + 1 category page`);
    totalNested += tools.length;
    totalNestedCategories++;
  }
});

// Count categories from main tools
const categoriesSet = new Set();
validMainTools.forEach((tool) => {
  const categorySlug = tool.category.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  categoriesSet.add(categorySlug);
});

console.log(`\n4. Main Tool Category Pages: ${categoriesSet.size}`);

const totalExpected = 1 + validMainTools.length + totalNested + totalNestedCategories + categoriesSet.size;

console.log('\n=== TOTAL EXPECTED URLS ===');
console.log(`- Homepage: 1`);
console.log(`- Main Tool Pages: ${validMainTools.length}`);
console.log(`- Nested Tool Pages: ${totalNested}`);
console.log(`- Nested Category Pages: ${totalNestedCategories}`);
console.log(`- Main Category Pages: ${categoriesSet.size}`);
console.log(`- TOTAL: ${totalExpected}`);
console.log(`\nScreaming Frog detected: 324 URLs`);
console.log(`Expected: ${totalExpected} URLs`);
console.log(`Difference: ${totalExpected - 324} URLs missing`);
