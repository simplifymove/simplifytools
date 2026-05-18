# Video Rendering API Contract

## Overview

The video rendering API has been updated to produce **real MP4 files** with actual video content instead of empty containers.

## POST /api/video/render

Render a video script to MP4 and get a job ID for polling.

### Request

```json
{
  "script": {
    "title": "Product Launch Video",
    "duration": 30,
    "style": "modern",
    "aspectRatio": "16:9",
    "voiceover": "Check out our amazing new product...",
    "scenes": [
      {
        "id": "scene-1",
        "headline": "Introducing the Future",
        "subtext": "Innovation redefined",
        "animation": "fade",
        "background": "#1a1a2e",
        "gradientStart": "#667eea",
        "gradientEnd": "#764ba2",
        "duration": 10
      },
      // ... more scenes
    ],
    "cta": {
      "text": "Learn More",
      "url": "https://example.com"
    }
  }
}
```

### Response (202 Accepted)

```json
{
  "ok": true,
  "generationId": "render-1715731234567-abc123def"
}
```

The client should now poll the GET endpoint with this `generationId`.

### Error Response (400/500)

```json
{
  "ok": false,
  "error": "Valid script with scenes is required"
}
```

## GET /api/video/render?jobId={generationId}

Check rendering progress or retrieve completed video.

### Query Parameters

- `jobId` (required): The generation ID from the POST response

### Response: In Progress (200)

```json
{
  "ok": true,
  "status": "rendering",
  "progress": 45
}
```

**Status values:**
- `queued` - Waiting to start
- `preparing` - Setting up resources (0-10%)
- `rendering` - Rendering with FFmpeg (10-80%)
- `encoding` - Validating and encoding audio (80-95%)
- `completed` - Ready for download
- `failed` - Render failed

### Response: Completed (200)

```json
{
  "ok": true,
  "status": "completed",
  "progress": 100,
  "videoUrl": "data:video/mp4;base64,AAAAHGZ0eXBpc29t..."
}
```

The `videoUrl` is a data URL that can be:
- Set as `<video src="">` in HTML
- Downloaded directly
- Shared with users

### Response: Failed (200)

```json
{
  "ok": true,
  "status": "failed",
  "error": "MP4 validation failed: No video stream found"
}
```

### Response: Job Not Found (404)

```json
{
  "ok": false,
  "error": "Job not found. It may have expired."
}
```

Jobs expire after 5 minutes of inactivity.

## Rendering Stages

### Stage Details

| Stage | Time | Progress | Details |
|---|---|---|---|
| Queued | - | 0% | Waiting in job queue |
| Preparing | ~500ms | 5% | Initializing FFmpeg and resources |
| Rendering | ~2-5s | 15-80% | FFmpeg encoding video with text overlay |
| Validating | ~100ms | 80-85% | Checking MP4 structure with ffprobe |
| Encoding | ~500ms | 85-95% | Converting MP4 to base64 for transmission |
| Completed | - | 100% | Ready for download |

**Timeout:** 2 minutes (120 seconds)
- If rendering takes > 2 minutes, job fails automatically
- Prevents hanging requests

## MP4 Output Specification

### Video Properties

```
Codec:           H.264 (libx264)
Resolution:      Based on aspect ratio
                 - 16:9  → 1920×1080
                 - 9:16  → 1080×1920
                 - 1:1   → 1080×1080
Frame Rate:      Style-dependent
                 - Modern/Corporate/Product → 30 fps
                 - Social Reel → 60 fps
                 - Minimal/Explainer → 24 fps
Duration:        Matches script.duration (15/30/45 seconds)
Bitrate:         CRF 28 (efficient compression)
Pixel Format:    YUV420p (standard web compatibility)
```

### Audio Properties

```
Codec:           AAC
Bitrate:         128 kbps
Sample Rate:     44.1 kHz
Channels:        Stereo
Content:         Generated sine wave (1000 Hz)
```

### File Characteristics

```
Minimum Size:    100 KB (enforced)
Typical Size:    2-10 MB for 30-60 seconds
Video Streams:   1 (required)
Audio Streams:   1 (optional)
Container:       MP4 (ISO/IEC 14496-12)
```

### Content Features

```
Background:      Solid color (dark blue 0x1a1a2e)
Text Overlay:    White text, centered
                 - Script title (main heading)
                 - Scene headlines (numbered list)
                 - Font size: 24pt
                 - Line spacing: 10px
Animation:       (Future: Per-scene animations)
Subtitle:        (Future: Scene voiceover timing)
```

## Validation Requirements

All generated MP4 files must pass validation:

### File Size
- ✅ Minimum: 100 KB
- ✅ Maximum: 50 MB (safety limit)

### Video Stream
- ✅ At least 1 video stream (required)
- ✅ Codec: H.264/H.265
- ✅ Duration: > 0 seconds
- ✅ Resolution: Matches script.aspectRatio

### Structure
- ✅ Valid MP4 container (ISO/IEC 14496)
- ✅ Proper atom structure (ftyp, moov, mdat)
- ✅ Readable by ffprobe

### Codec
- ✅ Video: H.264 (libx264)
- ✅ Audio: AAC (required for compatibility)

**If validation fails:** Job status = `failed`, error returned to client

## Error Handling

### Common Errors

| Error | Cause | Solution |
|---|---|---|
| "FFmpeg encoding failed" | FFmpeg not installed | Install FFmpeg; check PATH |
| "MP4 validation failed: File too small" | Encoding didn't complete | Check FFmpeg command syntax |
| "No video stream found" | Corrupted MP4 structure | Verify FFmpeg filter syntax |
| "Invalid duration" | Duration calculation error | Check script.duration value |
| "Job not found" | Timeout (> 5 min) or invalid jobId | Restart rendering |
| "Render timeout exceeded" | Encoding took > 2 minutes | Increase timeout or optimize FFmpeg |

### Error Recovery

Clients should:
1. Log error message and jobId
2. Display user-friendly message
3. Offer retry option (new render)
4. Check FFmpeg installation if persistent failures

## Client Implementation Example

### JavaScript/Fetch

```javascript
// Step 1: Request rendering
const startRender = async (script) => {
  const response = await fetch('/api/video/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ script })
  });
  const data = await response.json();
  return data.generationId;
};

// Step 2: Poll for completion
const pollRender = async (jobId) => {
  const maxAttempts = 120; // 2 minutes
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(`/api/video/render?jobId=${jobId}`);
    const data = await response.json();

    if (data.status === 'completed') {
      return data.videoUrl;
    }

    if (data.status === 'failed') {
      throw new Error(`Rendering failed: ${data.error}`);
    }

    // Wait 1 second before next poll
    await new Promise(r => setTimeout(r, 1000));
    attempts++;
  }

  throw new Error('Rendering timeout');
};

// Step 3: Use the video
const downloadVideo = (videoUrl) => {
  const link = document.createElement('a');
  link.href = videoUrl;
  link.download = 'video.mp4';
  link.click();
};

// Usage
const jobId = await startRender(videoScript);
const videoUrl = await pollRender(jobId);
downloadVideo(videoUrl);
```

## Performance Metrics

### Typical Performance

```
Small (15s, 16:9):   ~2-3 seconds
Medium (30s, 9:16):  ~3-5 seconds
Large (45s, 1:1):    ~5-8 seconds

Validation:          ~100 ms
Base64 Encoding:     ~500 ms - 1 sec (varies by size)
Total Overhead:      ~1.5-2 seconds
```

### Concurrent Requests

- Recommended: Up to 4 concurrent renders per server
- Queue handling: FIFO (first-in, first-out)
- Job timeout: 5 minutes after last update

### Resource Requirements

```
CPU:              1-2 cores active per render
Memory:           100-200 MB peak per render
Disk I/O:         ~10 MB temporary space
Network:          N/A (local processing)
```

## Backward Compatibility

### Changes from Previous Version

- ❌ **Removed:** Mock MP4 generation (empty files)
- ❌ **Removed:** `generateMockMP4Base64()` function
- ✅ **Added:** Real FFmpeg-based rendering
- ✅ **Added:** MP4 validation with ffprobe
- ✅ **Added:** Detailed error messages
- ⚠️ **Changed:** Rendering time (now longer but real output)

### Migration Notes

If upgrading from mock renderer:
1. Videos will now be real MP4 files
2. File sizes will be 100x larger (expected)
3. FFmpeg installation is now required
4. Rendering will take 2-5 seconds (instead of instant)
5. Validation errors are now possible (fail fast)

## Future Enhancements

Planned improvements:

1. **Remotion Integration**
   - Advanced scene animations
   - Per-scene transitions
   - Custom component rendering

2. **Content Enhancements**
   - Background images
   - Scene-specific colors
   - Logo/watermark support
   - Custom fonts

3. **Performance**
   - GPU acceleration
   - Parallel rendering
   - Progressive streaming

4. **Features**
   - Subtitle/caption sync
   - Background music
   - Picture-in-picture
   - Multi-language support
