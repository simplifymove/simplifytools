# HARD DEBUG MODE - Binary Output Test

**Goal**: Get definitive YES/NO answer: does asset reach video or not?

---

## Setup (2 minutes)

```bash
# 1. Verify setup
node verify-debug-setup.js

# 2. Build fresh
npm run build

# 3. Start dev server
npm run dev
```

Expected output:
```
Ready on http://localhost:3000
```

---

## Test 1: Forest (Should Render Real Image or RED Screen)

**Terminal 2**:
```bash
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Beautiful dense forest with ancient trees and lush ecosystem",
    "style": "modern",
    "duration": 30,
    "aspectRatio": "16:9"
  }' > /tmp/script.json
```

**Terminal 1 (server)**: Watch for this output
```
█████████████████████████████████████████
[Script Gen - DEBUG] ENRICHED SCRIPT SCENES:
█████████████████████████████████████████

📍 SCENE 1: [headline]
   Keywords: forest, nature, ecosystem, conservation
   Has selectedAsset: true ✅
   ✅ Asset URL: ...
   ✅ Provider: ...
```

Then render:
```bash
curl -X POST http://localhost:3000/api/video/render \
  -H "Content-Type: application/json" \
  -d @/tmp/script.json > /tmp/render.json
```

**Terminal 1**: Watch for:
```
[Render - DEBUG] FINAL_RENDER_SCRIPT STRUCTURE:
[
  {
    "assetProvider": "test-hardcoded-forest",
    "assetUrl": "/test-assets/forest.svg",
    ...
  }
]
```

**The Video Should Show**:
- ✅ Real forest SVG image (not gradient)
- ✅ Green debug badge in corner
- ✅ Asset info visible

**OR** (if asset pipeline failed):
- ❌ Bright RED error screen "NO ASSET FOUND"
- This means asset enrichment broke somewhere

---

## Test 2: Elephant (Different Keywords)

```bash
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Majestic elephants in their natural savanna habitat",
    "style": "modern",
    "duration": 30,
    "aspectRatio": "16:9"
  }' > /tmp/script.json
```

**Expected**:
- Keywords: elephant, wildlife, savanna
- Asset: /test-assets/elephant.svg
- Video shows elephant SVG

---

## Binary Result Interpretation

| What You See | What It Means |
|---|---|
| **Real forest/elephant SVG** | ✅ Asset pipeline WORKS |
| **Bright RED "NO ASSET"** | ❌ Asset is null in Remotion |
| **Gradient background** | ❌ Wrong component or old code running |
| **Orange "No Asset - Gradient"** | ❌ Old CinematicBackground being used |

---

## Logs to Check

### Generate-Script Logs
Look for:
```
[Script Gen - DEBUG] ENRICHED SCRIPT SCENES:
📍 SCENE 1: ...
   Keywords: forest, nature, ecosystem
   Has selectedAsset: true ✅
   ✅ Asset URL: https://... OR /test-assets/...
```

**If missing**: Asset enrichment didn't run
**If "❌ NO ASSET"**: Enrichment failed

---

### Render Logs
Look for:
```
[Render - DEBUG] FINAL_RENDER_SCRIPT STRUCTURE:
[
  {
    "assetProvider": "test-hardcoded-forest",
    "assetUrl": "/test-assets/forest.svg",
  }
]
```

**If missing**: Something cleared the scene before render
**If null assetProvider**: Asset lost in transit

---

### CinematicBackgroundDebug Logs
Look for:
```
✅ RENDERING ASSET
  url: /test-assets/forest.svg
  provider: test-hardcoded-forest
  cached: true
```

**OR** (if broken):
```
❌ CRITICAL: NO ASSET PROVIDED TO CinematicBackgroundDebug
```

---

## Debugging Path

If RED screen in video:

1. **Check Generate-Script logs**
   - Do scenes have selectedAsset? (✅ or ❌)
   - If ❌: Asset enrichment failed
   - Check if enrichGeneratedScript imported

2. **Check Render logs**
   - Are assets still there in FINAL_RENDER_SCRIPT?
   - If gone: Something cleared scenes between gen and render

3. **Check CinematicBackgroundDebug logs**
   - Does it receive asset prop?
   - If null: Something cleared it before rendering

4. **Check browser console**
   - Are <Img> components rendering?
   - Are SVG files 404?

---

## No More Guessing

With HARD DEBUG MODE:
- ❌ No gradients - only real asset or RED error
- ✅ Console logs every step
- 🎯 Binary answer: works or doesn't

If you see RED screen, server logs will tell you exactly where it broke.

---

## Quick Checklist

- [ ] Run `node verify-debug-setup.js` - all green
- [ ] `npm run build` - succeeds
- [ ] `npm run dev` - ready
- [ ] Forest curl works
- [ ] Server logs show DEBUG sections
- [ ] Video shows forest SVG (not gradient)
- [ ] Check render logs show assetProvider

If any step fails, that's your diagnostic clue.
