#!/bin/bash
# Phase 5 Admin Dashboard Manual Verification Script
# Run this script to verify the complete admin dashboard workflow
# 
# Prerequisites:
# - Development server running on localhost:3000
# - Authenticated session (requires manual Google OAuth login first)
# - curl installed
#
# Usage: bash verify-admin-dashboard.sh

echo "🚀 Phase 5 Admin Dashboard Verification Script"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function for test results
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((FAILED++))
    fi
}

echo -e "${BLUE}1. SECURITY TESTS${NC}"
echo "==================="
echo ""

# Test 1: Public page accessible
echo "Testing public landing page..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "200" ]; then
    test_result 0 "Public page loads (HTTP 200)"
else
    test_result 1 "Public page loads (got HTTP $HTTP_CODE)"
fi
echo ""

# Test 2: Unauthenticated access to admin redirects to signin
echo "Testing unauthenticated admin access..."
RESPONSE=$(curl -s -i http://localhost:3000/admin/audit-testing 2>/dev/null | grep -E "^(HTTP|Location)")
if echo "$RESPONSE" | grep -q "307\|302"; then
    test_result 0 "Admin route redirects unauthenticated users"
else
    test_result 1 "Admin route should redirect (got: $RESPONSE)"
fi
if echo "$RESPONSE" | grep -q "Location: .*signin"; then
    test_result 0 "Redirect target is signin page"
else
    test_result 1 "Should redirect to signin page"
fi
echo ""

# Test 3: API requires authentication
echo "Testing API authentication..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3000/api/admin/audit/run \
  -H "Content-Type: application/json" \
  -d '{"categories":["pdf"]}')
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "403" ]; then
    test_result 0 "POST /api/admin/audit/run returns 403 without auth"
else
    test_result 1 "POST should return 403 (got HTTP $HTTP_CODE)"
fi

if echo "$BODY" | grep -q "Unauthorized"; then
    test_result 0 "Error message indicates unauthorized access"
else
    test_result 1 "Should return unauthorized error message"
fi
echo ""

# Test 4: Reports endpoint requires authentication
echo "Testing reports endpoint security..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3000/api/admin/audit/reports)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "403" ]; then
    test_result 0 "GET /api/admin/audit/reports returns 403 without auth"
else
    test_result 1 "GET reports should return 403 (got HTTP $HTTP_CODE)"
fi
echo ""

echo -e "${BLUE}2. SCHEMA VERIFICATION${NC}"
echo "========================"
echo ""

# Test 5: Check if migration tables exist (if connected to DB)
echo "Note: Database table verification requires authenticated session"
echo "To verify database persistence manually:"
echo "  1. Login with raghavaboyidi@gmail.com"
echo "  2. Click 'Run Selected Tests' with 'pdf' category"
echo "  3. Query database:"
echo "    SELECT * FROM \"AuditRun\" ORDER BY \"createdAt\" DESC LIMIT 1;"
echo "    SELECT COUNT(*) FROM \"AuditTestResult\" WHERE \"auditRunId\" = '<runId>';"
echo ""

echo -e "${BLUE}3. BUILD & DEPLOYMENT VERIFICATION${NC}"
echo "===================================="
echo ""

# Check if build directory exists
if [ -d ".next" ]; then
    test_result 0 "Next.js build directory exists (.next/)"
else
    test_result 1 "Build directory missing - run 'npm run build' first"
fi

# Check package.json for test scripts
if grep -q '"test:pdf-tools"' package.json; then
    test_result 0 "Test scripts added to package.json"
else
    test_result 1 "Test scripts missing from package.json"
fi

# Check if Playwright is installed
if npm list @playwright/test > /dev/null 2>&1; then
    test_result 0 "Playwright is installed"
else
    test_result 1 "Playwright not installed - run 'npm install' first"
fi

# Check if Prisma Client is generated
if [ -d "node_modules/.prisma" ]; then
    test_result 0 "Prisma Client generated"
else
    test_result 1 "Prisma Client not generated - run 'npx prisma generate' first"
fi

echo ""
echo -e "${BLUE}4. FILE STRUCTURE VERIFICATION${NC}"
echo "==============================="
echo ""

# Check if key files exist
FILES=(
    "app/admin/layout.tsx"
    "app/admin/audit-testing/page.tsx"
    "app/api/admin/audit/run/route.ts"
    "app/api/admin/audit/reports/route.ts"
    "lib/hooks/useAuditAPI.ts"
    "lib/auth/admin.ts"
    "tests/pdf-tools/test-helpers.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        test_result 0 "File exists: $file"
    else
        test_result 1 "File missing: $file"
    fi
done

echo ""
echo -e "${BLUE}5. MANUAL TESTING CHECKLIST${NC}"
echo "============================"
echo ""
echo "After running automated tests, verify these manually:"
echo ""
echo "Step 1: Admin Login"
echo "  [ ] Open http://localhost:3000/admin/audit-testing"
echo "  [ ] Click 'Sign In with Google'"
echo "  [ ] Login with: raghavaboyidi@gmail.com"
echo "  [ ] Verify dashboard loads"
echo ""
echo "Step 2: Dashboard UI"
echo "  [ ] Category checkboxes visible (11 total)"
echo "  [ ] Select All button works"
echo "  [ ] Clear All button works"
echo "  [ ] Run Tests button initially enabled"
echo ""
echo "Step 3: Run Tests"
echo "  [ ] Select 'pdf' category"
echo "  [ ] Click 'Run Selected Tests'"
echo "  [ ] Run Tests button becomes disabled"
echo "  [ ] Progress card appears with updating stats"
echo ""
echo "Step 4: Monitor Execution"
echo "  [ ] Status shows: RUNNING (spinning)"
echo "  [ ] Total tests count increases"
echo "  [ ] Success % updates in real-time"
echo "  [ ] Live updates every 2 seconds"
echo ""
echo "Step 5: Verify Completion"
echo "  [ ] Status changes to: COMPLETED (green)"
echo "  [ ] Progress card shows final counts"
echo "  [ ] Run Tests button becomes enabled again"
echo "  [ ] New report appears in table"
echo ""
echo "Step 6: Verify Non-Admin Access"
echo "  [ ] Logout and login with different email"
echo "  [ ] Navigate to http://localhost:3000/admin/audit-testing"
echo "  [ ] Verify redirect to home page or permission denied"
echo ""
echo "Step 7: Database Verification"
echo "  [ ] Open PostgreSQL client"
echo "  [ ] Query: SELECT * FROM \"AuditRun\" LIMIT 1;"
echo "  [ ] Verify record exists with matching runId"
echo "  [ ] Query: SELECT COUNT(*) FROM \"AuditTestResult\" WHERE \"auditRunId\" = '<id>';"
echo "  [ ] Verify test results saved in database"
echo ""

echo ""
echo "==================== SUMMARY ===================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "==============================================="
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All automated tests passed!${NC}"
    echo "Proceed to manual verification steps above."
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Review output above.${NC}"
    exit 1
fi
