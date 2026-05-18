#!/usr/bin/env pwsh
# E2E Integration Test Script
# Tests all critical API endpoints

Write-Host "🧪 E2E Integration Test Suite" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$BaseUrl = "http://localhost:3000"
$TestApiKey = ""  # Will be set after creating test user
$TestMachineId = "test-machine-001"

# Color output helpers
function Test-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Test-Failure {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Test-Pending {
    param([string]$Message)
    Write-Host "⏳ $Message" -ForegroundColor Yellow
}

function Test-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

# Test 1: Health Check
Write-Host "`n📡 Test 1: Health Check" -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Test-Success "GET /api/health returned 200"
        $content = $response.Content | ConvertFrom-Json
        Test-Info "Response: $(($content | ConvertTo-Json -Compress))"
    }
} catch {
    Test-Failure "GET /api/health failed: $($_.Exception.Message)"
}

# Test 2: Get Models
Write-Host "`n🤖 Test 2: Get Models" -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/ai/models" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Test-Success "GET /api/ai/models returned 200"
        $content = $response.Content | ConvertFrom-Json
        Test-Info "Models count: $($content.models.Length)"
    }
} catch {
    Test-Failure "GET /api/ai/models failed: $($_.Exception.Message)"
}

# Test 3: Create Test User
Write-Host "`n👤 Test 3: Create Test User" -ForegroundColor Magenta
Test-Pending "Run: NODE_ENV=development npx ts-node scripts/create-ai-test-user.ts"
Test-Pending "Copy API key and set `$TestApiKey below"

# Test 4: Missing API Key
Write-Host "`n🔐 Test 4: Missing API Key" -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/ai/generate" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"} `
        -Body '{"prompt": "test", "machineId": "test-machine-001"}' `
        -UseBasicParsing -TimeoutSec 5
    Test-Failure "Should have failed with 401"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Test-Success "GET /api/ai/generate without key returned 401"
        $errorContent = $_.Exception.Response.Content.ReadAsString() | ConvertFrom-Json
        Test-Info "Error code: $($errorContent.errorCode)"
    } else {
        Test-Failure "Unexpected status: $($_.Exception.Response.StatusCode)"
    }
}

# Test 5: Invalid API Key
Write-Host "`n🔑 Test 5: Invalid API Key" -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/ai/generate" `
        -Method POST `
        -Headers @{
            "Authorization" = "Bearer invalid_key_xyz"
            "X-Machine-Id" = $TestMachineId
            "Content-Type" = "application/json"
        } `
        -Body '{"prompt": "test", "machineId": "test-machine-001"}' `
        -UseBasicParsing -TimeoutSec 5
    Test-Failure "Should have failed with 401"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Test-Success "Invalid API key returned 401"
        $errorContent = $_.Exception.Response.Content.ReadAsString() | ConvertFrom-Json
        Test-Info "Error code: $($errorContent.errorCode)"
    } else {
        Test-Failure "Unexpected status: $($_.Exception.Response.StatusCode)"
    }
}

# Test 6: Missing machineId
Write-Host "`n📍 Test 6: Missing Machine ID" -ForegroundColor Magenta
if ($TestApiKey -eq "") {
    Test-Pending "Skipping - test API key not set"
} else {
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/api/ai/generate" `
            -Method POST `
            -Headers @{
                "Authorization" = "Bearer $TestApiKey"
                "Content-Type" = "application/json"
            } `
            -Body '{"prompt": "test"}' `
            -UseBasicParsing -TimeoutSec 5
        Test-Failure "Should have failed with 400"
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Test-Success "Missing machineId returned 400"
            $errorContent = $_.Exception.Response.Content.ReadAsString() | ConvertFrom-Json
            Test-Info "Error code: $($errorContent.errorCode)"
        } else {
            Test-Failure "Unexpected status: $($_.Exception.Response.StatusCode)"
        }
    }
}

Write-Host "`n================================`n" -ForegroundColor Cyan
Write-Host "✅ Test suite complete" -ForegroundColor Green
Write-Host "📊 Check results above" -ForegroundColor Cyan
