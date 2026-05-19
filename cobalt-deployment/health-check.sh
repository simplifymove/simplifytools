#!/bin/bash

# Health check script for Cobalt and downloader stack

echo "================================"
echo "Download Stack Health Check"
echo "================================"
echo ""

# Check Docker
echo "1. Docker Status:"
if command -v docker &> /dev/null; then
    echo "   ✓ Docker installed: $(docker --version)"
else
    echo "   ✗ Docker not found"
fi

echo ""

# Check Cobalt container
echo "2. Cobalt Container:"
cd ~/cobalt 2>/dev/null && {
    if docker compose ps cobalt 2>/dev/null | grep -q "running"; then
        echo "   ✓ Container is running"
    else
        echo "   ✗ Container is not running"
    fi
} || echo "   ✗ Cobalt directory not found (~cobalt)"

echo ""

# Check Cobalt API
echo "3. Cobalt API Endpoint:"
if curl -s -f http://localhost:9000/api/json > /dev/null 2>&1; then
    echo "   ✓ API is responding (http://localhost:9000)"
else
    echo "   ✗ API is not responding"
fi

echo ""

# Check yt-dlp (if this is where the app runs)
echo "4. yt-dlp:"
if command -v yt-dlp &> /dev/null; then
    echo "   ✓ Installed: $(yt-dlp --version 2>&1 | head -1)"
elif python3 -m yt_dlp --version &> /dev/null 2>&1; then
    echo "   ✓ Available via Python"
else
    echo "   ⚠ yt-dlp not found (will use fallback providers)"
fi

echo ""

# Check ffmpeg
echo "5. ffmpeg:"
if command -v ffmpeg &> /dev/null; then
    echo "   ✓ Installed: $(ffmpeg -version 2>&1 | head -1)"
else
    echo "   ⚠ ffmpeg not found (may be needed for transcoding)"
fi

echo ""
echo "================================"
echo ""
