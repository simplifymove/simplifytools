# Production-Safe Downloader Setup Guide

## Overview

The new `/api/download` endpoint implements a **two-tier fallback architecture** designed for robust video downloading in production environments:

1. **Tier 1 (Primary)**: Local `yt-dlp` with comprehensive YouTube support
2. **Tier 2 (Fallback)**: External downloader API service for cases where local fails

This architecture solves critical production issues:
- ✅ VPS YouTube downloads blocked by bot detection
- ✅ Signature challenges and age verification
- ✅ Rate limiting and account challenges
- ✅ Graceful fallback without downtime

## Architecture Diagram

```
User Request
    ↓
[Try Local yt-dlp]
    ├─ Success → Return file ✓
    └─ Failure → Check error pattern
         ├─ Is fallback error (bot/blocked)? → Yes
         └─ Is YouTube URL? → Yes
         └─ External API enabled? → Yes
              ↓
         [Try External API]
              ├─ Success → Return file ✓
              └─ Failure → Return 502 error
```

## Configuration

### Environment Variables

Add these to `.env.local` (development) or deployment environment:

```bash
# ============================================================================
# LOCAL YT-DLP CONFIGURATION (Required)
# ============================================================================

# Path to Python executable in virtual environment
# Windows: I:\Raghava\Copilot-works\simplifyconvertapp\.venv\Scripts\python.exe
# VPS: /var/www/simplifyconvertapp/venv/bin/python
PYTHON_PATH=<path-to-python>

# Path to YouTube cookies file (optional but recommended)
# Enables downloads from VPS IPs that YouTube flags as suspicious
# Format: Netscape cookies.txt file
# YTDLP_COOKIES_PATH=<path-to-cookies.txt>

# ============================================================================
# EXTERNAL DOWNLOADER API CONFIGURATION (Optional but Recommended)
# ============================================================================

# Enable fallback to external API
DOWNLOADER_API_ENABLED=true|false

# External API endpoint (backend only, never exposed to frontend)
DOWNLOADER_API_URL=https://api.example.com/download

# API authentication key (backend only, never exposed to frontend)
DOWNLOADER_API_KEY=your-secret-api-key-here
```

### Recommended External Services

#### Option 1: RapidAPI Services
1. Visit https://rapidapi.com/
2. Search for "youtube downloader" or "social media downloader"
3. Popular options:
   - **youtube-api** - High reliability, 500 calls/month free
   - **video-downloader-api** - Multiple format support
   - **social-media-downloader** - TikTok, Instagram, Twitter

4. Subscribe to free tier
5. Get API key from dashboard
6. API endpoint format: `https://youtube-api.p.rapidapi.com/...`

#### Option 2: Custom Service
- Deploy your own external downloader service
- Must support same response formats (see below)
- Can use alternative tools (ffmpeg-based, etc.)

## Implementation Details

### Local yt-dlp Configuration

The local downloader uses:
- **JavaScript Runtime**: `--js-runtimes node` - Solves JavaScript challenges on VPS
- **Cookies**: `--cookies` flag - Enables authentication from datacenter IPs
- **Format**: Best video + audio merge: `bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/best`
- **Network**: 
  - Force IPv4: `--force-ipv4`
  - 3 retries with fragment retries
  - 30-second socket timeout
- **User Agent**: Modern Chrome user agent (avoids bot detection)

### Error Pattern Detection

Fallback triggers when local yt-dlp stderr contains:
```
- "sign in to confirm" (age verification)
- "not a bot" (bot challenge)
- "n challenge" (YouTube n-parameter)
- "signature" (video signature challenge)
- "unable to extract" (video data extraction failure)
- "confirm your age" (age gate)
- "login" (authentication required)
- "cookies" (cookie-related issues)
- "403" / "429" / "blocked" (HTTP errors)
```

### External API Response Formats

The implementation supports two response formats from external APIs:

#### Format A: Direct Download URL
```json
{
  "downloadUrl": "https://cdn.example.com/video.mp4",
  "filename": "my-video.mp4",
  "contentType": "video/mp4"
}
```

#### Format B: Base64 Encoded Data
```json
{
  "base64": "AAAA...very-long-base64-string...",
  "filename": "my-video.mp4",
  "contentType": "video/mp4"
}
```

The endpoint automatically detects which format is provided and handles accordingly.

## VPS Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Python 3.8+ with virtual environment
- yt-dlp installed via pip
- (Optional) YouTube cookies file

### Step-by-Step Setup

#### 1. Install Dependencies
```bash
cd /var/www/simplifyconvertapp
source venv/bin/activate
pip install yt-dlp
```

#### 2. Configure Environment Variables
```bash
# Edit .env.local or deployment environment
export PYTHON_PATH=/var/www/simplifyconvertapp/venv/bin/python
export YTDLP_COOKIES_PATH=/var/www/simplifyconvertapp/private/youtube-cookies.txt

# Optional: Enable external API fallback
export DOWNLOADER_API_ENABLED=true
export DOWNLOADER_API_URL=https://your-api.example.com/download
export DOWNLOADER_API_KEY=your-key-here
```

#### 3. Copy YouTube Cookies (Recommended)
```bash
# On local machine, export cookies using browser extension
# Then copy to VPS
scp cookies.txt user@vps:/var/www/simplifyconvertapp/private/youtube-cookies.txt

# Ensure permissions
chmod 600 /var/www/simplifyconvertapp/private/youtube-cookies.txt
```

#### 4. Restart Node.js Application
```bash
# PM2
pm2 restart simplifyconvertapp

# Or manual restart
systemctl restart simplifyconvertapp
```

#### 5. Test Downloads
```bash
# Test local yt-dlp
curl -X POST http://localhost:3000/api/download \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Check logs
tail -f /var/log/simplifyconvertapp/error.log
```

## Monitoring & Troubleshooting

### Log Analysis

Check server logs for provider information:

```bash
# Local yt-dlp succeeded
[download] Local yt-dlp succeeded, file: /tmp/...

# Fallback to external API
[download] Local download failed, attempting fallback to external API

# External API succeeded
[download] Attempting external downloader API

# Both failed
error: Download failed from both local downloader and external provider
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Python path not found" | PYTHON_PATH not set or wrong path | Set correct Python executable path |
| "yt-dlp module not found" | Module not installed in venv | `pip install yt-dlp` |
| "Sign in to confirm" | YouTube bot detection | Add cookies file + `--js-runtimes node` |
| "Unable to extract" | Video unavailable or format changed | Enable external API fallback |
| "Cookies file not found" | Wrong YTDLP_COOKIES_PATH | Verify file path and permissions |
| Fallback never triggers | API not configured | Set DOWNLOADER_API_ENABLED=true |

### Performance Considerations

- **Local Download**: 10-120 seconds (depends on file size)
- **External API**: 20-180 seconds (depends on external service)
- **Timeout**: 300 seconds (5 minutes) for entire operation
- **Temp Files**: Automatically cleaned up after streaming

## Security Considerations

### API Keys
- ✅ External API keys stored in backend environment only
- ✅ Never exposed to frontend or API responses
- ✅ Not logged or included in error messages

### File Handling
- ✅ Filenames sanitized to prevent directory traversal
- ✅ Temp files cleaned up immediately after streaming
- ✅ No persistent storage of downloaded files

### URL Validation
- ✅ Only HTTP/HTTPS URLs accepted
- ✅ Invalid URLs rejected at API boundary

## API Endpoints

### GET /api/download/formats
Fetch available quality tiers for a URL.

**Request:**
```json
{
  "url": "https://youtube.com/watch?v=..."
}
```

**Response:**
```json
[
  {
    "id": "best",
    "format": "mp4",
    "quality": "4K",
    "resolution": "3840x2160",
    "filesize": 3800000000,
    "displayLabel": "MP4 - (3840x2160 4K) - ~3.8GB"
  },
  ...
]
```

### POST /api/download
Download a file from the URL.

**Request:**
```json
{
  "url": "https://youtube.com/watch?v=...",
  "format": "best"  // Optional, uses best if omitted
}
```

**Response:**
```
Binary file stream
Headers:
  - Content-Type: video/mp4 | audio/mpeg
  - Content-Disposition: attachment; filename="..."
  - X-Download-Provider: local_yt_dlp | external_api
```

**Error Response:**
```json
{
  "error": "Download failed from both local downloader and external provider.",
  "localError": "...",
  "externalError": "..."
}
```

## Testing Checklist

- [ ] Local yt-dlp downloads work (no external API needed)
- [ ] YouTube URLs fallback to external API when local fails
- [ ] External API response (downloadUrl format) works
- [ ] External API response (base64 format) works
- [ ] Filename sanitization prevents injection attacks
- [ ] Temp files are cleaned up after download
- [ ] API keys not exposed in responses or logs
- [ ] Format selection dropdown shows all resolutions
- [ ] Download progress works on frontend
- [ ] Build compiles without TypeScript errors

## Deployment Checklist

- [ ] PYTHON_PATH configured for target environment
- [ ] YTDLP_COOKIES_PATH configured (if using cookies)
- [ ] External API credentials set (if using fallback)
- [ ] Application rebuilt and tested locally
- [ ] Deployed to VPS/production
- [ ] Logs monitored for errors
- [ ] Test downloads from different sources
- [ ] Monitor fallback usage patterns

## Future Improvements

1. **Rate Limiting**: Implement request throttling per IP
2. **Caching**: Cache format lists per URL
3. **Analytics**: Track fallback usage and success rates
4. **Multi-fallback**: Support multiple external API services
5. **Retry Logic**: Implement exponential backoff for transient failures
6. **Webhook Notifications**: Alert on repeated failures

## Support Resources

- **yt-dlp**: https://github.com/yt-dlp/yt-dlp
- **Next.js**: https://nextjs.org/docs
- **RapidAPI**: https://rapidapi.com/
- **Project Docs**: See README.md and copilot-instructions.md

---

Last Updated: 2024
Version: 1.0 (Production-Safe with Fallback)
