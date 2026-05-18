# 🎬 Cinematic Asset System - Integration Checklist

**Status**: ✅ Infrastructure Complete | ⏳ Integration Phase Ready

**API Keys**: ✅ Configured (Pexels + Pixabay)

---

## 📋 Integration Tasks

### Task 1: Update API Route for Enhanced Groq Prompt

**File**: `app/api/video/script/route.ts`

**What to Change**:
```typescript
// BEFORE - Using basic prompt
import { buildGroqPrompt } from '@/app/utils/video-generation/groq-prompt';

// AFTER - Using cinematic prompt
import { buildCinematicGroqPrompt, validateCinematicVideoScript, enrichScriptWithVisualDefaults } from '@/app/utils/video-generation/cinematic-groq-prompt';
```

**Implementation**:
1. Replace `buildGroqPrompt()` with `buildCinematicGroqPrompt()`
2. Replace `validateVideoScript()` with `validateCinematicVideoScript()`
3. Add call to `enrichScriptWithVisualDefaults()` after parsing Groq response
4. Wrap scene enrichment in try-catch for graceful fallback

**Code Example**:
```typescript
const prompt = buildCinematicGroqPrompt(request);
const response = await groqClient.messages.create({ /* ... */ });
const parsed = repairCinematicGroqResponse(response.content[0].text);
const script = JSON.parse(parsed);

if (!validateCinematicVideoScript(script)) {
  throw new Error('Invalid video script');
}

// Enrich with visual defaults
const enrichedScript = enrichScriptWithVisualDefaults(script);

// Enrich scenes with assets
try {
  const { enrichScenesWithAssets } = await import('@/app/utils/remotion/AssetSelectionService');
  enrichedScript.scenes = await enrichScenesWithAssets(enrichedScript.scenes);
} catch (error) {
  console.warn('Asset enrichment failed, using fallback:', error);
  // System still works with gradients if assets fail
}

return Response.json(enrichedScript);
```

**Time Estimate**: 15 minutes

---

### Task 2: Update SceneRenderer Integration

**File**: `app/utils/remotion/SceneRenderer.tsx`

**What to Change**:
```typescript
// BEFORE - Using generic scene detection
import { getDefaultLayout } from '@/app/utils/remotion/defaultLayouts';

// AFTER - Using cinematic presets
import { selectCinematicScenePreset } from '@/app/utils/remotion/CinematicScenePresets';
```

**Implementation**:
1. Import `selectCinematicScenePreset` from CinematicScenePresets
2. Replace `getDefaultLayout()` calls with preset selection based on `scene.mood`
3. Pass enriched scene (with `selectedAsset` and `cinematicConfig`) to preset
4. Ensure scene spreads all properties to preset component

**Code Example**:
```typescript
function SceneRenderer(props: SceneRendererProps) {
  const { scene, sceneStartFrame, duration, style } = props;
  
  // Select cinematic preset based on mood
  const PresetComponent = selectCinematicScenePreset(scene.mood);
  
  // Pass enriched scene to preset
  return (
    <PresetComponent 
      scene={scene}
      sceneStartFrame={sceneStartFrame}
      duration={duration}
      style={style}
    />
  );
}
```

**Time Estimate**: 10 minutes

---

### Task 3: Initialize Asset Providers in Middleware

**File**: `app/middleware.ts` or new `lib/init-providers.ts`

**What to Change**:
- Add provider initialization on startup

**Implementation Option A - Middleware**:
```typescript
import { assetProviders } from '@/app/utils/remotion/AssetProviders';

export async function middleware(request: NextRequest) {
  // Initialize providers on first request
  if (!global.providersInitialized) {
    try {
      await assetProviders.initialize();
      global.providersInitialized = true;
      console.log('✅ Asset providers initialized');
    } catch (error) {
      console.error('Failed to initialize providers:', error);
    }
  }
  
  return NextResponse.next();
}
```

**Implementation Option B - API Route**:
```typescript
// app/api/init/providers/route.ts
import { assetProviders } from '@/app/utils/remotion/AssetProviders';

export async function GET() {
  try {
    await assetProviders.initialize();
    return Response.json({ status: 'Providers initialized' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

**Call before dev server start**:
```bash
curl http://localhost:3000/api/init/providers
```

**Time Estimate**: 10 minutes

---

### Task 4: Add Environment Variable Validation

**File**: `app/utils/config/assets.ts` (NEW)

**What to Do**:
Create config file to centralize asset provider settings

```typescript
// app/utils/config/assets.ts
export const assetConfig = {
  providers: {
    pexels: {
      enabled: !!process.env.PEXELS_API_KEY,
      key: process.env.PEXELS_API_KEY,
    },
    pixabay: {
      enabled: !!process.env.PIXABAY_API_KEY,
      key: process.env.PIXABAY_API_KEY,
    },
    unsplash: {
      enabled: !!process.env.UNSPLASH_API_KEY,
      key: process.env.UNSPLASH_API_KEY,
    },
    undraw: {
      enabled: true, // No API key needed
    },
  },
  cache: {
    directory: '.asset-cache',
    ttlDays: 7,
  },
};
```

**Time Estimate**: 5 minutes

---

### Task 5: Create Provider Initialization Script

**File**: `scripts/init-cinematic-providers.ts` (NEW)

```typescript
import { assetProviders } from '../app/utils/remotion/AssetProviders';

async function main() {
  console.log('🎬 Initializing cinematic asset providers...\n');
  
  try {
    await assetProviders.initialize();
    
    const stats = assetProviders.getAvailableProviders();
    console.log('\n✅ Provider Status:');
    console.log(stats);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  }
}

main();
```

**Add to package.json**:
```json
{
  "scripts": {
    "init:providers": "ts-node scripts/init-cinematic-providers.ts"
  }
}
```

**Time Estimate**: 5 minutes

---

### Task 6: End-to-End Testing

**Test 1 - Asset Provider Connection**:
```bash
node test-asset-providers.mjs
```

**Expected Output**:
```
✅ Pexels API: Connected successfully
✅ Pixabay API: Connected successfully
✅ unDraw API: Connected successfully
```

**Test 2 - Generate Sample Video**:
```typescript
const request = {
  prompt: 'Create a cinematic video about mountain landscapes and adventure',
  aspectRatio: '16:9',
  duration: 30,
  style: 'modern',
  voiceoverText: 'Explore the beauty of nature',
};

const response = await fetch('/api/video/script', {
  method: 'POST',
  body: JSON.stringify(request),
});

const script = await response.json();
console.log('Script scenes:', script.scenes);
console.log('First scene asset:', script.scenes[0].selectedAsset);
console.log('First scene mood:', script.scenes[0].mood);
```

**Expected Results**:
- ✅ Script returns with visual metadata
- ✅ Scenes have `selectedAsset` field (not null)
- ✅ Scenes have `mood` and `cameraMotion`
- ✅ Scenes have `cinematicConfig` with effects

**Test 3 - Verify Cache**:
```bash
ls -la .asset-cache/
cat .asset-cache/index.json
```

**Expected Output**:
```
.asset-cache/
├── index.json (metadata file)
├── pexels-video-*.mp4
├── pixabay-image-*.jpg
└── unsplash-photo-*.jpg
```

**Time Estimate**: 30 minutes

---

## 📊 Integration Order

1. **First**: Task 3 - Initialize providers (blocking everything)
2. **Second**: Task 1 - Update API route (enables asset fetching)
3. **Third**: Task 2 - Update SceneRenderer (enables visual rendering)
4. **Fourth**: Task 4 - Add validation (optional but recommended)
5. **Fifth**: Task 5 - Create init script (optional but helpful)
6. **Sixth**: Task 6 - Run end-to-end tests (verify everything works)

---

## 🚀 Quick Start (30 minutes)

```bash
# 1. Verify API keys are configured
cat .env.local | grep -E "PEXELS|PIXABAY"

# 2. Test providers
node test-asset-providers.mjs

# 3. Update /api/video/script route (15 min)
# → Replace buildGroqPrompt with buildCinematicGroqPrompt
# → Add scene enrichment

# 4. Update SceneRenderer (10 min)
# → Import selectCinematicScenePreset
# → Use scene.mood to select template

# 5. Run dev server
npm run dev

# 6. Test video generation
curl -X POST http://localhost:3000/api/video/script \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create a cinematic video about nature"}'
```

---

## ✅ Success Criteria

After integration, these should be true:

- ✅ `npm run dev` starts without errors
- ✅ API returns scripts with visual metadata
- ✅ Asset cache is populated with real videos/images
- ✅ Generated videos use real background assets (not gradients)
- ✅ Cinematic effects are visible (zoom, pan, particles)
- ✅ Scene templates match mood (corporate = left-aligned, tech = gradient)
- ✅ Fallback works if asset download fails
- ✅ Videos are social-media shareable

---

## 📚 Reference Files

- **Types**: `app/utils/types/cinematic-assets.ts`
- **Providers**: `app/utils/remotion/AssetProviders.ts`
- **Cache**: `app/utils/remotion/AssetCacheManager.ts`
- **Selection**: `app/utils/remotion/AssetSelectionService.ts`
- **Background**: `app/utils/remotion/CinematicBackground.tsx`
- **Presets**: `app/utils/remotion/CinematicScenePresets.tsx`
- **Groq Prompt**: `app/utils/video-generation/cinematic-groq-prompt.ts`

---

## 🆘 Troubleshooting

**Problem**: "API key validation failed"
- **Solution**: Verify .env.local has correct keys without extra spaces

**Problem**: "Asset download failed"
- **Solution**: Check cache directory `.asset-cache/` has write permissions

**Problem**: "Scene preset not found"
- **Solution**: Ensure `scene.mood` is one of: cinematic, corporate, playful, minimal, energetic, serene, futuristic, nature, urban

**Problem**: "Build fails with type errors"
- **Solution**: Run `npm run build` to check for issues, ensure all imports are correct

---

## 📈 Performance Tips

1. **Cache Warming**: Pre-download common assets during deployment
2. **Provider Priority**: Order providers by speed (Pixabay > Pexels > Unsplash)
3. **Batch Requests**: Use `enrichScenesWithAssets()` with Promise.all() for parallel fetching
4. **TTL Strategy**: Keep 7-day default, increase for production if storage permits

---

**Total Integration Time**: ~1.5 hours for full end-to-end
**Estimated Video Generation Improvement**: 300-500% (real assets vs gradients)

🎬 **Ready to start integration? Pick Task 3 first!**
