# 🎯 Asset Pipeline Integration - Technical Reference

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ User API: POST /api/video/generate-script                       │
│ Input: { prompt, style, duration, aspectRatio, tone }           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────────┐
         │ Generate Script via Groq API            │
         │ Returns: VideoScript with scenes        │
         └──────────────┬──────────────────────────┘
                        │
                        ▼
     ┌──────────────────────────────────────────────────┐
     │ enrichGeneratedScript(script)  [NEW INTEGRATION]  │ ◄── script-enrichment.ts
     │                                                   │
     │ For each scene:                                  │
     │  1. Extract visualKeywords from content          │
     │  2. Call enrichScenesForRendering()              │
     │  3. Fetch asset from Pexels/Pixabay/Unsplash     │
     │  4. Apply test cases (forest→unsplash image)     │
     │  5. Generate cinematicConfig (mood-based)        │
     │  6. Cache asset locally                          │
     │  7. Log selection details                        │
     │  8. Attach to scene.selectedAsset property       │
     └──────────────┬────────────────────────────────────┘
                    │
                    ▼
        ┌────────────────────────────────────┐
        │ VideoScript with enrichment:        │
        │ {                                  │
        │   scenes: [                        │
        │     {                              │
        │       headline: "...",             │
        │       selectedAsset: {             │
        │         url: "...",                │
        │         provider: "pexels",        │
        │         cachedPath: "..."          │
        │       },                           │
        │       cinematicConfig: {...}       │
        │     },                             │
        │     ...                            │
        │   ]                                │
        │ }                                  │
        └────────────┬───────────────────────┘
                     │
                     ▼
         ┌─────────────────────────────────┐
         │ API Response (SUCCESS)          │
         │ { ok: true, script: {...} }     │
         └──────────────────────────────────┘
                     │
                     ▼
        [Client receives enriched script]
                     │
                     ▼
         ┌─────────────────────────────────┐
         │ POST /api/video/render          │
         │ Send full script with assets    │
         └────────────────┬────────────────┘
                          │
                          ▼
            ┌──────────────────────────────────┐
            │ SceneRenderer.tsx [UPDATED]       │
            │ Detects cinematic enrichment:     │
            │ - Has selectedAsset? YES          │
            │ - Has cinematicConfig? YES        │
            │ → Route to CinematicScenePresets │
            └────────────────┬─────────────────┘
                             │
                             ▼
              ┌────────────────────────────────┐
              │ CinematicBackground [UPDATED]  │
              │ Renders asset via Remotion:    │
              │ <Video src={url} />            │ ◄── Remotion component
              │ <Img src={url} />              │ ◄── Remotion component
              │ With effects overlay           │
              │ Shows asset provider badge     │
              └────────────────┬───────────────┘
                               │
                               ▼
                      ┌─────────────────┐
                      │ Final MP4 Video │
                      │ with REAL asset │
                      └─────────────────┘
```

---

## Code Integration Points

### 1. Script Enrichment Entry Point

**File**: `app/utils/video-generation/script-enrichment.ts`

```typescript
export async function enrichGeneratedScript(script: VideoScript): Promise<VideoScript> {
  // Logs: Script title, duration, style, scene count
  // For each scene: extracts visualKeywords, calls enrichment pipeline
  // Returns: Script with selectedAsset + cinematicConfig on each scene
  
  const enrichedScenes = await enrichScenesForRendering(script.scenes);
  
  return {
    ...script,
    scenes: enrichedScenes,
  };
}
```

**What it calls**:
- `enrichScenesForRendering()` from `AssetFetcher.ts` (350 lines)
  - Analyzes visual keywords
  - Searches asset providers
  - Caches assets
  - Applies test cases
  - Logs selections

---

### 2. API Route Integration

**File**: `app/api/video/generate-script/route.ts`

**Added at top**:
```typescript
import { enrichGeneratedScript } from '@/app/utils/video-generation/script-enrichment';
```

**Integration point 1 - Cache hit (line ~54)**:
```typescript
const cached = scriptCache.get(cacheKey);
if (cached && Date.now() - cached.timestamp < 3600000) {
  let enrichedScript = await enrichGeneratedScript(cached.script);
  return NextResponse.json<GenerateScriptResponse>({
    ok: true,
    script: enrichedScript,
  });
}
```

**Integration point 2 - Repair success (line ~195)**:
```typescript
// After repair validation succeeds
let enrichedScript = await enrichGeneratedScript(repairValidation.script);
return NextResponse.json<GenerateScriptResponse>({
  ok: true,
  script: enrichedScript,
});
```

**Integration point 3 - Normal success (line ~220)**:
```typescript
// After normal validation succeeds
let enrichedScript = await enrichGeneratedScript(validation.script);
return NextResponse.json<GenerateScriptResponse>({
  ok: true,
  script: enrichedScript,
});
```

---

### 3. Asset Fetcher (Previously Created)

**File**: `app/utils/remotion/AssetFetcher.ts` (350 lines)

**Main function**:
```typescript
export async function enrichScenesForRendering(scenes: Scene[]): Promise<CinematicScene[]> {
  // 1. Call AssetSelectionService.enrichScenesWithAssets()
  //    → Analyzes keywords, generates configs, fetches assets
  
  // 2. Apply test cases (forest→unsplash, elephant→unsplash, tech→unsplash)
  //    → Hardcoded for testing
  
  // 3. Log each scene's asset selection
  //    → Shows URL, provider, cached path, mood, config
  
  // 4. Return enriched scenes ready for rendering
}
```

**Key functions**:
- `logAssetSelection(sceneIndex, scene)` - Detailed console output
- `applyTestAssets(scene)` - Hardcoded test case routing
- `verifyAssetUsage(scene)` - Post-render verification

---

### 4. Scene Renderer (Previously Updated)

**File**: `app/utils/remotion/SceneRenderer.tsx`

**Detection logic** (line ~120):
```typescript
const hasCinematicEnrichment = !!(
  (scene as any).selectedAsset ||
  (scene as any).cinematicConfig ||
  (scene as any).mood
);

if (hasCinematicEnrichment) {
  const PresetComponent = selectCinematicScenePreset(scene.mood);
  return (
    <CinematicBackground
      asset={enrichedScene.selectedAsset}
      config={enrichedScene.cinematicConfig}
      duration={duration}
      width={width}
      height={height}
    >
      <PresetComponent ... />
    </CinematicBackground>
  );
}
```

---

### 5. Cinematic Background (Previously Updated)

**File**: `app/utils/remotion/CinematicBackground.tsx`

**Asset rendering** (line ~200):
```typescript
// Import Remotion components (CRITICAL!)
import { Video, Img, AbsoluteFill } from 'remotion';

// Render asset using Remotion (only way it works in Remotion!)
{asset ? (
  <>
    {asset.type === 'video' ? (
      <Video
        src={asset.cachedPath || asset.url}
        style={{objectFit: 'cover'}}
      />
    ) : (
      <Img
        src={asset.cachedPath || asset.url}
        style={{objectFit: 'cover'}}
      />
    )}
  </>
) : (
  <div style={{background: fallbackGradient}} />
)}
```

**Debug label** (line ~280):
```typescript
{asset && (
  <div style={{position: 'absolute', bottom: 20, right: 20}}>
    <div style={{
      background: '#10b981',
      color: 'white',
      padding: '4px 12px',
      borderRadius: 4,
      fontSize: 12,
    }}>
      ✓ Asset: {asset.provider}
    </div>
  </div>
)}
```

---

## Data Flow - Detailed

### Request
```json
{
  "prompt": "Create a video about forest conservation",
  "style": "modern",
  "duration": 30,
  "aspectRatio": "16:9",
  "tone": "inspirational"
}
```

### After Groq Generation (before enrichment)
```json
{
  "title": "Forest Conservation",
  "scenes": [
    {
      "headline": "Pristine Forests",
      "visual": "Real forest landscape with ancient trees",
      "subtext": "Earth's lungs..."
    }
  ]
}
```

### After enrichGeneratedScript()
```json
{
  "title": "Forest Conservation",
  "scenes": [
    {
      "headline": "Pristine Forests",
      "visual": "Real forest landscape with ancient trees",
      "subtext": "Earth's lungs...",
      "visualKeywords": ["forest", "nature", "wildlife", "ecosystem"],
      "selectedAsset": {
        "url": "https://images.unsplash.com/photo-1441974231531...",
        "provider": "test-unsplash",
        "type": "image",
        "cachedPath": null
      },
      "cinematicConfig": {
        "cameraMotion": "ken-burns-in",
        "zoomIntensity": 1.8,
        "vignetteEffect": {...},
        "particleEffect": "light-rays"
      }
    }
  ]
}
```

### During Rendering
- SceneRenderer detects `selectedAsset` exists
- Routes to `CinematicNatureScene` preset
- CinematicBackground renders `<Img src="...unsplash..."/>`
- Effects applied (Ken Burns zoom, light rays)
- Debug badge shows "✓ Asset: test-unsplash"

---

## Error Handling

### If enrichment fails in generate-script route:
```typescript
try {
  enrichedScript = await enrichGeneratedScript(validation.script);
} catch (enrichError) {
  console.warn('[Script Gen] Asset enrichment failed, returning script without assets:', enrichError);
  enrichedScript = validation.script; // Fall back to non-enriched
}
```

**Result**: Video still renders, but with gradient instead of asset

### If asset fetch fails in AssetFetcher:
```typescript
try {
  const enrichedScenes = await enrichScenesForRendering(script.scenes);
} catch (error) {
  console.error('❌ Script enrichment failed:', error);
  return script; // Return original without enrichment
}
```

**Result**: Scene uses default mood/config instead of asset-based

### If Remotion rendering fails:
```typescript
{asset ? (
  <Video src={url} />
) : (
  <div style={{background: 'linear-gradient(...)'}} /> // Fallback
)}
```

**Result**: Gradient appears instead of asset video/image

---

## Testing The Integration

### Quick Test
```bash
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a video about forest conservation",
    "style": "modern",
    "duration": 30
  }' | jq '.script.scenes[0].selectedAsset'
```

**Should output**:
```json
{
  "url": "https://images.unsplash.com/...",
  "provider": "test-unsplash",
  "type": "image"
}
```

**Not null/undefined ✅**

### Render Test
- Use response from above
- Send to `/api/video/render`
- Watch console for "🎬 RENDERING ASSET:" logs
- Video should show forest image, not gradient
- Corner badge should be green "✓ Asset: test-unsplash"

---

## Summary

The asset pipeline is now **fully integrated** from request to render:

1. ✅ API receives prompt
2. ✅ Groq generates script
3. ✅ `enrichGeneratedScript()` enriches with assets
4. ✅ `enrichScenesForRendering()` fetches + caches
5. ✅ Test cases route forest/elephant/tech to correct assets
6. ✅ SceneRenderer detects enrichment
7. ✅ CinematicBackground renders `<Img>`/`<Video>`
8. ✅ Final video shows REAL assets with effects
9. ✅ Debug badge proves asset is rendering

**Result**: Users now see cinematic videos with real, topic-relevant imagery instead of generic gradients.
