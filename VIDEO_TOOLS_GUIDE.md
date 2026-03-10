# Video Tools Implementation Guide

## Overview

This is a scalable architecture for video/audio tools using a unified backend. Instead of 58+ separate tools, we use 5 shared engines to handle all conversions, editing, downloading, transcription, and summarization.

## Architecture Summary

### Frontend
- **Dynamic Route**: `/app/tools/video/[slug]/page.tsx`
- **Tool Registry**: `/app/lib/video-tools.ts` (58 tools configured)
- **Validation**: `/app/lib/media-validation.ts`
- **Unified API**: `/app/api/media/route.ts`

### Backend (Python)
- **Router**: `/python/media_router.py` - Routes to engines
- **Engines**:
  - `media_convert.py` - Format conversions (41 tools)
  - `media_edit.py` - Editing operations (14 tools)
  - `media_download.py` - Social media downloads (4 tools)
  - `transcription.py` - Speech-to-text (5 tools)
  - `summarization.py` - Podcast summarization (1 tool)
- **Utils**: `ffmpeg_utils.py` - FFmpeg wrapper functions

## Installation

### Prerequisites

1. **Node.js** (v18+)
2. **Python** (3.9+)
3. **FFmpeg** (system-wide installation)

#### Install FFmpeg

**Windows (PowerShell as Admin)**:
```powershell
choco install ffmpeg
# Or: scoop install ffmpeg
```

**macOS**:
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt-get install ffmpeg
```

### Step 1: Install Node Dependencies

```bash
npm install uuid
```

### Step 2: Install Python Dependencies

```bash
pip install -r requirements-video-tools.txt
```

This installs:
- `ffmpeg-python` - FFmpeg wrapper
- `yt-dlp` - Video downloading
- `faster-whisper` - Transcription
- `anthropic` or `openai` - LLM summarization

### Step 3: Verify Installation

```bash
# Check FFmpeg
ffmpeg -version
ffprobe -version

# Test Python modules
python -c "import ffmpeg; import yt_dlp; import faster_whisper; print('All modules OK')"
```

## Quick Start

### Add a New Tool

1. Edit `/app/lib/video-tools.ts`:
```typescript
export const videoTools: Record<string, VideoTool> = {
  'my-tool': {
    id: 'my-tool',
    title: 'My Tool',
    description: 'What it does',
    engine: 'convert',  // or 'edit', 'download', 'transcribe', 'summarize'
    category: 'conversion',
    accepts: ['.mp4', '.mov'],
    outputType: '.mp3',
    inputMethod: 'file',  // or 'url', 'both'
    options: [
      {
        id: 'quality',
        label: 'Quality',
        type: 'select',
        options: [
          { label: 'High', value: 'high' },
          { label: 'Low', value: 'low' }
        ]
      }
    ]
  }
};
```

2. Tool becomes automatically available at `/tools/video/my-tool`

### Test a Tool

Navigate to: `http://localhost:3000/tools/video/mp4-to-mp3`

## File Structure

```
app/
  api/
    media/
      route.ts                 # Unified API endpoint
  lib/
    video-tools.ts            # Tool registry (58 tools)
    media-validation.ts       # Input validation
  tools/
    video/
      [slug]/
        page.tsx              # Dynamic tool page
        
python/
  media_router.py             # Routes to engines
  engines/
    media_convert.py          # 41 conversion tools
    media_edit.py             # 14 editing tools  
    media_download.py         # 4 downloader tools
    transcription.py          # 5 transcription tools
    summarization.py          # 1 summarization tool
  utils/
    ffmpeg_utils.py           # FFmpeg wrapped functions
```

## API Endpoint

### POST /api/media

Handles all media processing requests.

**Request** (multipart/form-data):
```
tool: string (tool slug, e.g., "mp4-to-mp3")
file: File (for file-based tools)
url: string (for URL-based tools)
[options]: key=value pairs for tool-specific options
```

**Response**:
- **For file output**: Binary file download
- **For text output**: JSON `{ content: string, type: "text" }`
- **Error**: JSON `{ error: string }`

**Example Request**:
```bash
curl -X POST http://localhost:3000/api/media \
  -F "tool=mp4-to-mp3" \
  -F "file=@video.mp4" \
  -F "audioQuality=2" \
  --output audio.mp3
```

## Engine Specifications

### MediaConvertEngine
**Handles**: MP4→MP3, MOV→MP4, AVI→MP4, etc. (41 tools)
**Handler**: `media_convert.py`
**Technology**: FFmpeg with codec selection

**Example FFmpeg command for MP4→MP3**:
```bash
ffmpeg -i input.mp4 -vn -acodec libmp3lame -q:a 2 output.mp3
```

### MediaEditEngine  
**Handles**: Trim, Resize, Compress, Convert to GIF, Mute (14 tools)
**Handler**: `media_edit.py`
**Technology**: FFmpeg filters and transcoding

**Example FFmpeg command for trim**:
```bash
ffmpeg -i input.mp4 -ss 00:15 -to 00:45 -c copy output.mp4
```

### MediaDownloadEngine
**Handles**: YouTube, TikTok, Instagram, Twitter, Facebook
**Handler**: `media_download.py`
**Technology**: yt-dlp

**Example**:
```python
yt_dlp.YoutubeDL(opts).extract_info(url, download=True)
```

### TranscriptionEngine
**Handles**: Audio→Text, Video→Text, YouTube→Text
**Handler**: `transcription.py`
**Technology**: Faster-Whisper (or Whisper)

**Pipeline**:
```
video → extract audio → normalize to 16kHz mono → transcribe → format (text/srt/vtt/json)
```

### SummarizationEngine
**Handles**: Summarize Podcast
**Handler**: `summarization.py`
**Technology**: Transcription + LLM

**Pipeline**:
```
audio → transcribe → chunk → summarize with LLM → format output
```

## Configuration

### FFmpeg Options

Update in `/python/utils/ffmpeg_utils.py`:

```python
# Change default preset for compression
ffmpeg_preset = preset_map.get(preset, 'medium')

# Adjust CRF for quality (0-51, default 28)
crf = int(crf) or 28
```

### LLM Selection

In `/python/engines/summarization.py`, switch between:

```python
# Use Anthropic Claude (default)
import anthropic
client = anthropic.Anthropic()

# Or use OpenAI
import openai
response = openai.ChatCompletion.create(...)
```

### Timeout Settings

Edit `/app/api/media/route.ts`:
```typescript
// Increase timeout for large files
timeout: 600000  // 10 minutes
```

## Troubleshooting

### FFmpeg Not Found
```
Error: FFmpeg not found
```
**Solution**: Install FFmpeg system-wide and ensure it's in PATH
```bash
# Windows: Test with
where ffmpeg

# Linux/macOS: Test with
which ffmpeg
```

### Whisper Model Not Found
```
Error: Model "base" not downloaded
```
**Solution**: First run downloads the model (~140MB)
```bash
# Pre-download model
python -c "from faster_whisper import WhisperModel; WhisperModel('base')"
```

### Python Module Import Error
```
ModuleNotFoundError: No module named 'yt_dlp'
```
**Solution**: Reinstall dependencies
```bash
pip install --upgrade -r requirements-video-tools.txt
```

### Multipart Form Data Size Limit
```
PayloadTooLargeError: Request body too large
```
**Edit** `/app/api/media/route.ts`:
```typescript
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1gb',  // Increase limit
    },
  },
};
```

## Performance Tips

1. **Use Stream Copy When Possible**
   - For trim operations: use `-c copy` instead of re-encoding
   - Saves 10-100x processing time

2. **Hardware Acceleration**
   - Use GPU encoding: `-c:v h264_nvenc` (NVIDIA)
   - Use GPU encoding: `-c:v h264_videotoolbox` (macOS)

3. **Parallel Processing**
   - Process multiple files in queue
   - Use worker pool for concurrent requests

4. **Caching**
   - Cache transcripts
   - Cache summaries
   - Implement LRU for recent conversions

## Development Workflow

### Phase 1: Core Conversions (DONE)
- [x] MP4 to MP3
- [x] MOV to MP4
- [x] AVI to MP4
- [x] Mute Video
- [x] Extract Audio

### Phase 2: Compression & Web Formats (Ready)
- [ ] Compress Video
- [ ] Video to GIF
- [ ] MP4 to WebM

### Phase 3: Transcription (Ready)
- [ ] Audio to Text
- [ ] Video to Text
- [ ] YouTube to Text

### Phase 4: Downloaders (Ready)
- [ ] TikTok Download
- [ ] Instagram Download
- [ ] Twitter Download

### Phase 5: Summarization (Ready)
- [ ] Summarize Podcast
- [ ] Add Subtitles
- [ ] YouTube Transcript

## API Examples

### Convert MP4 to MP3

```javascript
const formData = new FormData();
formData.append('tool', 'mp4-to-mp3');
formData.append('file', mp4File);
formData.append('audioQuality', '2');

const response = await fetch('/api/media', {
  method: 'POST',
  body: formData,
});

const mp3File = await response.blob();
```

### Transcribe Audio

```javascript
const formData = new FormData();
formData.append('tool', 'audio-to-text');
formData.append('file', audioFile);
formData.append('language', 'en');
formData.append('outputFormat', 'srt');

const response = await fetch('/api/media', {
  method: 'POST',
  body: formData,
});

const { content } = await response.json();
```

### Download from TikTok

```javascript
const formData = new FormData();
formData.append('tool', 'tiktok-video-download');
formData.append('url', 'https://www.tiktok.com/@user/video/123456');

const response = await fetch('/api/media', {
  method: 'POST',
  body: formData,
});

const videoFile = await response.blob();
```

## Monitoring & Logging

Check Python process logs:
```bash
# Real-time FFmpeg processing
tail -f /tmp/ffmpeg_debug.log

# Example: Enable verbose FFmpeg
python media_router.py convert mp4-to-mp3 input.mp4 '{}' 2>&1 | tee debug.log
```

## Next Steps

1. ✅ **Architecture**: Modular 5-engine design
2. ✅ **Frontend**: Dynamic page with tool registry
3. ✅ **Backend**: Python engines with FFmpeg
4. ⏭️ **Testing**: Unit tests for each engine
5. ⏭️ **Optimization**: Performance tuning & caching
6. ⏭️ **Deployment**: Docker containerization
7. ⏭️ **Monitoring**: Error tracking & analytics

## Support

For issues:
1. Check console errors in browser DevTools
2. Check Python stderr output
3. Verify FFmpeg installation
4. Test with simple files first (small MP4, WAV)

## License

Same as main TinyTools project
