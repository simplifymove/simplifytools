#!/bin/bash

# Test Cobalt API directly

API_URL="http://localhost:9000/api/json"

echo "Testing Cobalt API at $API_URL"
echo "==============================="
echo ""

# Test 1: YouTube
echo "Test 1: YouTube URL"
echo "-------------------"
YOUTUBE_URL="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$YOUTUBE_URL\",\"vQuality\":\"720\"}" | jq '.' 2>/dev/null || \
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$YOUTUBE_URL\",\"vQuality\":\"720\"}"

echo ""
echo ""

# Test 2: Instagram
echo "Test 2: Instagram URL"
echo "--------------------"
INSTAGRAM_URL="https://www.instagram.com/p/DWYP1byDQ-R/"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$INSTAGRAM_URL\",\"vQuality\":\"720\"}" | jq '.' 2>/dev/null || \
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$INSTAGRAM_URL\",\"vQuality\":\"720\"}"

echo ""
echo ""

# Test 3: TikTok
echo "Test 3: TikTok URL"
echo "------------------"
TIKTOK_URL="https://www.tiktok.com/@mrbeast/video/7427821568335711490"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$TIKTOK_URL\",\"vQuality\":\"720\"}" | jq '.' 2>/dev/null || \
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$TIKTOK_URL\",\"vQuality\":\"720\"}"

echo ""
echo ""
echo "Note: Responses may be large. Use 'jq' to pretty-print JSON responses."
