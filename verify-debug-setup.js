#!/usr/bin/env node

/**
 * Verify Hard Debug Mode Setup
 * Checks if all required test assets and configurations are in place
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 HARD DEBUG MODE VERIFICATION\n');

const checks = [
  {
    name: 'Test asset directory',
    path: path.join(process.cwd(), 'public/test-assets'),
    isDir: true,
  },
  {
    name: 'Forest test asset (SVG)',
    path: path.join(process.cwd(), 'public/test-assets/forest.svg'),
    isDir: false,
  },
  {
    name: 'Elephant test asset (SVG)',
    path: path.join(process.cwd(), 'public/test-assets/elephant.svg'),
    isDir: false,
  },
  {
    name: 'Environment variable VIDEO_ASSET_DEBUG',
    envVar: 'VIDEO_ASSET_DEBUG',
    isDir: false,
  },
  {
    name: 'Environment variable NEXT_PUBLIC_VIDEO_ASSET_DEBUG',
    envVar: 'NEXT_PUBLIC_VIDEO_ASSET_DEBUG',
    isDir: false,
  },
];

let allPassed = true;

checks.forEach((check) => {
  if (check.envVar) {
    const value = process.env[check.envVar];
    if (value === 'true') {
      console.log(`✅ ${check.name}: ${value}`);
    } else {
      console.log(`❌ ${check.name}: NOT SET (expected: true, got: ${value})`);
      allPassed = false;
    }
  } else {
    const exists = fs.existsSync(check.path);
    if (exists) {
      if (check.isDir) {
        const isDir = fs.statSync(check.path).isDirectory();
        console.log(`✅ ${check.name}: EXISTS (directory)`);
      } else {
        const size = fs.statSync(check.path).size;
        console.log(`✅ ${check.name}: EXISTS (${size} bytes)`);
      }
    } else {
      console.log(`❌ ${check.name}: MISSING`);
      allPassed = false;
    }
  }
});

console.log('\n' + '═'.repeat(60));

if (allPassed) {
  console.log('✅ ALL CHECKS PASSED - Hard debug mode is ready\n');
  console.log('Next steps:');
  console.log('1. npm run build');
  console.log('2. npm run dev');
  console.log('3. Test with forest/elephant prompts\n');
} else {
  console.log('❌ SOME CHECKS FAILED - Review errors above\n');
  console.log('Fix issues and re-run: node verify-debug-setup.js\n');
  process.exit(1);
}
