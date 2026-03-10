# Automated Phase 2 Dependencies Installer for Windows
# Run with: powershell -ExecutionPolicy Bypass -File install-dependencies.ps1

param(
    [switch]$Auto = $false
)

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Phase 2 Image Tools - Windows Dependencies Installer        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if winget is available
$wingetExists = $null -ne (Get-Command winget -ErrorAction SilentlyContinue)

if ($wingetExists) {
    Write-Host "✓ Windows Package Manager (winget) detected" -ForegroundColor Green
} else {
    Write-Host "⚠ winget not found - attempting alternative methods" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Checking current installations..." -ForegroundColor Cyan
Write-Host ""

# Test each tool
$tools = @(
    @{ name = "Tesseract OCR"; cmd = "tesseract"; check = "--version"; id = "UB-Mannheim.TesseractOCR" },
    @{ name = "Poppler"; cmd = "pdftoppm"; check = "-h"; id = "oschwartz10612.poppler" },
    @{ name = "ImageMagick"; cmd = "convert"; check = "--version"; id = "ImageMagick.ImageMagick" },
    @{ name = "LibreOffice"; cmd = "soffice"; check = "--version"; id = "TheDocumentFoundation.LibreOffice" }
)

$missing = @()

foreach ($tool in $tools) {
    $cmd = $tool.cmd
    $checkArg = $tool.check
    
    $result = & $cmd $checkArg 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ $($tool.name)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $($tool.name) - NOT FOUND" -ForegroundColor Red
        $missing += $tool
    }
}

Write-Host ""

if ($missing.Count -eq 0) {
    Write-Host "✓ All required dependencies are already installed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run: npm run dev"
    Write-Host "  2. Test converters at: http://localhost:3000/tools/converters"
    exit 0
}

Write-Host "Found $($missing.Count) missing tool(s):" -ForegroundColor Yellow
foreach ($tool in $missing) {
    Write-Host "  - $($tool.name)"
}
Write-Host ""

if (-not $Auto) {
    $response = Read-Host "Install with winget? (y/n)"
    if ($response -ne "y") {
        Write-Host "Installation cancelled. See WINDOWS_SETUP_GUIDE.md for manual installation." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Starting installation with winget..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($tool in $missing) {
    Write-Host "Installing $($tool.name)..." -ForegroundColor Yellow
    $output = winget install -e --id $tool.id -y 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Installed" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "  ✗ Installation failed" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Installation complete:" -ForegroundColor Cyan
Write-Host "  Successfully installed: $successCount" -ForegroundColor Green
Write-Host "  Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($failCount -gt 0) {
    Write-Host "⚠ Some installations failed. You may need to install manually." -ForegroundColor Yellow
    Write-Host "See WINDOWS_SETUP_GUIDE.md for manual installation instructions." -ForegroundColor Yellow
}

Write-Host "Please restart PowerShell for PATH updates to take effect." -ForegroundColor Yellow
Write-Host ""
