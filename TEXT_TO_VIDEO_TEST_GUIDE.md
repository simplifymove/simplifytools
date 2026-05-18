# Text-to-Video UI End-to-End Test Guide

**Objective**: Verify that the Remotion MP4 renderer is fully integrated into the live Text-to-Video API.

**Test Environment**: Windows development server (http://localhost:3000)

## Pre-Test Checklist

- ✅ `npm run build` passes (198 pages, 0 TypeScript errors)
- ✅ Remotion 4.0.461 installed with all sub-packages
- ✅ /api/video/render updated to use renderVideoOptimized()
- ✅ webpack externals configured for Remotion packages
- ✅ RenderVideoResponse type includes renderer field
- ✅ FFmpeg fallback available if Remotion fails

## Test Flow

### Step 1: Generate Script via Groq

**URL**: `/all-tools/video-tools/text-to-video`

**Action**: 
1. Open the Text-to-Video tool
2. Enter prompt in textarea:
   ```
   A professional product demo showing a software dashboard with animated transitions, 
   featuring gradient backgrounds, icons, and call-to-action button.
   ```
3. Click "Generate Script" button

**Expected Behavior**:
- Loading spinner appears
- Script is generated with:
  - title
  - duration (typically 15-30 seconds)
  - style (one of: modern, minimal, corporate, social-reel, explainer, product-promo)
  - aspectRatio (16:9, 9:16, or 1:1)
  - scenes array (each with headline, visual, animation, background)
  - cta (call-to-action text)

**Console Log Check**:
```
[Generate] Starting script generation...
[Generate] API Response: {...script}
[Generate] ✓ Script generated: "title" (duration=XXs, style=modern, aspectRatio=16:9)
```

### Step 2: Preview Script Storyboard

**Action**:
1. After script is generated, click "Preview Storyboard" tab/button
2. View visual layout of each scene

**Expected Behavior**:
- Storyboard shows:
  - Scene count (e.g., "3 scenes + CTA")
  - Duration breakdown
  - Animations listed (fade, slide-up, zoom-in, etc.)
  - Backgrounds (gradient, blob, image, etc.)
  - Aspect ratio and style

**Console Log Check**:
```
[Preview] Rendering storyboard with X scenes
[Preview] Scene 1: "headline" (animation=slide-up, duration=4s)
```

### Step 3: Render MP4 Video

**Action**:
1. Click "Render Video" button
2. Monitor progress bar

**Expected Behavior**:
- Progress bar updates through stages:
  - 0-5%: Validation
  - 5-15%: Bundle creation
  - 15-20%: Composition selection
  - 20-90%: MP4 rendering (Remotion renderMedia())
  - 90-100%: Validation and finalization
- Rendering takes 2-5 minutes (depending on hardware)
- Final status: "✓ Video Ready"

**Console Log Check** (Server):
```
[Render] Starting render job: render-XXXX-YYYY
[Render] Script: "product demo"
[Render] Style: modern
[Render] Duration: 15 s
[Render] Aspect Ratio: 16:9

[Render] Job render-XXXX-YYYY: 5% - preparing [remotion]
[Render] Starting render with Remotion for: product demo

[Render] Job render-XXXX-YYYY: 15% - rendering [remotion]
[Renderer] Attempting Remotion render...

[Remotion] Starting video render for: product demo
[Remotion] Composition config: {width: 1920, height: 1080, fps: 30, totalFrames: 450, ...}
[Remotion] Rendering scenes:
  Scene 1: "headline" (4s = 120f)
  Scene 2: "visual" (5s = 150f)
  Scene 3: "background" (3s = 90f)
[Remotion] Starting render process...

[Render] Job render-XXXX-YYYY: 50% - rendering [remotion]  ← Progress updates
[Render] Job render-XXXX-YYYY: 80% - rendering [remotion]

[Remotion] ✓ Render completed
[Render] ✓ MP4 validation passed: 1 stream(s), duration: 15.0s
[Render] ✅ Completed: render-XXXX-YYYY
[Render] Renderer: remotion
[Render] Duration: 123.4 s
[Render] File size: 2.45 MB
[Render] Video style: modern
[Render] Aspect ratio: 16:9
```

**UI Response Check**:
- HTTP 202 Accepted response with jobId
- Polling returns progress updates
- Final response includes:
  ```json
  {
    "ok": true,
    "videoUrl": "data:video/mp4;base64,AAAA...",
    "generationId": "render-XXXX-YYYY",
    "renderer": "remotion"
  }
  ```

### Step 4: Preview Generated Video

**Action**:
1. Click "Preview Video" button
2. Video player shows in modal/lightbox
3. Play video (should start immediately)

**Expected Visuals** (in final MP4):
- ✅ Scene 1: Gradient background (animated, colors transitioning smoothly)
- ✅ Scene 2: Animated icon (appears with zoom-in or fade animation)
- ✅ Scene 3: Animated background (blob, particles, or glassmorphism)
- ✅ CTA Section: Button with text and motion animation
- ✅ Smooth transitions between scenes
- ✅ Proper aspect ratio (16:9 = wide screen, 1:1 = square, etc.)
- ✅ Correct duration (15+ seconds with silence padding)

**Console Log Check**:
```
[Render] ✓ Completed: render-XXXX-YYYY
[Render] Renderer: remotion
[Render] File size: 2.45 MB
```

### Step 5: Download MP4

**Action**:
1. Click "Download Video" button
2. File downloads as `video-TIMESTAMP.mp4`

**Expected Behavior**:
- File downloads to Downloads folder
- Filename: `video-[timestamp].mp4`
- File size: 2-5 MB (typical for 15s H.264)
- Can play in any video player (VLC, Windows Media Player, browser)

**File Validation**:
```bash
# Check MP4 structure with ffprobe
ffprobe "video-[timestamp].mp4"

# Expected output:
# Duration: 00:00:15.00
# Stream 0: Video (h264), 1920x1080, 30fps
# Stream 1: Audio (aac), 44100 Hz, stereo
```

### Step 6: Send via Email (if integrated)

**Action**:
1. Click "Send Video" button
2. Enter email address
3. Click "Send"

**Expected Behavior**:
- Confirmation: "Email sent successfully"
- Email received with download link (Nodemailer integration)
- Link downloads the MP4

## Fallback Testing (Optional)

### Remotion Failure → FFmpeg Fallback

**Action**: 
- Manually break Remotion by removing /tmp/remotion-bundles/
- Trigger render again
- System should fall back to FFmpeg

**Expected Logs**:
```
[Render] ⚠️ Remotion render failed: [error message]
[Render] Falling back to FFmpeg renderer...
[Render] ✅ FFmpeg render successful: /tmp/simplifyconvert-videos/...
[Render] ✅ Completed: render-XXXX-YYYY
[Render] Renderer: ffmpeg
```

**Expected Result**:
- Video still renders successfully
- renderer field shows "ffmpeg" instead of "remotion"
- Quality may differ (FFmpeg text rendering vs Remotion composition)

## Performance Checklist

- [ ] First render: ~3-5 minutes (bundle created)
- [ ] Cached renders: ~2-3 minutes (bundle reused)
- [ ] File size: 2-5 MB for 15s video
- [ ] Progress bar smooth and responsive
- [ ] No "out of memory" errors
- [ ] No timeout errors (10-minute limit)

## Known Limitations

1. **Bundling Time**: First render takes longer due to Remotion composition bundling
   - Expected: 5-10 seconds for bundling
   - Subsequent renders reuse cache for 1 hour

2. **Progress Granularity**: Progress updates every ~1 second
   - May show jumps if rendering is very fast

3. **Fallback Quality**: FFmpeg fallback uses text rendering, not Remotion composition
   - Animations less smooth
   - No visual effects (gradients, blobs, particles)

## Troubleshooting

### Issue: Render timeout (>10 minutes)
- **Solution**: Reduce video duration or scene complexity
- **Check**: Verify /tmp has sufficient disk space

### Issue: Remotion render fails, FFmpeg also fails
- **Solution**: Check FFmpeg installation: `ffmpeg -version`
- **Fix**: `npm install ffmpeg-static`

### Issue: No progress updates during render
- **Solution**: Normal - progress updates only from Remotion (every frame)
- **Check**: Server logs show `[Render] Job ...: XX% - rendering`

### Issue: Downloaded MP4 won't play
- **Solution**: Check file size > 100KB
- **Check**: ffprobe validation should have passed

## Success Criteria

✅ **Full Test Pass Requirements**:
1. Script generates with Groq API
2. Storyboard previews correctly
3. Render completes with "remotion" renderer
4. Progress updates from 0-100%
5. Final MP4 contains:
   - Animated scenes (fade/slide/zoom visible)
   - Icons with animations
   - Gradient/blob backgrounds animating
   - CTA section with motion
   - Correct aspect ratio and duration
6. Video downloads successfully
7. Downloaded MP4 plays in standard players
8. Server logs show successful Remotion render

## Test Results

| Step | Expected | Actual | Status |
|------|----------|--------|--------|
| 1. Generate Script | Script with scenes | | ⏳ |
| 2. Preview Storyboard | Storyboard displays | | ⏳ |
| 3. Render Video | Remotion MP4 generated | | ⏳ |
| 4. Preview Video | Animations visible | | ⏳ |
| 5. Download MP4 | File downloads | | ⏳ |
| 6. Video Playback | Plays smoothly | | ⏳ |

---

**Date**: [Test Date]  
**Tester**: [Name]  
**Environment**: Windows localhost  
**Status**: PENDING  
