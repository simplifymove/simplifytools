# Universal File Downloader Setup Guide

## Overview

The **Save From Online** tool allows users to download files from any URL, including:
- **Social Media**: YouTube, TikTok, Instagram, Facebook, Twitter, Vimeo, Dailymotion
- **Direct Links**: Videos, images, PDFs, documents, audio files, archives
- **All Formats**: MP4, MKV, WebM, JPG, PNG, PDF, DOCX, PPTX, ZIP, and more

## Features

✅ Download videos from social media platforms  
✅ Download images from any source  
✅ Download documents (PDF, Word, PowerPoint, Excel)  
✅ Download audio files  
✅ Download archives and compressed files  
✅ Support for any direct file URL  
✅ File size and format detection  
✅ Progress indication  
✅ No account or registration required  

## Installation & Setup

### 1. Basic Setup (Direct File Downloads)

The basic API supports downloading any file from a direct URL without additional dependencies:

```bash
# No additional setup needed - works out of the box
npm run dev
```

### 2. Advanced Setup (Social Media Downloads)

For downloading from social media platforms, install `yt-dlp`:

#### Option A: Using pip (Python)

```bash
# Install yt-dlp
pip install yt-dlp

# Verify installation
yt-dlp --version
```

#### Option B: Using npm

```bash
# Install yt-dlp via npm
npm install -g yt-dlp
```

#### Option C: Using brew (macOS)

```bash
brew install yt-dlp
```

#### Option D: Using chocolatey (Windows)

```powershell
choco install yt-dlp
```

### 3. Verify Installation

```bash
# Test yt-dlp
yt-dlp --version

# Test with a sample URL (this will download a small video)
yt-dlp "https://www.youtube.com/watch?v=dQw4w9WgXcQ" -o "test.%(ext)s"
```

## API Endpoint

### Endpoint: POST `/api/download`

**Request:**
```json
{
  "url": "https://youtube.com/watch?v=... or any file URL"
}
```

**Success Response (200):**
```json
{
  "fileName": "video.mp4",
  "fileSize": "45.2 MB",
  "fileType": "video/mp4",
  "downloadUrl": "data:video/mp4;base64,..."
}
```

**Error Response (400/500):**
```json
{
  "error": "Descriptive error message"
}
```

## File Size Limits

- **Maximum file size**: 100 MB
- Files larger than this limit will be rejected
- To modify the limit, edit `/app/api/download/route.ts` line ~120:

```typescript
const maxSize = 100 * 1024 * 1024; // Change this value (in bytes)
```

## Supported Platforms

### Social Media (requires yt-dlp)
- YouTube
- TikTok
- Instagram
- Facebook
- Twitter/X
- Vimeo
- Dailymotion
- Reddit
- And many more...

### Direct Downloads (no setup required)
- Any file with a direct HTTP/HTTPS URL
- Google Drive shared files
- Dropbox shared files
- OneDrive shared files
- And any other cloud storage with direct links

## Supported File Formats

### Video Formats
- MP4, WebM, MKV, MOV, AVI, FLV, WMV, 3GP

### Image Formats
- JPG, PNG, GIF, WebP, BMP, SVG, TIFF, ICO

### Document Formats
- PDF, DOCX, DOC, PPTX, PPT, XLSX, XLS, CSV, TXT

### Audio Formats
- MP3, WAV, M4A, AAC, FLAC, OGG, WMA, OPUS

### Archive Formats
- ZIP, RAR, 7Z, TAR, GZ, BZ2, ISO

## Environment Variables

Add to `.env.local` if needed:

```env
# Optional: Customize temp directory for downloads
DOWNLOAD_TEMP_DIR=/path/to/temp

# Optional: Set file size limit (in MB)
DOWNLOAD_MAX_SIZE=100
```

## Frontend Component

Located at: `/app/all-tools/video-tools/universal-downloader/page.tsx`

### Features:
- URL input field with placeholder examples
- Supported platforms list
- Supported file types list
- Real-time status updates
- File information display
- Auto-download trigger
- Error messaging with hints

## Backend API

Located at: `/app/api/download/route.ts`

### Key Functions:
- `downloadWithYtDlp()`: Uses yt-dlp to fetch social media content
- `downloadDirectFile()`: Direct HTTP download for regular URLs
- `getFileName()`: Extracts filename or generates one
- `formatFileSize()`: Converts bytes to readable format
- `isSocialMediaUrl()`: Detects social media platforms

## Usage Examples

### Example 1: Download YouTube Video
```
URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
Result: rickroll.mp4 (downloads the video)
```

### Example 2: Download Image
```
URL: https://example.com/image.jpg
Result: image.jpg (downloads the image)
```

### Example 3: Download PDF
```
URL: https://file.example.com/document.pdf
Result: document.pdf (downloads the PDF)
```

### Example 4: Download from Instagram
```
URL: https://www.instagram.com/reel/ABC123DEF/
Result: instagram.mp4 (downloads the video)
```

## Troubleshooting

### Issue: "yt-dlp is not installed"
**Solution:** Install yt-dlp using one of the methods above

### Issue: "Social media downloads failing but direct links work"
**Solution:** 
1. Verify yt-dlp is installed: `yt-dlp --version`
2. Try the URL directly in terminal: `yt-dlp "URL"`
3. If that fails, the platform may have anti-scraping measures

### Issue: "File size exceeds 100MB limit"
**Solution:** 
1. The file is too large
2. Contact admin to increase limit
3. Use video converter to reduce quality first

### Issue: "Download took too long"
**Solution:**
1. Check your internet connection
2. Try a smaller file/different source
3. Server timeout is set to 30 seconds

### Issue: "Invalid URL format"
**Solution:**
1. Ensure URL starts with `http://` or `https://`
2. Check for typos in the URL
3. Ensure the URL is publicly accessible

## Performance Optimization

### For Large Files:
```typescript
// Adjust timeout in route.ts
timeout: 60000, // Increase to 60 seconds
```

### For Better Memory Usage:
```typescript
// Stream large files instead of buffering
// (can be implemented in advanced version)
```

## Security Considerations

1. **Copyright Warning**: Users are responsible for respecting copyright
2. **URL Validation**: All URLs are validated before processing
3. **File Size Limits**: Enforced to prevent abuse
4. **No Storage**: Files are processed in memory/temp, not permanently stored
5. **User-Agent**: Mimics browser to bypass some protections

## Advanced Features (Future)

- [ ] Batch downloads
- [ ] Resume interrupted downloads
- [ ] Selective quality/resolution selection
- [ ] Subtitle extraction
- [ ] Format conversion on download
- [ ] Scheduled downloads
- [ ] Download history tracking
- [ ] API rate limiting

## Testing

### Manual Testing:
```bash
# Test Direct Download
curl -X POST http://localhost:3000/api/download \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/file.pdf"}'

# Test Social Media (requires yt-dlp)
curl -X POST http://localhost:3000/api/download \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=..."}'
```

## Support & License

For issues or feature requests, please contact the development team.

---

**Last Updated**: April 2026  
**Version**: 1.0
