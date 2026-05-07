/**
 * COMPREHENSIVE SITEMAP GENERATION DEBUGGING SCRIPT
 * Tests the exact sitemap generation logic locally
 */

const path = require('path');

// Suppress TypeScript errors for this debug run
console.log('\n=== SITEMAP GENERATION DEBUG ===\n');

try {
  // Try importing the raw data files
  const { allTools } = require('./app/data/tools.ts');
  
  console.log('✓ Loaded allTools');
  console.log('  Type:', typeof allTools);
  console.log('  Is Array:', Array.isArray(allTools));
  console.log('  Count:', Array.isArray(allTools) ? allTools.length : Object.keys(allTools).length);
  
  // Check structure
  if (Array.isArray(allTools) && allTools.length > 0) {
    console.log('  First item:', allTools[0]);
  } else if (!Array.isArray(allTools)) {
    const keys = Object.keys(allTools);
    console.log('  First 5 keys:', keys.slice(0, 5));
    console.log('  Sample:', allTools[keys[0]]);
  }
  
  console.log('\n');

} catch (error) {
  console.log('ERROR loading allTools:', error.message);
  console.log('This might be a TypeScript import issue\n');
}

// Try loading nested tools
const libraries = [
  { name: 'ai-tools', file: './app/lib/ai-tools.ts', exportName: 'aiWriteTools' },
  { name: 'pdf-tools', file: './app/lib/pdf-tools.ts', exportName: 'pdfTools' },
  { name: 'video-tools', file: './app/lib/video-tools.ts', exportName: 'videoTools' },
  { name: 'code-tools', file: './app/lib/code-tools.ts', exportName: 'codeTools' },
  { name: 'data-tools', file: './app/lib/data-tools.ts', exportName: 'dataTools' },
  { name: 'image-tools-registry', file: './app/lib/image-tools-registry.ts', exportName: 'imageToolsRegistry' },
];

console.log('=== NESTED TOOL LIBRARIES ===\n');

libraries.forEach(lib => {
  try {
    const imported = require(lib.file);
    const exported = imported[lib.exportName];
    
    let count = 0;
    if (Array.isArray(exported)) {
      count = exported.length;
    } else if (typeof exported === 'object' && exported !== null) {
      count = Object.keys(exported).length;
    }
    
    console.log(`✓ ${lib.name}:`);
    console.log(`  Export name: ${lib.exportName}`);
    console.log(`  Type: ${typeof exported}`);
    console.log(`  Count: ${count}`);
    
    if (count === 0) {
      console.log(`  ⚠️ WARNING: EMPTY!`);
    }
    
  } catch (error) {
    console.log(`✗ ${lib.name}: ${error.message}`);
  }
  
  console.log('');
});

console.log('=== NEXT STEPS ===\n');
console.log('If nested tool counts are 0, the import is failing.');
console.log('If nested tool counts match expected (47, 129, 104, 50, 13, 10), check sitemap.ts logic.\n');
