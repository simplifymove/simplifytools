#!/usr/bin/env powershell
# Tesseract OCR Setup Script for Windows

param()

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Tesseract OCR Project Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$version = "5.3.3"
$toolsDir = "tools"
$installerName = "tesseract-ocr-w64-setup-v$version.exe"
$installerPath = Join-Path $toolsDir $installerName

# Create tools directory
if (-not (Test-Path $toolsDir)) {
    Write-Host "Creating tools directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $toolsDir | Out-Null
}

Write-Host "Downloading Tesseract OCR v$version..." -ForegroundColor Yellow

$url = "https://github.com/UB-Mannheim/tesseract/releases/download/v$version/$installerName"

$ProgressPreference = 'SilentlyContinue'

try {
    Invoke-WebRequest -Uri $url -OutFile $installerPath -ErrorAction Stop
    Write-Host "✓ Download complete!" -ForegroundColor Green
    Write-Host "  File: $installerPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Double-click: $installerPath" -ForegroundColor White
    Write-Host "2. Or run: ./$installerPath" -ForegroundColor White
    Write-Host "3. Install to: C:\Program Files\Tesseract-OCR" -ForegroundColor White
    Write-Host "4. Restart your development server" -ForegroundColor White
} catch {
    Write-Host "✗ Download failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual installation:" -ForegroundColor Yellow
    Write-Host "Visit: https://github.com/UB-Mannheim/tesseract/releases" -ForegroundColor Cyan
    Write-Host "Download: $installerName and run it" -ForegroundColor Cyan
}
