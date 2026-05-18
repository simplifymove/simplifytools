# How to Verify Modern Visual Composition is Working

## Quick Verification Steps

### 1. Start the Development Server
```bash
npm run dev
```
Wait for "ready - started server on 0.0.0.0:3000" (should be localhost:3000)

### 2. Navigate to Text-to-Video Tool
```
http://localhost:3000/all-tools/video-tools/text-to-video
```

### 3. Test Video Generation
**Prompt to use:**
```
Modern SaaS dashboard product demo showing animated features with smooth transitions, 
glowing effects, and professional visual hierarchy. Focus on visual sophistication.
```

### 4. Monitor Console for Renderer Information

#### On Server (Terminal):
Watch for these messages indicating Remotion is active:
```
[Render] Starting render job: render-XXXX-YYYY
[Render] Starting render with Remotion for: "Product Demo"
[Remotion] Starting video render for: Product Demo
[Remotion] Composition config: {width: 1920, height: 1080, fps: 30, totalFrames: 450}
[Remotion] Rendering scenes:
  Scene 1: "headline" (4s = 120f)
  Scene 2: "visual" (4s = 120f)
  Scene 3: "background" (5s = 150f)
[Remotion] ✓ Render completed
[Render] Renderer: remotion ← Confirms Remotion was used
```

**NOT these** (old FFmpeg fallback):
```
[Render] ⚠️ Remotion render failed
[Render] Renderer: ffmpeg ← Would mean fallback was used
```

### 5. Verify Visual Elements in Downloaded MP4

Once video renders and downloads, look for:

#### ✅ **Scene 1: Animated Backgrounds**
- Gradient smoothly rotating (subtle 360° rotation throughout)
- Particles floating upward in background
- No static gradient - should see continuous color shift

#### ✅ **Scene 2: Glassmorphism & Icons**
- Icon appears with glow effect (radial glow around icon)
- Icon scales in smoothly (spring animation)
- Behind icon: animated gradient blob rotating
- Text appears after icon (staggered timing)
- Glassmorphic card visible around text (transparent frosted glass effect)

#### ✅ **Scene 3: Particle System**
- Multiple particles floating across screen
- Particles pulse opacity (fade in/out)
- Floating upward motion visible
- Dual-layer particles (different colors/speeds)
- Smooth cinematic motion, not jerky

#### ✅ **CTA Screen (Final)**
- Glowing button with halo/ring effect
- Button pulses (scales slightly up/down)
- Particles floating up in background
- Text appears in staggered sequence:
  1. Main heading (slides up + fades)
  2. Subtext (fades in after)
  3. Button (glows in last)
- Bottom accent line animates in
- Overall zoom effect (camera zoom in)

### 6. What Should NOT Look Like (Old Renderer)

If you see these, Remotion isn't being used properly:
- ❌ Static flat gradient (no animation)
- ❌ Text all appearing at same time
- ❌ No particle movement
- ❌ Flat 2D look with no depth
- ❌ Basic text animations only (no multiple layers)
- ❌ Basic button with no glow

### 7. Side-by-Side Comparison

**Old FFmpeg Renderer**:
- Flat text on gradient
- Text fades in
- Simple background
- Feels like PowerPoint
- Duration: ~2-3 min per 15s video

**New Remotion Renderer**:
- Layered animations
- Staggered multi-element entrance
- Animated particles, blobs, gradients
- Professional SaaS promo feel
- Duration: ~2-5 min per 15s video (first run slightly slower due to bundling)

## Debugging: If Visuals Don't Appear

### Check 1: Is Remotion Being Used?
```bash
# In server terminal, watch for:
[Remotion] Starting video render
```

If you see `[Render] ⚠️ Remotion render failed` → Check error message
- Usually disk space or missing dependency

### Check 2: MP4 File Size
- **Old renderer**: ~0.5-1.5 MB (text-only, simple)
- **New renderer**: ~2-5 MB (rich animation, complex)

If file is small → Old renderer was used or render incomplete

### Check 3: Video Duration
- **Should be**: 15+ seconds (with CTA)
- **Check with**: `ffprobe video-file.mp4`

### Check 4: Browser Console
Open DevTools (F12) → Console tab
- Look for any errors fetching video URL
- Check if `renderer: "remotion"` appears in response
- Monitor progress updates (should show 0-100%)

### Check 5: Network Tab
- POST /api/video/render → Should return jobId (202 Accepted)
- GET /api/video/render?jobId=xxx → Poll progress
- Final response should include `"renderer": "remotion"`

## Performance Notes

**Expected Render Times**:
- First render of session: 5-10s (Remotion bundle creation)
- Subsequent renders: 2-5 minutes (full MP4 encoding)
- Can be faster on high-end hardware

**If Render Takes >10 minutes**:
- Timeout likely triggered (10-min default)
- Check /tmp disk space: `df -h /tmp`
- Clear old videos: `rm -f /tmp/simplifyconvert-videos/*`
- Try simpler prompt (fewer scenes = faster)

## Video Quality Settings

**Current Configuration**:
- Codec: H.264
- CRF: 28 (quality - lower = better but slower)
- Pixel Format: YUV420P
- FPS: 24-60 (depends on style)
- Resolution: 1920×1080 (16:9), 1080×1920 (9:16), or 1080×1080 (1:1)

**Output Quality**:
- Professional: Suitable for LinkedIn, YouTube, Twitter
- Compression: ~150-200 kbps average bitrate
- File size: 2-5 MB for 15-second video

## Success Indicators

✅ **You'll know it's working when**:
1. Server logs show `[Remotion]` messages during render
2. Downloaded MP4 is 2-5 MB in size
3. Video plays and shows animated particles, glowing effects, smooth transitions
4. Video feels cinematic (not like PowerPoint slides)
5. Response includes `"renderer": "remotion"`
6. Multiple animation layers visible (not all text appearing at once)

✅ **Test passed if**:
- Video plays smoothly in any player (VLC, Windows Media, browser)
- Gradient backgrounds animate (rotate continuously)
- Icons have glow effects
- Particles float in background
- Text appears in staggered sequence
- CTA button glows and pulses
- Overall duration matches prompt (15-30 seconds)

## Troubleshooting Commands

```bash
# Check Remotion is installed
npm list @remotion/renderer @remotion/bundler

# Verify bundle cache (should be recent timestamps)
ls -lah /tmp/remotion-bundles/

# Check video file (should be MP4 format)
ffprobe /tmp/simplifyconvert-videos/[latest-file]

# Check disk space
df -h /tmp

# Monitor render progress (if running)
tail -f /path/to/logs/render.log
```

## Expected Behavior Timeline

**For 15-second script with 3 scenes + CTA**:

| Time | Event |
|------|-------|
| 0:00 | POST /api/video/render |
| 0:01 | Async job starts, bundle creation begins |
| 0:05-0:10 | Bundle complete (if not cached) |
| 0:10 | Composition selection |
| 0:15-3:00 | Remotion renderMedia() encoding |
| 3:00-3:30 | MP4 validation + base64 encoding |
| 3:30+ | GET /api/video/render returns videoUrl |

**Total time**: 3-5 minutes for complete flow

---

**Status**: Ready to test modern visual composition  
**Build**: ✅ Compiled  
**Renderer**: Remotion (primary) + FFmpeg (fallback)  
**Expected Visual Quality**: Professional SaaS marketing video
