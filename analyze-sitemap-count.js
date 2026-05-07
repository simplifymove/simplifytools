// Count expected URLs in sitemap based on code structure

const mainTools = [
  'add-border', 'add-images', 'add-text', 'ai-image-generator',
  'black-white', 'blur-background', 'bmp-to-jpg', 'bmp-to-png',
  'chart-maker', 'cleanup-picture', 'code-minifier', 'collage-maker',
  'colorize-photo', 'combine-images', 'compress-image', 'crop-image',
  'edit-to-png', 'eps-to-png', 'eps-to-svg', 'financial-calculators',
  'flip-image', 'font-awesome-to-png', 'gif-to-jpg', 'gif-to-mp4',
  'gif-to-png', 'grayscale-image', 'heic-to-avif', 'heic-to-jpg',
  'heic-to-png', 'image-splitter', 'image-to-text', 'jpg-to-avif',
  'jpg-to-gif', 'jpg-to-png', 'jpg-to-svg', 'jpg-to-tiff', 'jpg-to-webp',
  'make-background-transparent', 'make-round-image', 'mp4-to-gif',
  'pdf-to-jpg', 'pdf-to-text', 'png-to-avif', 'png-to-eps', 'png-to-jpg',
  'png-to-svg', 'png-to-tiff', 'png-to-webp', 'profile-photo-maker',
  'psd-to-ai', 'psd-to-jpg', 'psd-to-png', 'psd-to-svg', 'remove-background',
  'remove-object', 'remove-watermark', 'resize-image', 'resume-maker',
  'reverse-image', 'rotate-image', 'save-from-online', 'text-to-speech',
  'tiff-to-avif', 'tiff-to-jpg', 'tiff-to-png', 'tiff-to-svg', 'tiff-to-text',
  'translate-image', 'unblur-image', 'upscale-image', 'view-metadata',
  'vsd-to-docx', 'vsd-to-pdf', 'vsd-to-pptx', 'vsdx-to-docx', 'vsdx-to-jpg',
  'vsdx-to-pdf', 'vsdx-to-pptx', 'webp-to-avif', 'webp-to-gif', 'webp-to-jpg',
  'webp-to-png', 'webp-to-tiff'
];

const nestedCategories = {
  'ai-tools': 46,      // from ai-tools library
  'ai-write': 2,       // From build output: /all-tools/ai-write/[slug]
  'code': 1,           // /all-tools/code/[slug] - code-tools
  'code-tools': 48,    // text-diff + 47 others (from code-tools library)
  'data': 11,          // /all-tools/data/[slug]
  'data-converter': 1, // /all-tools/data-converter/[slug]
  'financial-calculators': 1, // /all-tools/financial-calculators/[slug]
  'pdf': 127,          // from pdf-tools library
  'resume-maker': 1,   // job-match + others
  'video': 102,        // from video-tools library
  'video-tools': 2,    // From build: text-to-video, universal-downloader
  'image-tools': 9     // if it has [slug] route
};

const staticMainTools = mainTools.length;
const staticCategoryPages = Object.keys(nestedCategories).length;

let nestedToolsCount = 0;
let categoryPagesWithRoutes = 0;

// Count nested tools from build output routes
const routesWithSlug = [
  'ai-tools',
  'ai-write', 
  'code',
  'code-tools',
  'data',
  'data-converter',
  'financial-calculators',
  'pdf',
  'resume-maker',
  'video',
  'video-tools'
];

// From the nested categories data
const toolsPerCategory = {
  'ai-tools': 46,
  'ai-write': 0,      // No specific count, appears to be alias
  'code': 0,          // No specific count
  'code-tools': 49,   // from code-tools library
  'data': 12,         // from data-tools library
  'data-converter': 0, // Likely data-tools
  'financial-calculators': 0,
  'pdf': 127,         // from pdf-tools library
  'resume-maker': 0,  // Special case with one shown item
  'video': 102,       // from video-tools library
  'video-tools': 0,   // Likely alias
  'image-tools': 9    // from image-tools library
};

console.log('=== SITEMAP URL COUNT ANALYSIS ===\n');
console.log(`1. Homepage: 1 URL`);
console.log(`2. Main Tools Pages: ${staticMainTools} URLs`);
console.log(`3. Category Pages: ${staticCategoryPages} URLs`);
console.log(`\n4. Nested Tools by Category:`);

let totalNested = 0;
for (const [cat, count] of Object.entries(toolsPerCategory)) {
  if (count > 0) {
    console.log(`   - ${cat}: ${count} tools`);
    totalNested += count;
  }
}

console.log(`\n   Total Nested Tools: ${totalNested} URLs`);

const totalExpected = 1 + staticMainTools + staticCategoryPages + totalNested;
console.log(`\n=== TOTAL EXPECTED URLS: ${totalExpected} ===\n`);

console.log(`Breakdown:`);
console.log(`- Homepage: 1`);
console.log(`- Main Tools: ${staticMainTools}`);
console.log(`- Category Pages: ${staticCategoryPages}`);
console.log(`- Nested Tools: ${totalNested}`);
console.log(`- TOTAL: ${totalExpected}`);
