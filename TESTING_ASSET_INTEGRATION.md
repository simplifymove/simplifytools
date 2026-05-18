# 🎬 Asset Pipeline Integration - Testing & Debugging Guide

**Status**: ✅ Build passing | 🔧 Integration Complete | 🧪 Ready for Testing

---

## What Was Just Connected

The asset pipeline is now **fully integrated** into the video generation flow:

```
User Prompt
    ↓
/api/video/generate-script (Groq)
    ↓
enrichGeneratedScript() [NEW INTEGRATION]
    ├─ Calls enrichScenesForRendering()
    ├─ Fetches assets from Pexels/Pixabay/Unsplash
    ├─ Applies test cases (forest, elephant, tech)
    ├─ Caches assets locally
    └─ Logs all selections
    ↓
Script with selectedAsset + cinematicConfig
    ↓
Remotion renders VideoComposition
    ↓
SceneRenderer [UPDATED]
    ├─ Detects cinematic enrichment
    ├─ Uses CinematicScenePresets
    └─ CinematicBackground renders VIDEO/IMAGE
    ↓
Final video with REAL assets
```

---

## How to Test

### Test 1: Start Dev Server

```bash
npm run dev
```

Expected output:
```
✓ Ready on http://localhost:3000
✓ API routes compiled
✓ Remotion ready
```

---

### Test 2: Generate Script with Forest Keywords

**Method A: Direct API Call**

```bash
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a cinematic video about forest conservation and wildlife protection. Show pristine forest landscapes and animal habitats.",
    "style": "modern",
    "duration": 30,
    "aspectRatio": "16:9"
  }'
```

**Expected Console Output**:

```
█████████████████████████████████████████████████████████████████████████████████
🚀 ASSET ENRICHMENT PIPELINE - STARTING
█████████████████████████████████████████████████████████████████████████████████
Processing 3 scenes...

📥 Step 1: Enriching scenes with assets from Pexels/Pixabay/Unsplash...
✅ Asset enrichment complete

📥 Step 2: Applying test cases (forest, elephant, tech detection)...
🧪 TEST MODE: Forcing forest asset for forest keywords
✅ Test cases applied

📥 Step 3: Logging asset selection for each scene...

════════════════════════════════════════════════════════════════════════════════
📍 SCENE 1: Asset Selection Details
════════════════════════════════════════════════════════════════════════════════
📝 Scene Content:
   • Headline: Pristine Forests
   • Visual: Real forest landscape with ancient trees
   • Subtext: Earth's lungs, vital ecosystems

🔑 Visual Keywords: forest, nature, wildlife, ecosystem, conservation

✅ ASSET SELECTED:
   • URL: https://images.unsplash.com/photo-1441974231531-c6227db76b6e?...
   • Provider: test-unsplash
   • Type: image
   • Cached: ✗
════════════════════════════════════════════════════════════════████████████████

📊 ENRICHMENT SUMMARY
████████████████████████████████████████████████████████████████████████████████
✅ Scenes with real assets: 3/3
📋 Scenes using gradient fallback: 0/3
████████████████████████████████████████████████████████████████████████████████
```

**Check Response JSON**:
```bash
# The response should include selectedAsset in each scene
jq '.script.scenes[0]' response.json

# Should show:
{
  "headline": "Pristine Forests",
  "selectedAsset": {
    "url": "https://images.unsplash.com/photo-...",
    "provider": "test-unsplash",
    "type": "image",
    "cachedPath": null
  },
  "cinematicConfig": {
    "cameraMotion": "ken-burns-in",
    "zoomIntensity": 1.8,
    "vignetteEffect": {...},
    "particleEffect": {...}
  }
}
```

---

### Test 3: Render Video with Assets

**Send render request**:

```bash
curl -X POST http://localhost:3000/api/video/render \
  -H "Content-Type: application/json" \
  -d '{
    "script": {
      "title": "Forest Conservation",
      "duration": 30,
      "style": "modern",
      "aspectRatio": "16:9",
      "scenes": [...copy from generated script...],
      ...
    }
  }'
```

**Expected Console Output During Render**:

```
🎬 SCENE RENDERER - RENDERING SCENE
════════════════════════════════════════════════════════════════════════════════
📋 Full Scene Props:
{
  "headline": "Pristine Forests",
  "selectedAsset": {
    "url": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e...",
    "provider": "test-unsplash",
    "type": "image"
  },
  "cinematicConfig": {
    "cameraMotion": "ken-burns-in",
    "zoomIntensity": 1.8
  }
}
════════════════════════════════════════════════════════════════════════════════

✨ Using CINEMATIC PRESET system for: Pristine Forests

🎬 RENDERING ASSET: {
  "headline": "Asset background",
  "type": "image",
  "url": "https://images.unsplash.com/...",
  "provider": "test-unsplash",
  "cached": false
}
```

---

### Test 4: Verify Video Output

**Check for asset label in corner**:
1. Open generated MP4 in video player
2. Look at **bottom right corner**
3. Should see green label: **✓ Asset: test-unsplash** (or provider name)
4. Should show **📁 Cached** or **🌐 Live**

**If you see orange warning**:
```
⚠️ No Asset - Gradient
```
This means the asset pipeline didn't work - debug needed.

---

## Debug Checklist

### ✅ API Keys Configured?
```bash
grep -E "PEXELS|PIXABAY" .env.local
```

Expected:
```
PEXELS_API_KEY=qiUDKXMx...
PIXABAY_API_KEY=44220032-...
```

### ✅ Asset Fetcher Created?
```bash
ls -la app/utils/remotion/AssetFetcher.ts
```

### ✅ Script Enrichment Created?
```bash
ls -la app/utils/video-generation/script-enrichment.ts
```

### ✅ SceneRenderer Updated?
```bash
grep -n "hasCinematicEnrichment" app/utils/remotion/SceneRenderer.tsx
```

Should find multiple matches showing the new logic.

### ✅ Generate-script Route Updated?
```bash
grep -n "enrichGeneratedScript" app/api/video/generate-script/route.ts
```

Should find imports and calls.

### ✅ CinematicBackground Uses Remotion Components?
```bash
grep -n "import.*Video.*Img" app/utils/remotion/CinematicBackground.tsx
```

Should find the Remotion imports.

### ✅ Console Logging Present?
```bash
grep -c "console.log" app/utils/remotion/AssetFetcher.ts
```

Should be > 20 log statements.

---

## Common Issues & Fixes

### Issue 1: "No asset - Using gradient fallback"

**Symptom**: Video renders but shows orange "No Asset - Gradient" label

**Diagnosis**:
```bash
# Check if assets are being fetched
grep "✅ ASSET SELECTED" [dev-server-logs]
```

**Fixes**:
1. **Check API keys**:
   ```bash
   echo "PEXELS=$PEXELS_API_KEY"
   echo "PIXABAY=$PIXABAY_API_KEY"
   ```

2. **Check enrichment is running**:
   ```bash
   grep "🚀 ASSET ENRICHMENT PIPELINE" [logs]
   ```

3. **Check test cases work**:
   ```bash
   grep "🧪 TEST MODE" [logs]
   ```

4. **Increase logging**:
   - Add `console.log()` in AssetFetcher at line 100+

### Issue 2: "Asset selected but not rendering"

**Symptom**: Logs show "✅ ASSET SELECTED" but video still has gradient

**Diagnosis**:
```bash
grep "🎬 RENDERING ASSET" [logs]
```

**Fixes**:
1. **Check CinematicBackground is used**:
   ```bash
   grep "✨ Using CINEMATIC PRESET" [logs]
   ```

2. **Check Remotion Video/Image elements**:
   ```bash
   grep "Video src=" [page-source]
   # Or check Network tab in DevTools
   ```

3. **Check scene props passed correctly**:
   ```bash
   grep "cinematicConfig" [logs]
   ```

### Issue 3: "Asset URL shows but video doesn't load"

**Symptom**: Asset label shows provider name, but video is blank

**Possible causes**:
- CORS issue with Unsplash/Pixabay
- Asset URL format incompatible with Remotion
- Network timeout

**Fixes**:
1. **Check DevTools Network tab**:
   - Look for asset image/video requests
   - Check status codes and headers

2. **Try direct URL access**:
   ```bash
   curl -I "https://images.unsplash.com/photo-..."
   ```

3. **Check Remotion Video/Img props**:
   - Both should use `src` prop
   - Check `objectFit: 'cover'` is set

---

## Verification Steps

### Step 1: Confirm enrichment is happening
```bash
npm run dev 2>&1 | grep "ASSET ENRICHMENT PIPELINE"
```

### Step 2: Confirm test cases are working
```bash
curl ... -d '{"prompt":"Create a video about forest"}' | jq '.script.scenes[0].selectedAsset'
# Should NOT be null
```

### Step 3: Confirm rendering uses assets
```bash
npm run dev 2>&1 | grep "RENDERING ASSET"
# Should appear when rendering
```

### Step 4: Check video corner label
- Render video
- Open in player
- Bottom right should have **colored label**
- Green = Asset working
- Orange = Fallback (asset pipeline failed)

---

## Expected Behavior by Test Case

### Forest Prompt
```
Input: "Create a video about forest conservation"
↓
Asset: Forest photo from Unsplash/Pixabay
Preset: CinematicNatureScene
Camera: Ken Burns zoom
Particles: Light rays
Expected: Beautiful forest with zoom effect
```

### Elephant Prompt
```
Input: "Show elephants and wildlife"
↓
Asset: Elephant photo from Unsplash/Pixabay
Preset: CinematicNatureScene
Camera: Slow pan left
Particles: Fog
Expected: Elephant with cinematic pan
```

### Tech Prompt
```
Input: "Create a video about AI technology"
↓
Asset: Tech mockup/illustration
Preset: CinematicTechScene
Camera: Drift
Particles: Stars
Expected: Tech visuals with floating effect
```

---

## Debug Logging Reference

All logging statements are prefixed for easy grep:

```bash
# Find asset selection logs
grep "✅ ASSET SELECTED" [logs]
grep "❌ NO ASSET SELECTED" [logs]

# Find rendering logs
grep "🎬 RENDERING ASSET" [logs]
grep "⚠️ NO ASSET - USING GRADIENT" [logs]

# Find enrichment pipeline logs
grep "█.*ASSET ENRICHMENT" [logs]
grep "📊 ENRICHMENT SUMMARY" [logs]

# Find test mode activation
grep "🧪 TEST MODE" [logs]

# Find scene renderer logs
grep "✨ Using CINEMATIC PRESET" [logs]
grep "⚠️ Using LEGACY PRESET" [logs]
```

---

## Next Steps If Everything Works

1. ✅ Test with various prompts (not just forest/elephant)
2. ✅ Test different moods and scene types
3. ✅ Check cache is working (second render should show "Cached" label)
4. ✅ Verify video quality and duration
5. ✅ Share videos to check social media compatibility

---

**Ready to test? Start with**:

```bash
npm run dev
# Then in another terminal:
node test-asset-providers.mjs
```

Then make a test video call and watch the console logs!
