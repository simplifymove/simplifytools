/**
 * Generate layout.tsx files for all missing static tool routes
 * Extracts metadata from tools.ts
 */

const fs = require('fs');
const path = require('path');

// Tools that need layout.tsx files (verified missing from ls)
const MISSING_LAYOUTS = [
  'bmp-to-jpg',
  'bmp-to-png',
  'code-minifier',
  'edit-to-png',
  'eps-to-svg',
  'heic-to-jpg',
  'heic-to-png',
  'jpg-to-avif',
  'jpg-to-png',
  'jpg-to-tiff',
  'jpg-to-webp',
  'mp4-to-gif',
  'png-to-avif',
  'png-to-eps',
  'png-to-jpg',
  'png-to-tiff',
  'png-to-webp',
  'tiff-to-avif',
  'tiff-to-jpg',
  'tiff-to-svg',
  'tiff-to-text',
  'translate-image',
  'video',
  'view-metadata',
  'vsdx-to-jpg',
  'vsdx-to-pptx',
  'webp-to-avif',
  'webp-to-gif',
  'webp-to-jpg',
  'webp-to-png',
  'webp-to-tiff',
  // Special: pdf - layout missing (has [slug] subdirs)
];

// Extract tools from tools.ts
function extractToolsData() {
  const toolsFile = path.join(__dirname, 'app/data/tools.ts');
  const content = fs.readFileSync(toolsFile, 'utf-8');
  
  const tools = {};
  
  // Find all tool objects
  const toolMatches = content.matchAll(/{[\s\S]*?route:\s*['"`]\/all-tools\/([^'"`]+)['"`][\s\S]*?title:\s*['"`]([^'"`]+)['"`][\s\S]*?description:\s*['"`]([^'"`]+)['"`]/g);
  
  for (const match of toolMatches) {
    const [fullMatch, route, title, description] = match;
    tools[route] = { title, description };
  }
  
  return tools;
}

// Generate metadata and description from title
function generateMetadata(toolSlug, title, description) {
  const titleCase = title
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/-/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const canonicalUrl = `https://simplifyconvert.com/all-tools/${toolSlug}`;
  const ogDescription = description || `Free ${toolSlug.replace(/-/g, ' ')} tool`;
  
  return `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${title}',
  description: '${description || ogDescription}',
  keywords: ['${toolSlug.replace(/-/g, ' ')}', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '${canonicalUrl}',
    siteName: 'SimplifyConvert',
    title: '${title}',
    description: '${ogDescription}',
    images: [
      {
        url: 'https://simplifyconvert.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '${title}',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '${title}',
    description: '${ogDescription}',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  alternates: {
    canonical: '${canonicalUrl}',
  },
};

export default function ${toolSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;
}

// Main function
function generateLayoutFiles() {
  const tools = extractToolsData();
  let created = 0;
  let skipped = 0;
  
  console.log('📋 Generating layout.tsx files for missing routes...\n');
  
  MISSING_LAYOUTS.forEach((slug) => {
    const layoutPath = path.join(__dirname, `app/all-tools/${slug}/layout.tsx`);
    
    // Check if layout already exists
    if (fs.existsSync(layoutPath)) {
      console.log(`⏭️  Skipping: ${slug} (already has layout.tsx)`);
      skipped++;
      return;
    }
    
    // Get tool data
    const tool = tools[slug] || {};
    const title = tool.title || `${slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} - Free Online Tool`;
    const description = tool.description || `Free ${slug.replace(/-/g, ' ')} tool. Convert and edit online without signup.`;
    
    // Generate metadata
    const layoutContent = generateMetadata(slug, title, description);
    
    // Write file
    fs.writeFileSync(layoutPath, layoutContent, 'utf-8');
    console.log(`✅ Created: app/all-tools/${slug}/layout.tsx`);
    created++;
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total Processed: ${created + skipped}`);
}

// Run
generateLayoutFiles();
