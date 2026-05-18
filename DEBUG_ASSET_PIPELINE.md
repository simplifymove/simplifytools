# 🔴 CRITICAL DEBUG: Asset Pipeline Verification

**Status**: Build PASSING | Debug Components ACTIVE | Ready for Live Testing

---

## What Just Changed (Critical)

### 🚨 Debug Mode Activated

Four new critical components added specifically to diagnose why assets aren't rendering:

1. **AssetDebugOverlay.tsx** - Renders visible proof in the video itself
   - Shows asset URL, provider, type in top-left corner
   - Shows bright green badge "✓ Asset:" when asset exists
   - Shows BRIGHT RED error screen when NO asset found
   - Impossible to miss whether assets are working

2. **CinematicBackgroundDebug.tsx** - Completely rewritten
   - REMOVES all gradient fallbacks  
   - Only renders actual Video/Img Remotion components
   - Shows RED error screen if asset missing
   - Logs every render to console with full details
   - Uses new AssetDebugOverlay component

3. **SceneRenderer.tsx** - UPDATED
   - Imports debug version of CinematicBackground
   - Passes debug props (keywords, mood, assetSelected)
   - Logs asset details before rendering
   - Prints full scene props JSON to console

4. **render/route.ts** - ENHANCED
   - Added PRE-RENDER SCENE AUDIT
   - Lists all scenes and their assets
   - Verifies which scenes have selectedAsset
   - Prints summary: "X/Y scenes have assets"

---

## 🎯 Step-by-Step Debugging

### Step 1: Clean Everything

```bash
node cleanup-debug.js
```

This deletes:
- `.remotion/` (Remotion cache - might have stale bundles)
- `.asset-cache/` (Asset cache - old assets)
- `public/videos/` (Old generated videos)
- `.next/` (Next.js build cache)

Then recreates empty directories for fresh start.

---

### Step 2: Rebuild

```bash
npm run build
```

**Expected output**:
```
✓ 1250+ files compiled
✓ 198 prerendered pages
✓ 0 TypeScript errors
✓ Build completed in 9.9s
```

---

### Step 3: Start Dev Server

```bash
npm run dev
```

**Expected output**:
```
✓ ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

### Step 4: Generate Script with Forest Keywords

**In a SECOND terminal** (keep dev server running):

```bash
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a cinematic video about dense forest ecosystems and forest conservation with beautiful wildlife scenes",
    "style": "modern",
    "duration": 30,
    "aspectRatio": "16:9"
  }' > /tmp/script.json
```

**Watch console in first terminal for**:

```
████████████████████████████████████████████████████████████████
🚀 ASSET ENRICHMENT PIPELINE - STARTING
████████████████████████████████████████████████████████████████
Processing 3 scenes...
✅ Asset enrichment complete
📊 ENRICHMENT SUMMARY
✅ Scenes with real assets: 3/3
████████████████████████████████████████████████████████████████
```

If you don't see this, the enrichment pipeline itself failed.

---

### Step 5: Check Response Contains Assets

```bash
cat /tmp/script.json | jq '.script.scenes[0].selectedAsset'
```

**MUST output**:
```json
{
  "url": "https://...",
  "provider": "test-unsplash",
  "type": "image",
  "cachedPath": null
}
```

**NOT null, empty, or undefined.**

If empty, asset enrichment didn't work.

---

### Step 6: Render Video

```bash
curl -X POST http://localhost:3000/api/video/render \
  -H "Content-Type: application/json" \
  -d @/tmp/script.json > /tmp/render-response.json

jq '.generationId' /tmp/render-response.json
```

This returns a job ID. Now watch the console for the PRE-RENDER AUDIT:

```
█████████████████████████████████████████████████████████████████████████████████
🎥 PRE-RENDER SCENE AUDIT: [Script Title]
█████████████████████████████████████████████████████████████████████████████████

📍 SCENE 1:
   Headline: Dense Forests
   Visual: Real forest ecosystem with towering trees...
   Keywords: forest, nature, ecosystem, conservation, wildlife
   Mood: cinematic
   Has Asset: true
   ✅ Asset URL: https://images.unsplash.com/photo-...
   ✅ Provider: test-unsplash
   ✅ Type: image
   ✅ Cached: NO

📍 SCENE 2:
   Headline: Forest Wildlife
   ...
   Has Asset: true
   ✅ Asset URL: ...

📊 SUMMARY: 3/3 scenes have assets
█████████████████████████████████████████████████████████████████████████████████
```

**CRITICAL**: This must show "Has Asset: true" for all scenes.

If it shows "Has Asset: false", the asset pipeline failed between generate-script and render.

---

### Step 7: Get Render Status

```bash
# Poll render status (replace JOBID with actual ID from step 6)
curl http://localhost:3000/api/video/render/status?jobId=JOBID
```

**Wait until**:
```json
{
  "status": "completed",
  "progress": 100,
  "videoUrl": "data:video/mp4;base64,..."
}
```

---

### Step 8: Download and Check Video

```bash
# Save base64 video to file
curl -s http://localhost:3000/api/video/render/JOBID | \
  jq -r '.videoUrl' | \
  sed 's/data:video\/mp4;base64,//' | \
  base64 -d > /tmp/output.mp4

# Open in video player (or copy to browser if you have ffplay)
ffplay /tmp/output.mp4   # or vlc /tmp/output.mp4
```

---

## 🔍 What to Look For in the Video

### ✅ CORRECT (Asset Working)

- **Background is a real forest image**, not solid color
- **Top-left corner**: Black box with asset info
  ```
  🎬 DEBUG INFO
  ✓ ASSET FOUND
  Provider: test-unsplash
  Type: image
  URL: https://images.unsplash.com/...
  Keywords: forest, nature, wildlife, ecosystem
  Mood: cinematic
  ```
- **Bottom-right corner**: Green badge `✓ Asset: test-unsplash`
- **Frame counter**: Top-left shows "Frame: 0 / FPS: 30"
- **Text content**: Scene headlines and descriptions (rendered on top)

### ❌ WRONG (Asset NOT Working)

- **Background is RED ERROR SCREEN** - this means selectedAsset is null in CinematicBackgroundDebug
- **OR background is solid color/gradient** - means asset rendering failed
- **No debug info** - component didn't mount
- **Bottom-right shows orange**: `⚠️ No Asset - Gradient` (old component still being used)

---

## 📋 Debugging Checklist

### Scenario 1: Script doesn't have assets

**Symptom**: `jq '.script.scenes[0].selectedAsset'` returns null

**Diagnosis**:
```bash
# Check if enrichment ran
npm run dev 2>&1 | grep "ASSET ENRICHMENT"

# Check enrichment logs
npm run dev 2>&1 | grep "✅ ASSET SELECTED"
npm run dev 2>&1 | grep "❌ NO ASSET SELECTED"
```

**Fix**:
1. Verify API keys in `.env.local`:
   ```bash
   grep PEXELS_API_KEY .env.local
   grep PIXABAY_API_KEY .env.local
   ```
2. Check AssetFetcher.ts exists:
   ```bash
   ls app/utils/remotion/AssetFetcher.ts
   ```
3. Check script-enrichment.ts exists:
   ```bash
   ls app/utils/video-generation/script-enrichment.ts
   ```
4. Verify generate-script route calls enrichment:
   ```bash
   grep "enrichGeneratedScript" app/api/video/generate-script/route.ts
   ```

---

### Scenario 2: Script has assets but video shows RED screen

**Symptom**: Render shows red "❌ NO ASSET" screen in video

**Diagnosis**:
```bash
# Check if assets made it to render request
npm run dev 2>&1 | grep "PRE-RENDER SCENE AUDIT"
npm run dev 2>&1 | grep "Has Asset:"
```

**Meaning**: selectedAsset was in script response, but didn't make it to render request.

**Fix**:
1. Verify client is sending full script to render endpoint
2. Check render route receives scenes:
   ```bash
   npm run dev 2>&1 | grep "Scenes:" app/api/video/render
   ```

---

### Scenario 3: Script has assets, render logs show assets, but video is gradient

**Symptom**: 
- PRE-RENDER AUDIT shows "3/3 scenes have assets" ✓
- Video plays but background is gradient/solid color

**Diagnosis**: CinematicBackground component is being used instead of CinematicBackgroundDebug, OR Remotion components aren't rendering media.

**Fix**:
1. Force Remotion to log rendering:
   ```bash
   npm run dev 2>&1 | grep "RENDERING ASSET"
   npm run dev 2>&1 | grep "<Video src=" 
   ```

2. Check if old CinematicBackground is still imported:
   ```bash
   grep "import.*CinematicBackground" app/utils/remotion/SceneRenderer.tsx
   # Should show: CinematicBackgroundDebug
   ```

3. Verify Video/Img components are used:
   ```bash
   grep "import.*Video.*Img" app/utils/remotion/CinematicBackgroundDebug.tsx
   grep "<Video" app/utils/remotion/CinematicBackgroundDebug.tsx
   grep "<Img" app/utils/remotion/CinematicBackgroundDebug.tsx
   ```

---

## 📊 Console Log Reference

### If Everything Works

```
█████████████████████████████████████████████
🚀 ASSET ENRICHMENT PIPELINE - STARTING
█████████████████████████████████████████████

📥 Step 1: Enriching scenes...
✅ Asset enrichment complete

🎬 SCENE RENDERER - RENDERING SCENE
✨ Using CINEMATIC PRESET system
📦 Asset details:
   hasAsset: true
   assetUrl: https://images.unsplash.com/...
   assetProvider: test-unsplash

📹 CinematicBackgroundDebug RENDER:
   frame: 0
   hasAsset: true
   assetProvider: test-unsplash

✅ RENDERING ASSET
   url: https://images.unsplash.com/...
   provider: test-unsplash
   type: image

█████████████████████████████████████████████
🎥 PRE-RENDER SCENE AUDIT
█████████████████████████████████████████████
📍 SCENE 1:
   Has Asset: true
   ✅ Asset URL: ...
   ✅ Provider: test-unsplash

📊 SUMMARY: 3/3 scenes have assets
█████████████████████████████████████████████
```

---

## 🚀 If It Works

1. ✅ Video shows real forest image
2. ✅ Debug info in corner
3. ✅ Green asset badge visible
4. ✅ Console shows all logs above
5. ✅ Frame counter animates 0→750 frames

**THEN**: Asset pipeline is working! 🎉

---

## 🆘 Still Not Working?

1. **Delete ALL caches again**:
   ```bash
   node cleanup-debug.js
   npm run build
   ```

2. **Check the actual files exist**:
   ```bash
   ls -la app/utils/remotion/AssetDebugOverlay.tsx
   ls -la app/utils/remotion/CinematicBackgroundDebug.tsx
   ls -la app/utils/video-generation/script-enrichment.ts
   ```

3. **Check imports are correct**:
   ```bash
   grep "CinematicBackgroundDebug" app/utils/remotion/SceneRenderer.tsx
   grep "AssetDebugOverlay" app/utils/remotion/CinematicBackgroundDebug.tsx
   ```

4. **Verify Remotion is importable**:
   ```bash
   node -e "const r = require('remotion'); console.log(r.Video, r.Img)"
   ```

5. **Check Node version** (Remotion requires Node 16+):
   ```bash
   node --version
   ```

---

## Next Steps If Working

1. Test with different prompts:
   - Elephant prompt (should get elephant images)
   - Tech prompt (should get tech imagery)
   - Abstract prompt (should get illustrations)

2. Verify caching works:
   - Render same video twice
   - Second render should show "📁 Cached"

3. Monitor performance:
   - Check render time < 60 seconds
   - Video file size < 50MB

---

## Remember

This debug version is AGGRESSIVE about showing what's happening:
- ❌ RED screen if no asset
- ✅ GREEN badge if asset works
- 📝 Detailed logs on every render
- 🔍 Asset info visible in corner

**You cannot miss whether assets are rendering.**

If you still see gradients instead of images after these steps, something fundamental is broken in the pipeline.
