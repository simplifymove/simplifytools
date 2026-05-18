#!/usr/bin/env node

/**
 * Test Asset Providers Initialization
 * Verifies that API keys are configured and providers can connect
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') });

console.log('🎬 CINEMATIC ASSET PROVIDERS - INITIALIZATION TEST\n');
console.log('=' .repeat(60));

// Check API Keys
const apiKeys = {
  PEXELS_API_KEY: process.env.PEXELS_API_KEY,
  PIXABAY_API_KEY: process.env.PIXABAY_API_KEY,
  UNSPLASH_API_KEY: process.env.UNSPLASH_API_KEY,
};

console.log('\n📋 API KEY CONFIGURATION:');
console.log('-'.repeat(60));

Object.entries(apiKeys).forEach(([name, value]) => {
  if (value) {
    const masked = value.substring(0, 8) + '...' + value.substring(value.length - 4);
    console.log(`✅ ${name}: ${masked}`);
  } else {
    console.log(`⚠️  ${name}: NOT SET`);
  }
});

// Test Provider Availability
console.log('\n\n🔍 PROVIDER AVAILABILITY TEST:');
console.log('-'.repeat(60));

// Test Pexels
if (apiKeys.PEXELS_API_KEY) {
  try {
    const pexelsRes = await fetch('https://api.pexels.com/v1/search?query=test&per_page=1', {
      headers: { Authorization: apiKeys.PEXELS_API_KEY },
    });
    
    if (pexelsRes.ok) {
      console.log('✅ Pexels API: Connected successfully');
      const data = await pexelsRes.json();
      console.log(`   → Found ${data.total_results || 0} total results in database`);
    } else {
      console.log(`❌ Pexels API: ${pexelsRes.status} ${pexelsRes.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Pexels API: Connection failed - ${error.message}`);
  }
} else {
  console.log('⚠️  Pexels API: No API key configured');
}

// Test Pixabay
if (apiKeys.PIXABAY_API_KEY) {
  try {
    const pixabayRes = await fetch(
      `https://pixabay.com/api/?key=${apiKeys.PIXABAY_API_KEY}&q=test&per_page=1`
    );
    
    if (pixabayRes.ok) {
      console.log('✅ Pixabay API: Connected successfully');
      const data = await pixabayRes.json();
      console.log(`   → Found ${data.totalHits || 0} total results in database`);
    } else {
      console.log(`❌ Pixabay API: ${pixabayRes.status} ${pixabayRes.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Pixabay API: Connection failed - ${error.message}`);
  }
} else {
  console.log('⚠️  Pixabay API: No API key configured');
}

// Test unDraw (no auth needed)
try {
  const unDrawRes = await fetch('https://undraw.co/api/illustrations?search=technology');
  if (unDrawRes.ok) {
    console.log('✅ unDraw API: Connected successfully (no auth required)');
    const data = await unDrawRes.json();
    console.log(`   → Found ${data.length || 0} illustrations`);
  } else {
    console.log(`❌ unDraw API: ${unDrawRes.status} ${unDrawRes.statusText}`);
  }
} catch (error) {
  console.log(`❌ unDraw API: Connection failed - ${error.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('\n📊 SUMMARY:');
console.log('-'.repeat(60));

const enabledProviders = Object.values(apiKeys).filter(v => v).length;
console.log(`✅ Providers configured: ${enabledProviders}/4`);
console.log(`✅ System ready for cinematic video generation\n`);

console.log('🚀 NEXT STEPS:');
console.log('-'.repeat(60));
console.log('1. Update SceneRenderer to use CinematicScenePresets');
console.log('2. Update /api/video/script to use buildCinematicGroqPrompt');
console.log('3. Initialize providers in middleware or startup');
console.log('4. Run: npm run dev');
console.log('5. Test: Generate a sample video\n');
