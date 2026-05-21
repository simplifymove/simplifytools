# Phase 5 Admin Dashboard Manual Verification Script (Windows PowerShell)
# Run this script to verify the complete admin dashboard workflow
# 
# Prerequisites:
# - Development server running on localhost:3000
# - Authenticated session (requires manual Google OAuth login first)
# - curl installed (Windows 10+ has curl, or use Invoke-WebRequest)
#
# Usage: .\verify-admin-dashboard.ps1

Write-Host "?? Phase 5 Admin Dashboard Verification Script (Windows)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Test counter
$passed = 0
$failed = 0

# Helper function for test results
function Test-Result {
    param(
        [int]$code,
        [string]$message
    )
    if ($code -eq 0) {
        Write-Host "? PASS: $message" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host "? FAIL: $message" -ForegroundColor Red
        $script:failed++
    }
}

Write-Host "1. SECURITY TESTS" -ForegroundColor Blue
Write-Host "=================" -ForegroundColor Blue
Write-Host ""

# Test 1: Public page accessible
Write-Host "Testing public landing page..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Test-Result 0 "Public page loads (HTTP 200)"
    } else {
        Test-Result 1 "Public page loads (got HTTP $($response.StatusCode))"
    }
} catch {
    Test-Result 1 "Failed to access public page: $_"
}
Write-Host ""

# Test 2: Unauthenticated access to admin redirects to signin
Write-Host "Testing unauthenticated admin access..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/admin/audit-testing" -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop
    if ($response.StatusCode -in 302, 307) {
        Test-Result 0 "Admin route redirects unauthenticated users"
        $location = $response.Headers['Location']
        if ($location -like "*signin*") {
            Test-Result 0 "Redirect target is signin page"
        } else {
            Test-Result 1 "Should redirect to signin page (got: $location)"
        }
    } else {
        Test-Result 1 "Admin route should redirect (got HTTP $($response.StatusCode))"
    }
} catch {
    if ($_.Exception.Response.StatusCode -in 302, 307) {
        Test-Result 0 "Admin route redirects unauthenticated users"
    } else {
        Test-Result 1 "Error checking admin route redirect: $_"
    }
}
Write-Host ""

# Test 3: API requires authentication
Write-Host "Testing API authentication..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/audit/run" `
        -Method POST `
        -ContentType "application/json" `
        -Body '{"categories":["pdf"]}' `
        -UseBasicParsing `
        -ErrorAction Stop
    Test-Result 1 "API should require authentication (got 200)"
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Test-Result 0 "POST /api/admin/audit/run returns 403 without auth"
    } else {
        Test-Result 1 "POST should return 403 (got HTTP $($_.Exception.Response.StatusCode))"
    }
}
Write-Host ""

Write-Host "2. COMPONENT VERIFICATION" -ForegroundColor Blue
Write-Host "===========================" -ForegroundColor Blue
Write-Host ""

# Check if Playwright is installed
if (Test-Path "node_modules\.bin\playwright.cmd") {
    Test-Result 0 "Playwright installed"
} else {
    Test-Result 1 "Playwright not installed"
}

# Check if Prisma Client is generated
if (Test-Path "node_modules\.prisma" -PathType Container) {
    Test-Result 0 "Prisma Client generated"
} else {
    Test-Result 1 "Prisma Client not generated"
}
Write-Host ""

Write-Host "3. FILE STRUCTURE VERIFICATION" -ForegroundColor Blue
Write-Host "=============================" -ForegroundColor Blue
Write-Host ""

$files = @(
    "app/admin/layout.tsx",
    "app/admin/audit-testing/page.tsx",
    "app/api/admin/audit/run/route.ts",
    "app/api/admin/audit/reports/route.ts",
    "lib/hooks/useAuditAPI.ts",
    "lib/auth/admin.ts",
    "tests/pdf-tools/test-helpers.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Test-Result 0 "File exists: $file"
    } else {
        Test-Result 1 "File missing: $file"
    }
}

Write-Host ""
Write-Host "4. MANUAL TESTING CHECKLIST" -ForegroundColor Blue
Write-Host "===========================" -ForegroundColor Blue
Write-Host ""
Write-Host "After running automated tests, verify these manually:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Step 1: Admin Login"
Write-Host "  - Open http://localhost:3000/admin/audit-testing"
Write-Host "  - Click Sign In with Google"
Write-Host "  - Verify dashboard loads"
Write-Host ""
Write-Host "Step 2: Dashboard UI"
Write-Host "  - Category checkboxes visible"
Write-Host "  - Select All button works"
Write-Host "  - Clear All button works"
Write-Host "  - Run Tests button initially enabled"
Write-Host ""
Write-Host "Step 3: Run Tests"
Write-Host "  - Select pdf category and click Run Selected Tests"
Write-Host "  - Progress card appears with updating stats"
Write-Host ""

Write-Host "==================== SUMMARY ====================" -ForegroundColor Cyan
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

if ($failed -eq 0) {
    Write-Host "? All automated tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "? Some tests failed. Review output above." -ForegroundColor Red
    exit 1
}
