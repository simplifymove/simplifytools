/**
 * Batch create all missing layout.tsx files for static tool routes
 */

const fs = require('fs');
const path = require('path');

const TOOL_LAYOUTS = [
  { slug: 'bmp-to-png', title: 'BMP to PNG' },
  { slug: 'code-minifier', title: 'Code Minifier' },
  { slug: 'edit-to-png', title: 'Edit to PNG' },
  { slug: 'eps-to-svg', title: 'EPS to SVG' },
  { slug: 'heic-to-jpg', title: 'HEIC to JPG' },
  { slug: 'heic-to-png', title: 'HEIC to PNG' },
  { slug: 'jpg-to-avif', title: 'JPG to AVIF' },
  { slug: 'jpg-to-png', title: 'JPG to PNG' },
  { slug: 'jpg-to-tiff', title: 'JPG to TIFF' },
  { slug: 'jpg-to-webp', title: 'JPG to WebP' },
  { slug: 'mp4-to-gif', title: 'MP4 to GIF' },
  { slug: 'pdf', title: 'PDF Tools' },
  { slug: 'png-to-avif', title: 'PNG to AVIF' },
  { slug: 'png-to-eps', title: 'PNG to EPS' },
  { slug: 'png-to-jpg', title: 'PNG to JPG' },
  { slug: 'png-to-tiff', title: 'PNG to TIFF' },
  { slug: 'png-to-webp', title: 'PNG to WebP' },
  { slug: 'tiff-to-avif', title: 'TIFF to AVIF' },
  { slug: 'tiff-to-jpg', title: 'TIFF to JPG' },
  { slug: 'tiff-to-svg', title: 'TIFF to SVG' },
  { slug: 'tiff-to-text', title: 'TIFF to Text' },
  { slug: 'translate-image', title: 'Translate Image' },
  { slug: 'video', title: 'Video Tools' },
  { slug: 'view-metadata', title: 'View Metadata' },
  { slug: 'vsdx-to-jpg', title: 'VSDX to JPG' },
  { slug: 'vsdx-to-pptx', title: 'VSDX to PPTX' },
  { slug: 'webp-to-avif', title: 'WebP to AVIF' },
  { slug: 'webp-to-gif', title: 'WebP to GIF' },
  { slug: 'webp-to-jpg', title: 'WebP to JPG' },
  { slug: 'webp-to-png', title: 'WebP to PNG' },
  { slug: 'webp-to-tiff', title: 'WebP to TIFF' },
];

function generateLayout(slug, title) {
  const keywords = slug.replace(/-/g, ' ');
  const description = `Convert and edit ${keywords} online instantly. Free tool without signup required.`;
  
  const componentName = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
  
  return `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${title} - Free Online Tool | SimplifyConvert',
  description: '${description}',
  keywords: ['${keywords}', 'free tool', 'online converter'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/${slug}',
    siteName: 'SimplifyConvert',
    title: '${title} - Free Online Tool',
    description: '${description}',
    images: [{ url: 'https://simplifyconvert.com/og-image.jpg', width: 1200, height: 630, alt: '${title}' }],
  },
  twitter: { card: 'summary_large_image', title: '${title}', description: '${description}', images: ['https://simplifyconvert.com/og-image.jpg'] },
  alternates: { canonical: 'https://simplifyconvert.com/all-tools/${slug}' },
};

export default function ${componentName}Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;
}

function main() {
  let created = 0;
  let skipped = 0;
  let failed = 0;
  
  console.log('📋 Creating layout.tsx files for static routes...\n');
  
  TOOL_LAYOUTS.forEach(({ slug, title }) => {
    const layoutPath = path.join(__dirname, `app/all-tools/${slug}/layout.tsx`);
    
    // Skip if layout already exists
    if (fs.existsSync(layoutPath)) {
      console.log(`⏭️  ${slug} - layout already exists`);
      skipped++;
      return;
    }
    
    try {
      const content = generateLayout(slug, title);
      fs.writeFileSync(layoutPath, content, 'utf-8');
      console.log(`✅ ${slug}`);
      created++;
    } catch (error) {
      console.log(`❌ ${slug} - ${error.message}`);
      failed++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`  ✅ Created: ${created}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  Total: ${created + skipped + failed}/${TOOL_LAYOUTS.length}`);
}

main();
