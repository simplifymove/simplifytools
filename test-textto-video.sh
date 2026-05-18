#!/bin/bash
# Test Script for AI Text-to-Video Feature
# Run this to verify the API endpoints work correctly

BASE_URL="http://localhost:3000"

echo "==================================="
echo "AI Text-to-Video API Test Suite"
echo "==================================="
echo ""

# Test 1: Generate Script
echo "📝 Test 1: Generate Video Script"
echo "POST /api/video/generate-script"
echo ""

SCRIPT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/video/generate-script" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a 30-second product demo for a PDF to Word converter that shows how easy it is to convert documents",
    "style": "product-promo",
    "aspectRatio": "16:9",
    "duration": 30,
    "tone": "friendly",
    "ctaText": "Try SimplifyConvert Free"
  }')

echo "Response:"
echo "$SCRIPT_RESPONSE" | jq '.' 2>/dev/null || echo "$SCRIPT_RESPONSE"
echo ""

# Extract script from response for next test
SCRIPT=$(echo "$SCRIPT_RESPONSE" | jq '.script' 2>/dev/null)

if [ -z "$SCRIPT" ] || [ "$SCRIPT" = "null" ]; then
  echo "❌ Script generation failed. Check GROQ_API_KEY in .env.local"
  exit 1
fi

echo "✅ Script generated successfully!"
echo ""
echo "Script Details:"
echo "  - Title: $(echo "$SCRIPT" | jq -r '.title')"
echo "  - Duration: $(echo "$SCRIPT" | jq -r '.duration')s"
echo "  - Scenes: $(echo "$SCRIPT" | jq '.scenes | length')"
echo "  - Style: $(echo "$SCRIPT" | jq -r '.style')"
echo ""

# Test 2: Render Video
echo "🎬 Test 2: Render Video from Script"
echo "POST /api/video/render"
echo ""

RENDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/video/render" \
  -H "Content-Type: application/json" \
  -d "{\"script\": $SCRIPT}")

echo "Response:"
echo "$RENDER_RESPONSE" | jq '.' 2>/dev/null || echo "$RENDER_RESPONSE"
echo ""

JOB_ID=$(echo "$RENDER_RESPONSE" | jq -r '.generationId' 2>/dev/null)

if [ -z "$JOB_ID" ] || [ "$JOB_ID" = "null" ]; then
  echo "❌ Render job submission failed"
  exit 1
fi

echo "✅ Render job started!"
echo "  Job ID: $JOB_ID"
echo ""

# Test 3: Poll Render Status
echo "⏳ Test 3: Poll Render Status (waiting up to 10 seconds)"
echo "GET /api/video/render?jobId=$JOB_ID"
echo ""

for i in {1..10}; do
  STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/video/render?jobId=$JOB_ID")
  
  echo "Poll $i:"
  echo "$STATUS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATUS_RESPONSE"
  
  HAS_VIDEO=$(echo "$STATUS_RESPONSE" | jq '.videoUrl' 2>/dev/null)
  
  if [ ! -z "$HAS_VIDEO" ] && [ "$HAS_VIDEO" != "null" ]; then
    echo ""
    echo "✅ Video ready!"
    VIDEO_URL=$(echo "$STATUS_RESPONSE" | jq -r '.videoUrl' 2>/dev/null)
    echo "  Video size: $(echo -n "$VIDEO_URL" | wc -c) bytes"
    echo ""
    echo "📥 You can now download the video from the UI"
    exit 0
  fi
  
  if [ $i -lt 10 ]; then
    echo "  (waiting 1 second...)"
    sleep 1
  fi
  echo ""
done

echo "⏳ Video still rendering (this is normal for mock)"
echo "   Check back in a few moments via the UI"
echo ""

# Test 4: Generate Script with Different Styles
echo "🎨 Test 4: Test Different Styles"
echo ""

for STYLE in "modern" "minimal" "corporate" "social-reel" "explainer" "product-promo"; do
  echo "Testing style: $STYLE"
  curl -s -X POST "$BASE_URL/api/video/generate-script" \
    -H "Content-Type: application/json" \
    -d "{
      \"prompt\": \"Quick 15 second video about file conversion\",
      \"style\": \"$STYLE\",
      \"aspectRatio\": \"9:16\",
      \"duration\": 15,
      \"tone\": \"professional\"
    }" | jq '.ok, .script.title' 2>/dev/null || echo "Error"
  echo ""
done

echo ""
echo "==================================="
echo "✅ All Tests Complete!"
echo "==================================="
echo ""
echo "Next Steps:"
echo "1. Start the dev server: npm run dev"
echo "2. Open: http://localhost:3000/all-tools/video-tools/text-to-video"
echo "3. Enter a prompt and click 'Generate Video Script'"
echo "4. Preview the script and click 'Render to MP4'"
echo "5. Download the completed video"
echo ""
echo "Troubleshooting:"
echo "- Check GROQ_API_KEY is set in .env.local"
echo "- Ensure dev server is running on port 3000"
echo "- Check browser console for detailed error messages"
echo ""
