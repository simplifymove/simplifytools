// Verify nested tool imports are working
const path = require('path');

console.log('\n=== TASK 3: VERIFY NESTED TOOL IMPORTS ===\n');

try {
  const aiTools = require('./app/lib/ai-tools.ts');
  const pdfTools = require('./app/lib/pdf-tools.ts');
  const videoTools = require('./app/lib/video-tools.ts');
  const codeTools = require('./app/lib/code-tools.ts');
  const dataTools = require('./app/lib/data-tools.ts');
  const imageTools = require('./app/lib/image-tools-registry.ts');

  console.log('aiTools type:', typeof aiTools);
  console.log('aiTools keys:', Object.keys(aiTools).slice(0, 5), '...');
  
  if (aiTools.aiWriteTools) {
    const aitCount = Object.keys(aiTools.aiWriteTools).length;
    console.log('✓ aiWriteTools found:', aitCount, 'items');
  }

  if (pdfTools.pdfTools) {
    const pdfCount = Object.keys(pdfTools.pdfTools).length;
    console.log('✓ pdfTools found:', pdfCount, 'items');
  }
  
} catch (error) {
  console.log('ERROR loading tools:', error.message);
  console.log('\nTrying alternative import method...\n');

  // Try using ES modules
  (async () => {
    try {
      const { aiWriteTools } = await import('./app/lib/ai-tools.ts');
      const { pdfTools } = await import('./app/lib/pdf-tools.ts');
      const { videoTools } = await import('./app/lib/video-tools.ts');
      const { codeTools } = await import('./app/lib/code-tools.ts');
      const { dataTools } = await import('./app/lib/data-tools.ts');
      const { imageToolsRegistry } = await import('./app/lib/image-tools-registry.ts');

      console.log('\n=== NESTED TOOL LIBRARY CONTENTS ===\n');
      console.log('AI Write Tools:', Object.keys(aiWriteTools || {}).length);
      console.log('PDF Tools:', Object.keys(pdfTools || {}).length);
      console.log('Video Tools:', Object.keys(videoTools || {}).length);
      console.log('Code Tools:', Object.keys(codeTools || {}).length);
      console.log('Data Tools:', Object.keys(dataTools || {}).length);
      console.log('Image Tools Registry:', Array.isArray(imageToolsRegistry) ? imageToolsRegistry.length : Object.keys(imageToolsRegistry || {}).length);

      const total = 
        Object.keys(aiWriteTools || {}).length +
        Object.keys(pdfTools || {}).length +
        Object.keys(videoTools || {}).length +
        Object.keys(codeTools || {}).length +
        Object.keys(dataTools || {}).length +
        (Array.isArray(imageToolsRegistry) ? imageToolsRegistry.length : Object.keys(imageToolsRegistry || {}).length);
      
      console.log('\nTOTAL NESTED TOOLS:', total);

    } catch (asyncError) {
      console.log('ERROR with async import:', asyncError.message);
    }
  })();
}
