#!/usr/bin/env node

/**
 * Cleanup Script - Clears caches and old files for fresh debugging
 * 
 * Removes:
 * - Remotion cache (.remotion)
 * - Old generated videos (public/videos)
 * - Asset cache (.asset-cache)
 * - Next.js cache (.next)
 * - Old render jobs (in-memory)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🧹 CLEANUP: Clearing caches and old files...\n');

const dirs = [
  { path: '.remotion', name: 'Remotion Cache' },
  { path: '.asset-cache', name: 'Asset Cache' },
  { path: 'public/videos', name: 'Generated Videos' },
  { path: '.next', name: 'Next.js Build Cache' },
  { path: 'out', name: 'Export Output' },
];

for (const dir of dirs) {
  const fullPath = path.join(process.cwd(), dir.path);
  if (fs.existsSync(fullPath)) {
    try {
      // Use rm -rf equivalent
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${fullPath}"`, { stdio: 'ignore' });
      } else {
        execSync(`rm -rf "${fullPath}"`, { stdio: 'ignore' });
      }
      console.log(`✅ Deleted ${dir.name}: ${dir.path}`);
    } catch (error) {
      console.log(`⚠️  Could not delete ${dir.name}: ${error.message}`);
    }
  } else {
    console.log(`ℹ️  ${dir.name} not found: ${dir.path}`);
  }
}

// Create public/videos directory if it doesn't exist
const videoDir = path.join(process.cwd(), 'public', 'videos');
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
  console.log(`✅ Created ${videoDir}`);
}

// Create .asset-cache directory if it doesn't exist
const cacheDir = path.join(process.cwd(), '.asset-cache');
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
  console.log(`✅ Created ${cacheDir}`);
}

console.log('\n✅ CLEANUP COMPLETE\n');
console.log('Next steps:');
console.log('1. npm run build');
console.log('2. npm run dev');
console.log('3. Test with: curl -X POST http://localhost:3000/api/video/generate-script ...\n');
