# AI Text-to-Video Feature - Quick Verification Checklist

## Prerequisites ✅
- [ ] Groq API key configured in .env.local (already done: [REDACTED])
- [ ] Next.js dev server running (`npm run dev`)
- [ ] Port 3000 accessible
- [ ] curl or Postman installed for API testing

---

## Core API Tests

### Test 1: Script Generation - Product Promo
```bash
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "30-second product demo: PDF to Word converter with drag-and-drop upload",
    "style": "product-promo",
    "aspectRatio": "16:9",
    "duration": 30,
    "tone": "friendly",
    "ctaText": "Convert Your PDFs Free"
  }'
```
**Expected**: 
- ✅ `ok: true`
- ✅ `script.title` (string)
- ✅ `script.scenes` (array with 5-7 objects)
- ✅ `script.voiceover` (string)
- ✅ `script.captions` (array)
- ✅ `script.cta` (string)

---

### Test 2: Script Generation - Explainer Style
```bash
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain how image compression works and why it matters",
    "style": "explainer",
    "aspectRatio": "16:9",
    "duration": 30,
    "tone": "educational"
  }'
```
**Expected**:
- ✅ Educational tone in voiceover
- ✅ Step-by-step progression in scenes
- ✅ Clear captions for each scene
- ✅ No commercial tone

---

### Test 3: Video Rendering
After getting a script from Test 1, submit it for rendering:
```bash
# First get the script:
SCRIPT=$(curl -s -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{...}' | jq '.script')

# Then render it:
curl -X POST http://localhost:3000/api/video/render \
  -H "Content-Type: application/json" \
  -d "{\"script\": $SCRIPT}"
```
**Expected**:
- ✅ `ok: true`
- ✅ `generationId` (string, looks like "render-xxx")
- ✅ No immediate videoUrl (it's async)

---

### Test 4: Check Render Status
```bash
curl http://localhost:3000/api/video/render?jobId=render-xxx
```
Replace `render-xxx` with actual jobId from Test 3.

**Expected** (before 120 seconds):
- ✅ `ok: true`
- ✅ `progress` value (increasing 0-100)
- ✅ `status` showing "rendering"

**Expected** (after render completes):
- ✅ `ok: true`
- ✅ `videoUrl` (base64 encoded MP4)
- ✅ `status: "completed"`
- ✅ `progress: 100`

---

## Style Validation Tests

Test each of the 6 styles to ensure scene generation is style-appropriate:

```bash
# Test script for each style
for STYLE in "modern" "minimal" "corporate" "social-reel" "explainer" "product-promo"; do
  echo "Testing style: $STYLE"
  curl -s -X POST http://localhost:3000/api/video/generate-script \
    -H "Content-Type: application/json" \
    -d "{
      \"prompt\": \"15-second video about file conversion\",
      \"style\": \"$STYLE\",
      \"aspectRatio\": \"16:9\",
      \"duration\": 15,
      \"tone\": \"professional\"
    }" | jq '.script | {style: .style, scenes_count: (.scenes | length), first_animation: .scenes[0].animation}'
done
```

**Verify**:
- [ ] **modern**: Scenes with "fade" or "slide-left" animations
- [ ] **minimal**: Mostly "fade" and "zoom-out" animations, clean gradients
- [ ] **corporate**: Professional colors (blues/purples), "slide-up" animations
- [ ] **social-reel**: 9:16 vertical, fast animations, bright colors
- [ ] **explainer**: Step-by-step progression, numbered scenes
- [ ] **product-promo**: CTA emphasis, "zoom-in" on product, energetic

---

## Aspect Ratio Tests

Verify each aspect ratio generates correct dimensions:

```bash
# Test 9:16 (vertical - for social media)
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{"prompt":"15s vertical video","style":"social-reel","aspectRatio":"9:16","duration":15,"tone":"professional"}'

# Test 16:9 (widescreen)
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{"prompt":"30s widescreen video","style":"product-promo","aspectRatio":"16:9","duration":30,"tone":"friendly"}'

# Test 1:1 (square - for Instagram)
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{"prompt":"15s square video","style":"modern","aspectRatio":"1:1","duration":15,"tone":"professional"}'
```

**Verify**:
- [ ] 9:16 returns scenes suitable for vertical layout
- [ ] 16:9 returns cinematic-style scenes
- [ ] 1:1 returns balanced square compositions

---

## Duration Tests

```bash
# Test 15 seconds (3 scenes)
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test","style":"modern","aspectRatio":"16:9","duration":15,"tone":"professional"}' \
  | jq '.script.scenes | length'
# Expected: 3

# Test 30 seconds (5 scenes)
# Expected: 5

# Test 45 seconds (7 scenes)
# Expected: 7
```

---

## Error Handling Tests

### Test Invalid Input
```bash
# Empty prompt (should fail)
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{"prompt":"","style":"modern","aspectRatio":"16:9","duration":30,"tone":"professional"}'
```
**Expected**: Error message about prompt length

---

### Test Prompt Length Limit
```bash
# Very long prompt (should fail or truncate)
LONG_PROMPT=$(python3 -c "print('a' * 1001)")
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d "{\"prompt\":\"$LONG_PROMPT\",\"style\":\"modern\",\"aspectRatio\":\"16:9\",\"duration\":30,\"tone\":\"professional\"}"
```
**Expected**: Error about prompt length > 1000

---

### Test Invalid Style
```bash
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test","style":"invalid-style","aspectRatio":"16:9","duration":30,"tone":"professional"}'
```
**Expected**: Error about invalid style value

---

## Performance Tests

### Test Response Time
```bash
# Measure time to generate script
time curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Quick test","style":"modern","aspectRatio":"16:9","duration":30,"tone":"professional"}' > /dev/null
```
**Expected**: < 3 seconds (Groq API typically responds in 2-4 seconds)

---

### Test Caching
```bash
# Same request twice - second should be instant
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Cached test","style":"modern","aspectRatio":"16:9","duration":30,"tone":"professional"}'

# Wait 1 second and try again
sleep 1

# Should return instantly from cache
curl -X POST http://localhost:3000/api/video/generate-script \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Cached test","style":"modern","aspectRatio":"16:9","duration":30,"tone":"professional"}'
```
**Expected**: Second request < 100ms

---

## UI Integration Tests

Once backend is verified, test the UI:

### Test Form Submission
1. Navigate to: `http://localhost:3000/all-tools/video-tools/text-to-video`
2. [ ] Form renders with all controls
3. [ ] Style selector shows 6 options
4. [ ] Aspect ratio selector shows 3 options
5. [ ] Duration dropdown shows 15s, 30s, 45s
6. [ ] Tone dropdown shows all 4 options
7. [ ] Generate button is disabled until prompt is filled
8. [ ] Character counter works (shows X/500)

### Test Script Generation Flow
1. [ ] Enter prompt text
2. [ ] Click "Generate Video Script"
3. [ ] Loading animation appears
4. [ ] After ~2-4 seconds, script loads
5. [ ] Script preview shows:
   - [ ] Voiceover text
   - [ ] Scene breakdown with images/animations
   - [ ] Captions for each scene
   - [ ] CTA at the end
6. [ ] "Render to MP4" button becomes available

### Test Rendering Flow
1. [ ] Click "Render to MP4"
2. [ ] Progress bar appears
3. [ ] Shows stages: Preparing → Rendering → Encoding → Finalizing
4. [ ] Percentage increases every ~2 seconds
5. [ ] After ~10-30 seconds, video appears
6. [ ] Video player controls work (play, pause, scrub)
7. [ ] Download button downloads video as .mp4

### Test Error Handling
1. [ ] Enter very long prompt (> 1000 chars)
2. [ ] Error message appears and is readable
3. [ ] "Try Again" button works
4. [ ] Test network failure (disconnect internet)
5. [ ] Error message is user-friendly

---

## Build & Deployment Tests

Before deploying to production:

```bash
# Test build
npm run build

# Expected:
# ✅ "Compiled successfully"
# ✅ 196 pages generated
# ✅ No TypeScript errors
# ✅ No ESLint warnings (related to video code)
```

```bash
# Test lint
npm run lint

# Expected:
# ✅ No new errors in video-generation files
# ✅ Type checking passes
```

```bash
# Test production build
npm start

# Expected:
# ✅ Server starts on port 3000
# ✅ Video page loads
# ✅ API endpoints respond
```

---

## Monitoring Checklist

Set up monitoring for:
- [ ] Groq API call count per hour
- [ ] Average script generation time
- [ ] Render success rate
- [ ] User errors (invalid inputs)
- [ ] API errors (Groq failures, timeouts)
- [ ] Video rendering success rate

---

## Sign-Off Checklist

- [ ] All 6 style tests pass
- [ ] All 3 aspect ratio tests pass
- [ ] All 3 duration tests pass
- [ ] Error handling tests pass
- [ ] Performance acceptable (< 5s total time)
- [ ] UI renders correctly
- [ ] Form submission works
- [ ] Script generation works
- [ ] Video rendering works
- [ ] Download works
- [ ] Build passes (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Ready for user testing

---

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| API returns `error: "API Key not found"` | Check GROQ_API_KEY in .env.local |
| Script generation takes > 10 seconds | Check internet connection, Groq API status |
| Video doesn't render | Check browser console for errors, try smaller prompt |
| Build fails with TypeScript errors | Run `npm install` to ensure types are up to date |
| Video plays but no audio | Audio generation not yet implemented (in-progress) |
| Download button doesn't work | Check browser download settings, check file size |

---

## Success Metrics

Target performance:
- ✅ Script generation: < 4 seconds
- ✅ Render completion: < 30 seconds (mock), < 5 minutes (production)
- ✅ API response: < 100ms (cached), < 3s (Groq)
- ✅ Error recovery: User can try again successfully
- ✅ Mobile: Works on iOS Safari and Android Chrome
- ✅ Build size: No increase to production bundle (APIs are server-side)

---

**Date Completed**: [Date]
**Tested By**: [Your Name]
**Status**: [PASS/FAIL]

---
