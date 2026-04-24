# Format Selection UI Integration Guide

## Quick Integration Example

Here's a complete example of how to integrate the format discovery and selection into your UI:

### React Component Example

```typescript
import React, { useState } from 'react';

interface VideoOption {
  label: string;
  formatId: string;
  height?: number;
  ext: string;
  filesize: number | null;
}

interface FormatsResponse {
  title: string;
  thumbnail?: string;
  duration?: number;
  videoOptions: VideoOption[];
  audioOptions: VideoOption[];
}

export function SaveFromOnlineDownloader() {
  const [url, setUrl] = useState('');
  const [formats, setFormats] = useState<FormatsResponse | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Fetch available formats
  const handleFetchFormats = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/download/formats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch formats');
      }

      const data: FormatsResponse = await response.json();
      setFormats(data);
      
      // Auto-select best option
      if (data.videoOptions.length > 0) {
        setSelectedFormat(data.videoOptions[0].formatId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching formats');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Download with selected format
  const handleDownload = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          formatId: selectedFormat || undefined, // Use selected format if available
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition') || '';
      const filename = contentDisposition
        .split('filename=')[1]
        ?.replace(/"/g, '') || 'download.mp4';

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Download from Online</h1>

      {/* URL Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Video URL</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Fetch Formats Button */}
      <button
        onClick={handleFetchFormats}
        disabled={!url || loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg mb-4 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Fetching Formats...' : 'Check Available Formats'}
      </button>

      {/* Format Selection */}
      {formats && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Select Quality
          </label>

          {/* Video Options */}
          {formats.videoOptions.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-2">📹 Video Formats</h3>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {formats.videoOptions.map((option) => (
                  <option key={option.formatId} value={option.formatId}>
                    {option.label}
                    {option.filesize && ` - ${(option.filesize / 1024 / 1024).toFixed(1)}MB`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Audio Options */}
          {formats.audioOptions.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-sm mb-2">🎵 Audio Only</h3>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {formats.audioOptions.map((option) => (
                  <option key={option.formatId} value={option.formatId}>
                    {option.label}
                    {option.filesize && ` - ${(option.filesize / 1024 / 1024).toFixed(1)}MB`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={!url || loading}
        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Downloading...' : 'Download File'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Video Info */}
      {formats && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">{formats.title}</h3>
          {formats.thumbnail && (
            <img
              src={formats.thumbnail}
              alt="Thumbnail"
              className="w-full h-auto rounded"
            />
          )}
          {formats.duration && (
            <p className="text-sm text-gray-600 mt-2">
              Duration: {Math.floor(formats.duration / 60)} minutes
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

## API Flow Diagram

```
User enters URL
      ↓
[Check Available Formats] Button
      ↓
POST /api/download/formats { url }
      ↓
yt-dlp --dump-single-json --no-download
      ↓
Returns videoOptions[] and audioOptions[]
      ↓
User selects format from dropdown
      ↓
[Download File] Button
      ↓
POST /api/download { url, formatId: "selected_format" }
      ↓
yt-dlp -f "selected_format" --merge-output-format mp4
      ↓
File downloaded and saved
```

## Format Selection Examples

### YouTube Examples

**Best Quality (Recommended)**
```json
{
  "label": "Best MP4",
  "formatId": "401+251",
  "height": 2160,
  "ext": "mp4"
}
```
Downloads 2160p video (av1) + best audio (opus) → merged to MP4

**1080p HD**
```json
{
  "label": "1080p MP4",
  "formatId": "399+251",
  "height": 1080,
  "ext": "mp4"
}
```
Downloads 1080p video (h264) + best audio → merged to MP4

**Audio Only (MP3)**
```json
{
  "label": "MP3 - 192k",
  "formatId": "251",
  "ext": "mp3"
}
```
Downloads best audio format only (192kbps)

### Other Platforms

**TikTok, Instagram, etc.**
```json
{
  "label": "Best MP4",
  "formatId": "best",
  "ext": "mp4"
}
```
Uses "best" format (auto-selection)

## Fallback Behavior

If no format is selected:
```typescript
// Default format used
-f "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/best"
```

This automatically:
1. Tries best video + best audio (MP4)
2. Falls back to best video only
3. Falls back to just video + any audio
4. Falls back to best overall

## Error Handling

```typescript
try {
  // Fetch or download
} catch (error) {
  // Show user-friendly message
  if (error.message.includes('timeout')) {
    // "Format fetching timed out"
  } else if (error.message.includes('no formats')) {
    // "Video unavailable or format not supported"
  } else {
    // Generic error message
  }
}
```

## Common Issues

### Issue: Format Not Found on Download
**Cause**: Format list changed between discovery and download (rare)
**Solution**: Re-fetch formats or use default quality

### Issue: Only Audio or Video, Not Both
**Cause**: Format combination failed (ffmpeg issue)
**Solution**: Download audio separately or use different quality

### Issue: Slow Format Discovery
**Cause**: Large video with many formats or slow network
**Solution**: Show progress indicator, increase timeout to 60s

### Issue: Cookies Required
**Cause**: Age-restricted or region-locked content
**Solution**: Configure YTDLP_COOKIES_PATH and include cookies file

## Performance Tips

1. **Cache format lists**: Store formats for 1 hour per URL
2. **Lazy load thumbnails**: Download thumbnail only if user scrolls
3. **Batch downloads**: Allow multiple format selections
4. **Show progress**: Real-time download progress via Content-Length header
5. **Retry logic**: Implement exponential backoff for network errors

---

For more details, see [FORMAT_DISCOVERY.md](FORMAT_DISCOVERY.md)
