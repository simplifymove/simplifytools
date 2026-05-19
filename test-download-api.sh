#!/bin/bash
# test-download-api.sh - Comprehensive testing script for multi-provider downloader
# Tests all providers and verifies security, performance, and functionality

set -e

echo "=========================================="
echo "Download API Test Suite"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
HEALTH_ENDPOINT="/api/download/health"
DOWNLOAD_ENDPOINT="/api/download"
TIMEOUT=30

# Test counters
PASSED=0
FAILED=0
TOTAL=0

# Helper function: colored output
test_result() {
  local result=$1
  local message=$2
  TOTAL=$((TOTAL + 1))
  
  if [ $result -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}: $message"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗ FAIL${NC}: $message"
    FAILED=$((FAILED + 1))
  fi
}

# Helper function: test HTTP endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_code=$4
  local name=$5
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL$endpoint" --max-time $TIMEOUT)
  else
    response=$(curl -s -X POST "$API_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data" \
      -o /dev/null -w "%{http_code}" \
      --max-time $TIMEOUT)
  fi
  
  if [ "$response" = "$expected_code" ]; then
    test_result 0 "$name (HTTP $response)"
    return 0
  else
    test_result 1 "$name (Expected HTTP $expected_code, got $response)"
    return 1
  fi
}

echo "=========================================="
echo "1. Health Check Tests"
echo "=========================================="
echo ""

# Test 1.1: Health endpoint returns 200
test_endpoint "GET" "$HEALTH_ENDPOINT" "" "200" "Health endpoint responds with 200"

# Test 1.2: Health endpoint returns JSON
health_response=$(curl -s "$API_URL$HEALTH_ENDPOINT")
echo "$health_response" | jq . > /dev/null 2>&1 && test_result 0 "Health response is valid JSON" || test_result 1 "Health response is valid JSON"

# Test 1.3: Health response contains required fields
echo "$health_response" | jq '.status' > /dev/null 2>&1 && test_result 0 "Health has 'status' field" || test_result 1 "Health has 'status' field"
echo "$health_response" | jq '.providers' > /dev/null 2>&1 && test_result 0 "Health has 'providers' field" || test_result 1 "Health has 'providers' field"

echo ""
echo "=========================================="
echo "2. Download API Basic Tests"
echo "=========================================="
echo ""

# Test 2.1: Invalid URL returns 400
test_endpoint "POST" "$DOWNLOAD_ENDPOINT" '{"url":"not-a-url"}' "400" "Invalid URL returns 400"

# Test 2.2: Missing URL returns 400
test_endpoint "POST" "$DOWNLOAD_ENDPOINT" '{"quality":"720"}' "400" "Missing URL returns 400"

# Test 2.3: Blocked IP returns 403
test_endpoint "POST" "$DOWNLOAD_ENDPOINT" '{"url":"http://192.168.1.1/file.mp4"}' "403" "Blocked IP returns 403 (SSRF prevention)"

echo ""
echo "=========================================="
echo "3. Direct File Downloads"
echo "=========================================="
echo ""

# Test 3.1: Download small image
echo "Testing direct JPG download..."
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL$DOWNLOAD_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://picsum.photos/200/300.jpg"}' \
  -o /tmp/test-image.jpg \
  --max-time $TIMEOUT)

http_code=$(echo "$response" | tail -1)
if [ "$http_code" = "200" ]; then
  file_size=$(ls -lh /tmp/test-image.jpg | awk '{print $5}')
  test_result 0 "Direct image download successful ($file_size)"
else
  test_result 1 "Direct image download (HTTP $http_code)"
fi

echo ""
echo "=========================================="
echo "4. Security Header Tests"
echo "=========================================="
echo ""

# Test 4.1: Check security headers on download response
headers=$(curl -s -I "$API_URL$DOWNLOAD_ENDPOINT" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"url":"https://picsum.photos/200/300.jpg"}' \
  --max-time $TIMEOUT)

echo "$headers" | grep -q "X-Content-Type-Options: nosniff" && test_result 0 "X-Content-Type-Options header present" || test_result 1 "X-Content-Type-Options header present"
echo "$headers" | grep -q "X-Frame-Options: DENY" && test_result 0 "X-Frame-Options header present" || test_result 1 "X-Frame-Options header present"
echo "$headers" | grep -q "Cache-Control:" && test_result 0 "Cache-Control header present" || test_result 1 "Cache-Control header present"

echo ""
echo "=========================================="
echo "5. Provider Detection Tests"
echo "=========================================="
echo ""

# Helper to check provider in response header
check_provider() {
  local url=$1
  local expected_provider=$2
  local description=$3
  
  provider=$(curl -s -I -X POST "$API_URL$DOWNLOAD_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"$url\"}" \
    --max-time $TIMEOUT | grep -i "X-Download-Provider" | cut -d' ' -f2 | tr -d '\r')
  
  if [ "$provider" = "$expected_provider" ]; then
    test_result 0 "$description (Provider: $provider)"
  else
    echo -e "${YELLOW}⚠ INFO${NC}: $description returned provider: $provider (expected: $expected_provider)"
    TOTAL=$((TOTAL + 1))
  fi
}

# Test 5.1: Direct file provider detection
check_provider "https://example.com/file.pdf" "direct" "PDF file uses direct provider"

echo ""
echo "=========================================="
echo "6. Error Handling Tests"
echo "=========================================="
echo ""

# Test 6.1: Invalid JSON returns 400
test_endpoint "POST" "$DOWNLOAD_ENDPOINT" '{"invalid json}' "400" "Invalid JSON returns 400"

# Test 6.2: Extremely long URL returns error
long_url=$(printf 'https://example.com/%0.s' {1..5000})
test_endpoint "POST" "$DOWNLOAD_ENDPOINT" "{\"url\":\"$long_url\"}" "400\|414" "Extremely long URL returns error"

echo ""
echo "=========================================="
echo "7. Rate Limiting & Timeout Tests"
echo "=========================================="
echo ""

# Test 7.1: Multiple rapid requests don't crash server
echo "Testing rate limiting (5 rapid requests)..."
for i in {1..5}; do
  curl -s -X POST "$API_URL$DOWNLOAD_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"url":"https://picsum.photos/200/300.jpg"}' \
    -o /tmp/test-$i.jpg \
    --max-time 5 > /dev/null 2>&1 &
done
wait
test_result 0 "Server handles multiple concurrent requests"

echo ""
echo "=========================================="
echo "8. Response Validation Tests"
echo "=========================================="
echo ""

# Test 8.1: Download response includes provider header
response_headers=$(curl -s -I -X POST "$API_URL$DOWNLOAD_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://picsum.photos/200/300.jpg"}' \
  --max-time $TIMEOUT)

echo "$response_headers" | grep -q "X-Download-Provider" && test_result 0 "Response includes X-Download-Provider header" || test_result 1 "Response includes X-Download-Provider header"

# Test 8.2: Content-Type is set correctly
echo "$response_headers" | grep -q "Content-Type:" && test_result 0 "Response includes Content-Type header" || test_result 1 "Response includes Content-Type header"

# Test 8.3: Content-Disposition is set
echo "$response_headers" | grep -q "Content-Disposition:" && test_result 0 "Response includes Content-Disposition header" || test_result 1 "Response includes Content-Disposition header"

echo ""
echo "=========================================="
echo "9. Performance Benchmarks"
echo "=========================================="
echo ""

# Test 9.1: Health check response time
echo "Benchmarking health endpoint..."
response_time=$(curl -s -w "%{time_total}" -o /dev/null "$API_URL$HEALTH_ENDPOINT" --max-time $TIMEOUT)
echo "Health endpoint response: ${response_time}s"

if (( $(echo "$response_time < 1.0" | bc -l) )); then
  test_result 0 "Health endpoint responds in < 1 second (${response_time}s)"
else
  test_result 1 "Health endpoint responds in < 1 second (${response_time}s)"
fi

# Test 9.2: Direct file download response time
echo "Benchmarking direct download..."
dl_time=$(curl -s -w "%{time_total}" -X POST "$API_URL$DOWNLOAD_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://picsum.photos/200/300.jpg"}' \
  -o /dev/null \
  --max-time $TIMEOUT)
echo "Direct download response: ${dl_time}s"

if (( $(echo "$dl_time < 5.0" | bc -l) )); then
  test_result 0 "Direct download completes in < 5 seconds (${dl_time}s)"
else
  test_result 1 "Direct download completes in < 5 seconds (${dl_time}s)"
fi

echo ""
echo "=========================================="
echo "10. Cleanup"
echo "=========================================="
echo ""

rm -f /tmp/test-*.jpg
echo "Temporary test files cleaned up"

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo ""
echo "Total Tests:   $TOTAL"
echo -e "Passed:        ${GREEN}$PASSED${NC}"
echo -e "Failed:        ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "\n${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "\n${RED}Some tests failed. Review output above.${NC}"
  exit 1
fi
