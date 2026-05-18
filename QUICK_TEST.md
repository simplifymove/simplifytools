# ⚡ QUICK TEST REFERENCE

## One-Minute Setup

```bash
# Terminal 1: Clean & Build
node cleanup-debug.js
npm run build
npm run dev
# Wait for "Ready on http://localhost:3000"
```

```bash
# Terminal 2: Test Script Generation
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a video about dense forest ecosystems and wildlife conservation with beautiful natural scenes",
    "style": "modern",
    "duration": 30,
    "aspectRatio": "16:9"
  }' > /tmp/script.json

# Check if assets exist in response
cat /tmp/script.json | jq '.script.scenes[0].selectedAsset'
# MUST show: { "url": "...", "provider": "test-unsplash", ... }
# NOT: null or undefined
```

```bash
# Terminal 2: Render Video
curl -X POST http://localhost:3000/api/video/render \
  -H "Content-Type: application/json" \
  -d @/tmp/script.json > /tmp/render.json

# Get job ID
JOBID=$(cat /tmp/render.json | jq -r '.generationId')
echo "Render Job: $JOBID"

# Poll status (wait ~30 seconds)
curl "http://localhost:3000/api/video/render/status?jobId=$JOBID" | jq '.status'
# When shows "completed", video is ready
```

---

## What to Watch For

### Terminal 1 (Dev Server) - You Should See

✅ ASSET ENRICHMENT logs:
```
████████████████████████████
🚀 ASSET ENRICHMENT PIPELINE - STARTING
✅ Asset enrichment complete
📊 Scenes with real assets: 3/3
████████████████████████████
```

✅ PRE-RENDER AUDIT logs:
```
🎥 PRE-RENDER SCENE AUDIT
📍 SCENE 1:
   Has Asset: true
   ✅ Asset URL: https://...
   ✅ Provider: test-unsplash
```

✅ Render complete:
```
✅ REMOTION RENDER SUCCESSFUL
✅ MP4 validation passed
✅ RENDER COMPLETED SUCCESSFULLY
```

---

### Video Output - You Should See

✅ **Real forest image** (full screen background)
✅ **Top-left corner**: Black box with:
   ```
   🎬 DEBUG INFO
   ✓ ASSET FOUND
   Provider: test-unsplash
   Type: image
   Keywords: forest, nature, wildlife
   ```
✅ **Bottom-right corner**: Green badge
   ```
   ✓ Asset: test-unsplash
   ```
✅ **Text overlays**: Scene headlines
✅ **Camera effects**: Ken Burns zoom or other effects

---

## ❌ If You See This - FAILED

| You See | Problem | Fix |
|---------|---------|-----|
| Silence in console | Enrichment not running | Check SceneRenderer uses CinematicBackgroundDebug |
| `undefined` in jq result | Assets not in script | Check enrichGeneratedScript is imported in route |
| `Has Asset: false` in audit | Assets lost between gen and render | Log script being sent to render endpoint |
| **RED screen** "❌ NO ASSET" | Asset is null | Asset enrichment failed - check env keys |
| **Gradient background** | Old component or caching | Run `node cleanup-debug.js` and rebuild |
| **Orange badge** "⚠️ No Asset" | Old CinematicBackground used | Check SceneRenderer import |

---

## Three Test Cases

### Test 1: Forest (Basic)
```bash
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Dense forest with wildlife",
    "style": "modern",
    "duration": 30,
    "aspectRatio": "16:9"
  }'
```
**Expected**: Forest image, all 3 scenes have assets

### Test 2: Elephant (Specific)
```bash
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Elephants in their natural habitat",
    "style": "modern",
    "duration": 30,
    "aspectRatio": "16:9"
  }'
```
**Expected**: Elephant images, assets show provider="test-unsplash"

### Test 3: Tech (Illustration)
```bash
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "AI and technology innovation",
    "style": "modern",
    "duration": 30,
    "aspectRatio": "16:9"
  }'
```
**Expected**: Tech/AI images, asset type="illustration"

---

## Console Grep Shortcuts

```bash
# See ALL asset logs
npm run dev 2>&1 | grep -i asset

# See ENRICHMENT logs only
npm run dev 2>&1 | grep "ENRICHMENT"

# See RENDER AUDIT only
npm run dev 2>&1 | grep "PRE-RENDER"

# See SUCCESS indicators
npm run dev 2>&1 | grep "✅"

# See ERROR indicators
npm run dev 2>&1 | grep "❌"

# See asset provider info
npm run dev 2>&1 | grep "Provider:"
```

---

## If Render Hangs

Render jobs timeout after 2 minutes. If it's taking longer:

```bash
# Check Remotion is running
ps aux | grep remotion

# Kill any stale processes
killall node

# Try building fresh
npm run build

# Restart dev server
npm run dev
```

---

## Success Checklist ✅

- [ ] Run cleanup-debug.js
- [ ] npm run build (passes)
- [ ] npm run dev (shows "Ready on")
- [ ] Forest curl shows asset in response
- [ ] Console shows ASSET ENRICHMENT
- [ ] Console shows PRE-RENDER AUDIT
- [ ] Video has real image (not gradient)
- [ ] Video has green badge
- [ ] Video has debug info visible

**All checked?** 🎉 Asset pipeline is working!

---

## Detailed Debugging

If any test fails, see [DEBUG_ASSET_PIPELINE.md](DEBUG_ASSET_PIPELINE.md) for complete troubleshooting guide.
