# Video Tools API Documentation

## Base URL
```
POST /api/media
```

## Request Format

### Multipart Form Data

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `tool` | string | Yes | Tool slug (e.g., `mp4-to-mp3`) |
| `file` | File | Conditional | File to process (required for file-based tools) |
| `url` | string | Conditional | URL to download from (required for URL-based tools) |
| `[options]` | string | Optional | Tool-specific options as form fields |

## Response Format

### Success - Binary File Output
```http
HTTP/1.1 200 OK
Content-Type: video/mp4
Content-Disposition: attachment; filename="output.mp4"

[binary file data]
```

### Success - Text Output
```json
{
  "content": "transcript text...",
  "type": "text"
}
```

### Error
```json
{
  "error": "Error message description"
}
```

## Supported Tools & Options

### CONVERSIONS (MediaConvertEngine)

#### MP4 to MP3
```
tool: mp4-to-mp3
accepts: [.mp4]
output: .mp3
```
**Options**:
- `audioQuality` (select): `9` (low), `5` (medium), `2` (high) - default: `2`

**Example**:
```bash
curl -X POST http://localhost:3000/api/media \
  -F "tool=mp4-to-mp3" \
  -F "file=@video.mp4" \
  -F "audioQuality=5" \
  --output audio.mp3
```

#### MOV to MP4
```
tool: mov-to-mp4
accepts: [.mov]
output: .mp4
```
**Options**:
- `videoQuality` (select): `low`, `medium`, `high` - default: `medium`

#### MP4 to WAV
```
tool: mp4-to-wav
accepts: [.mp4]
output: .wav
```
**Options**:
- `sampleRate` (select): `16000`, `44100`, `48000` - default: `44100`

#### Additional Conversions
- `mp4-to-avi`, `mp4-to-mov`, `mp4-to-ogg`
- `mov-to-mp3`, `mov-to-avi`, `mov-to-gif`
- `avi-to-mp4`, `avi-to-mp3`, `avi-to-mov`, `avi-to-mkv`, `avi-to-gif`
- `mkv-to-mp4`, `mkv-to-mp3`, `mkv-to-avi`, `mkv-to-mov`, `mkv-to-gif`
- `webm-to-mp4`, `webm-to-mp3`, `webm-to-mov`
- `aac-to-mp3`, `aac-to-wav`, `aac-to-flac`, `aac-to-m4r`, `aac-to-mp4`
- `ogg-to-wav`, `ogg-to-mp3`
- `m4a-to-mp3`, `m4a-to-wav`, `m4a-to-mp4`
- `gif-to-mov`, `gif-to-webp`

### EDITING (MediaEditEngine)

#### Trim Video
```
tool: trim-video
accepts: [.mp4, .mov, .avi, .mkv, .webm]
output: same format
```
**Options**:
- `startTime` (text) **required**: Start time in MM:SS format (e.g., `00:15`)
- `endTime` (text) **required**: End time in MM:SS format (e.g., `00:45`)

**Example**:
```bash
curl -X POST http://localhost:3000/api/media \
  -F "tool=trim-video" \
  -F "file=@video.mp4" \
  -F "startTime=00:10" \
  -F "endTime=00:30" \
  --output trimmed.mp4
```

#### Resize Video
```
tool: resize-video
accepts: [.mp4, .mov, .avi, .mkv, .webm]
output: same format
```
**Options**:
- `width` (number) **required**: Target width in pixels (160-7680)
- `height` (number) **required**: Target height in pixels (120-4320)
- `keepAspect` (checkbox): Keep aspect ratio - default: true

#### Mute Video
```
tool: mute-video
accepts: [.mp4, .mov, .avi, .mkv, .webm]
output: same format
```
**Options**: None

#### Extract Audio from Video
```
tool: extract-audio-from-video
accepts: [.mp4, .mov, .avi, .mkv, .webm, .flv, .m4v]
output: .mp3 (or .wav, .aac)
```
**Options**:
- `outputFormat` (select): `mp3`, `wav`, `aac` - default: `mp3`
- `audioQuality` (select): `9`, `5`, `2` - default: `5`

#### Video to GIF
```
tool: video-to-gif
accepts: [.mp4, .mov, .avi, .mkv, .webm]
output: .gif
```
**Options**:
- `fps` (select): `5`, `10`, `15`, `20` - default: `10`
- `scale` (number): Width in pixels - default: 320

#### Compress Video
```
tool: compress-video
accepts: [.mp4, .mov, .avi, .mkv]
output: .mp4
```
**Options**:
- `preset` (select): `fast`, `medium`, `slow` - default: `medium`
- `crf` (number): Quality 0-51, lower is better - default: 28

#### Video to WebP
```
tool: video-to-webp
accepts: [.mp4, .mov, .avi, .mkv, .webm]
output: .webp
```
**Options**:
- `quality` (number): 0-100 - default: 80

#### Additional Edit Tools
- `compress-mov`, `compress-avi`, `compress-mkv`
- `mov-to-gif`, `avi-to-gif`, `mkv-to-gif`, `mp4-to-gif`
- `mp4-to-webm`
- `add-subtitles`

### TRANSCRIPTION (TranscriptionEngine)

#### Audio to Text
```
tool: audio-to-text
accepts: [.mp3, .wav, .m4a, .aac, .ogg, .flac]
output: text (.txt, .srt, .vtt, or .json)
```
**Options**:
- `language` (select): `en`, `es`, `fr`, `de`, `auto` - default: `en`
- `outputFormat` (select): `text`, `srt`, `vtt`, `json` - default: `text`

**Example**:
```bash
curl -X POST http://localhost:3000/api/media \
  -F "tool=audio-to-text" \
  -F "file=@podcast.mp3" \
  -F "language=en" \
  -F "outputFormat=srt" \
  --output transcript.srt
```

#### Video to Text
```
tool: video-to-text
accepts: [.mp4, .mov, .avi, .mkv, .webm]
output: text
```
**Options**:
- `language` (select): `en`, `es`, `fr`, `de`, `auto` - default: `en`
- `outputFormat` (select): `text`, `srt`, `vtt`, `json` - default: `text`

#### YouTube to Text
```
tool: youtube-to-text
input: URL
output: text
```
**Options**:
- `url` (text) **required**: YouTube video URL
- `language` (select): `en`, `es`, `fr`, `de`, `auto` - default: `en`
- `outputFormat` (select): `text`, `srt`, `vtt`, `json` - default: `text`

**Example**:
```bash
curl -X POST http://localhost:3000/api/media \
  -F "tool=youtube-to-text" \
  -F "url=https://www.youtube.com/watch?v=dQw4w9WgXcQ" \
  -F "outputFormat=vtt"
```

#### YouTube Transcript
```
tool: youtube-transcript
input: URL
output: text
```
**Options**:
- `url` (text) **required**: YouTube URL
- `outputFormat` (select): `text`, `srt`, `vtt` - default: `text`

#### Transcribe Podcast
```
tool: transcribe-podcast
accepts: [.mp3, .m4a, .wav, .ogg]
output: text
```
**Options**:
- `language` (select): `en`, `es`, `auto` - default: `en`
- `outputFormat` (select): `text`, `srt`, `json` - default: `text`

### DOWNLOADS (MediaDownloadEngine)

#### Instagram Download
```
tool: instagram-download
input: URL
output: .mp4
```
**Options**:
- `url` (text) **required**: Instagram URL

#### TikTok Video Download
```
tool: tiktok-video-download
input: URL
output: .mp4
```
**Options**:
- `url` (text) **required**: TikTok URL

#### Twitter Download
```
tool: twitter-download
input: URL
output: .mp4
```
**Options**:
- `url` (text) **required**: Twitter/X URL

#### Facebook Download
```
tool: facebook-download
input: URL
output: .mp4
```
**Options**:
- `url` (text) **required**: Facebook URL

### SUMMARIZATION (SummarizationEngine)

#### Summarize Podcast
```
tool: summarize-podcast
accepts: [.mp3, .m4a, .wav, .ogg]
output: .txt
```
**Options**:
- `summaryType` (select): `mixed`, `detailed`, `bullets` - default: `mixed`

**Example**:
```bash
curl -X POST http://localhost:3000/api/media \
  -F "tool=summarize-podcast" \
  -F "file=@podcast.mp3" \
  -F "summaryType=mixed"
```

**Response** (includes):
- Summary
- Bullet points
- Action items
- Topics covered

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success - file or text returned |
| 400 | Invalid request - missing required field |
| 404 | Tool not found |
| 413 | File too large (max 500MB) |
| 500 | Processing error on server |

## Error Codes

### Validation Errors
```json
{
  "error": "File type not supported. Accepted: .mp4, .mov"
}
```

```json
{
  "error": "File size must be under 500MB. Current: 1024.5MB"
}
```

```json
{
  "error": "Invalid URL format"
}
```

### Processing Errors
```json
{
  "error": "FFmpeg not found. Please install FFmpeg."
}
```

```json
{
  "error": "Failed to extract audio: [ffmpeg error details]"
}
```

## Code Examples

### JavaScript/TypeScript

```typescript
async function convertVideo(file: File, quality: string): Promise<Blob> {
  const formData = new FormData();
  formData.append('tool', 'mp4-to-mp3');
  formData.append('file', file);
  formData.append('audioQuality', quality);

  const response = await fetch('/api/media', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return response.blob();
}

// Usage
const mp4File = document.querySelector('input[type="file"]')?.files?.[0];
if (mp4File) {
  const mp3 = await convertVideo(mp4File, '5');
  const url = URL.createObjectURL(mp3);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'output.mp3';
  a.click();
}
```

### Python

```python
import requests

def convert_video(file_path: str, tool: str) -> bytes:
    with open(file_path, 'rb') as f:
        files = {
            'file': f,
            'tool': (None, tool),
            'audioQuality': (None, '2'),
        }
        response = requests.post(
            'http://localhost:3000/api/media',
            files=files
        )
        response.raise_for_status()
        return response.content

# Usage
mp3_data = convert_video('video.mp4', 'mp4-to-mp3')
with open('output.mp3', 'wb') as f:
    f.write(mp3_data)
```

### cURL

```bash
# MP4 to MP3
curl -X POST http://localhost:3000/api/media \
  -F "tool=mp4-to-mp3" \
  -F "file=@video.mp4" \
  -F "audioQuality=2" \
  --output audio.mp3

# Audio to Text
curl -X POST http://localhost:3000/api/media \
  -F "tool=audio-to-text" \
  -F "file=@podcast.mp3" \
  -F "outputFormat=json" \
  --output transcript.json

# YouTube Transcription
curl -X POST http://localhost:3000/api/media \
  -F "tool=youtube-to-text" \
  -F "url=https://www.youtube.com/watch?v=..." \
  -F "outputFormat=srt" \
  --output transcript.srt
```

## Rate Limiting & Timeout

- **Max file size**: 500 MB
- **Max processing time**: 10 minutes per request
- **Concurrent requests**: Limited by server resources
- **No rate limiting** currently (consider implementing for production)

## Performance Notes

- **Trim operations** use `-c copy` (stream copy) → ~1s per minute of video
- **Convert operations** use H.264 encoding → ~5-30s per minute depending on preset
- **Transcription** with CPU → ~0.5x to 1x real-time (depends on file size)
- **Download operations** → varies by platform and network speed

## Troubleshooting

### "FFmpeg not found"
- Install FFmpeg system-wide
- Verify it's in your PATH: `which ffmpeg` (Mac/Linux) or `where ffmpeg` (Windows)

### "File too large"
- Increase `bodyParser.sizeLimit` in `/app/api/media/route.ts`
- Default: 500MB, can increase to 1GB or more

### Processing timeout
- Increase timeout in `/app/api/media/route.ts`
- Process with simpler options (lower quality/preset)
- Split large files into chunks

### "Whisper model not found"
- First transcription request downloads ~140MB model
- Run: `python -c "from faster_whisper import WhisperModel; WhisperModel('base')"`

## Future Enhancements

- [ ] Batch processing (multiple files)
- [ ] Job queue for large files
- [ ] Real-time progress tracking (WebSocket)
- [ ] Caching of transcripts/conversions
- [ ] GPU acceleration for FFmpeg
- [ ] Advanced scheduling and load balancing
- [ ] Webhook callbacks for async processing
