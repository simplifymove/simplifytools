# Format Discovery Implementation

## Overview

Implemented a **two-endpoint format discovery system** that allows users to select specific video quality, resolution, and audio format before downloading.

## What Changed

### 1. New Format Discovery Endpoint
**Location**: `app/api/download/formats/route.ts`

**Purpose**: Query yt-dlp for all available formats and return structured options

**Implementation**:
```bash
python -m yt_dlp --dump-single-json --no-download --js-runtimes node URL
```

**Key Features**:
- Uses `--dump-single-json` for clean JSON output instead of parsing terminal text
- Includes `--no-download` to avoid actual file download
- Supports cookies authentication for VPS IPs
- Cleans Python environment variables to prevent conflicts

**Request**:
```json
POST /api/download/formats
{
  "url": "https://youtube.com/watch?v=..."
}
```

**Response**:
```json
{
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": 3600,
  "videoOptions": [
    {
      "label": "Best MP4",
      "formatId": "401+251",
      "height": 2160,
      "ext": "mp4",
      "filesize": 3800000000
    },
    {
      "label": "1080p MP4",
      "formatId": "399+251",
      "height": 1080,
      "ext": "mp4",
      "filesize": 450000000
    }
  ],
  "audioOptions": [
    {
      "label": "MP3 - 192k",
      "formatId": "251",
      "ext": "mp3",
      "filesize": 40000000
    }
  ]
}
```

### 2. Updated Download Endpoint
**Location**: `app/api/download/route.ts`

**Changes**:
- Now accepts optional `formatId` parameter
- Passes selected format to yt-dlp via `-f` flag
- Always includes `--merge-output-format mp4` for combined formats

**Request** (with format selection):
```json
POST /api/download
{
  "url": "https://youtube.com/watch?v=...",
  "formatId": "399+251"
}
```

**Format Selection Logic**:
```typescript
// In download route
const selectedFormatId = body.formatId || body.format;

// In tryLocalYtDlp
const args = [
  '-m', 'yt_dlp',
  '-f', formatId || 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/best',
  '--merge-output-format', 'mp4',
  // ... other args
];
```

## Format Parsing Logic

### Video Format Extraction

Filters formats using:
```typescript
const videoFormats = info.formats
  .filter(f => f.vcodec !== 'none' && f.vcodec && f.height && f.height > 0)
  .sort((a, b) => (b.height || 0) - (a.height || 0));
```

**For each resolution**:
- Checks if format has embedded audio (`f.acodec !== 'none'`)
- If audio-only format: uses `format_id` directly
- If video-only format: combines with best audio using `${video_id}+${audio_id}`

### Audio Format Extraction

Filters formats using:
```typescript
const audioFormats = info.formats
  .filter(f => f.acodec !== 'none' && f.vcodec === 'none')
  .sort((a, b) => (b.abr || 0) - (a.abr || 0));
```

**Groups by bitrate** to show multiple quality options (192k, 128k, etc.)

### Format Combination Example

For YouTube:
- Video-only format: `401` (2160p, no audio)
- Audio-only format: `251` (best audio)
- Combined: `401+251` downloads both and merges into MP4

## Implementation Details

### Environment Variables Required
```bash
# For format discovery to work
PYTHON_PATH=/path/to/python
YTDLP_COOKIES_PATH=/path/to/cookies.txt  # Optional but recommended
```

### Supported Response Patterns

**Pattern 1**: Format with audio included
```
format_id: "22"
vcodec: "h264"
acodec: "aac"
height: 720
```
→ Use directly: `-f "22"`

**Pattern 2**: Separate video/audio (YouTube)
```
Video: format_id: "401", vcodec: "av1", acodec: "none", height: 2160
Audio: format_id: "251", vcodec: "none", acodec: "opus"
```
→ Combine: `-f "401+251" --merge-output-format mp4`

### Error Handling

- **Invalid URL**: Returns 400 error
- **Format fetch timeout**: Returns 500 with error message
- **No formats found**: Returns empty arrays (graceful degradation)
- **yt-dlp errors**: Caught and logged with stderr output

## Frontend Integration

To use the new format discovery in your UI:

```typescript
// Step 1: Fetch available formats
const response = await fetch('/api/download/formats', {
  method: 'POST',
  body: JSON.stringify({ url: userInputUrl }),
});

const { videoOptions, audioOptions, title } = await response.json();

// Step 2: Populate dropdown with options
// Display: videoOptions[].label
// Value: videoOptions[].formatId

// Step 3: Download with selected format
const downloadResponse = await fetch('/api/download', {
  method: 'POST',
  body: JSON.stringify({
    url: userInputUrl,
    formatId: selectedFormat.formatId  // e.g., "399+251"
  }),
});
```

## Performance Characteristics

| Operation | Time | Notes |
|-----------|------|-------|
| Format discovery | 5-30s | Depends on network and yt-dlp parsing |
| Download | 10-180s | Depends on file size and connection |
| Total user time | 15-210s | Format discovery + download |

**Optimization**: Format discovery runs once, then user can download multiple qualities without re-fetching

## Testing Checklist

- [ ] Format discovery returns valid JSON
- [ ] Video options include all resolutions
- [ ] Audio options show multiple bitrates
- [ ] Combined format IDs work (e.g., "401+251")
- [ ] Download succeeds with selected formatId
- [ ] Download falls back to best quality if no formatId provided
- [ ] MP4 merging works for split video+audio formats
- [ ] Cookies authentication included in format discovery
- [ ] `--js-runtimes node` included for YouTube signatures
- [ ] File sizes calculated correctly from `filesize_approx`

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| No formats returned | yt-dlp parsing failed | Check stderr logs for yt-dlp errors |
| "Process timeout" | Format discovery took >2 minutes | Check network/URL validity |
| Selected format fails | Format not actually available | Verify format_id still valid (list may change) |
| Combined format not merging | ffmpeg not available | Install ffmpeg: `pip install ffmpeg-python` |
| Only audio/video, not both | Format combination failed | Try selecting individual audio format |

## Files Modified

1. **app/api/download/formats/route.ts** (Complete rewrite)
   - Implements format discovery with proper JSON parsing
   - Separates video and audio options
   - Handles format combination logic

2. **app/api/download/route.ts** (Minor updates)
   - Updated `tryLocalYtDlp()` to accept optional `formatId`
   - Updated `POST()` handler to extract and pass `formatId`
   - Added logging for selected format

## Git Commit

```
052d119 feat: Implement format discovery with --dump-single-json and format ID selection
```

## Next Steps

1. **Update UI components** to call format discovery endpoint
2. **Display dropdown** with videoOptions and audioOptions
3. **Handle format selection** and pass to download endpoint
4. **Test with various URLs** (YouTube, social media, etc.)
5. **Monitor format changes** - some formats may disappear between discovery and download
