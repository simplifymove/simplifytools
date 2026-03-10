@echo off
REM Phase 2 Dependencies Automatic Installer for Windows
REM Run as Administrator

cls
echo.
echo ════════════════════════════════════════════════════════════════
echo    Phase 2 Image Tools - Windows Dependencies Installer
echo ════════════════════════════════════════════════════════════════
echo.

REM Check if running as admin
openfiles >nul 2>&1
if errorlevel 1 (
    echo ERROR: This script must be run as Administrator
    echo Please right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

REM Check if winget exists
where winget >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Windows Package Manager (winget) found
) else (
    echo [WARNING] winget not found
    echo Please visit: https://learn.microsoft.com/windows/package-manager/winget/
    pause
    exit /b 1
)

echo.
echo Checking current installations...
echo.

REM Check Tesseract
where tesseract >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Tesseract OCR
) else (
    echo [MISSING] Tesseract OCR
    echo Installing Tesseract...
    winget install -e --id UB-Mannheim.TesseractOCR -y
)

REM Check Poppler
where pdftoppm >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Poppler
) else (
    echo [MISSING] Poppler
    echo Installing Poppler...
    winget install -e --id oschwartz10612.poppler -y
)

REM Check ImageMagick
where convert >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] ImageMagick
) else (
    echo [MISSING] ImageMagick
    echo Installing ImageMagick...
    winget install -e --id ImageMagick.ImageMagick -y
)

REM Check LibreOffice
where soffice >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] LibreOffice
) else (
    echo [MISSING] LibreOffice
    echo Installing LibreOffice...
    winget install -e --id TheDocumentFoundation.LibreOffice -y
)

echo.
echo ════════════════════════════════════════════════════════════════
echo Installation complete!
echo ════════════════════════════════════════════════════════════════
echo.
echo IMPORTANT: Please restart PowerShell for PATH changes to take effect
echo.
echo Next steps:
echo   1. Close all PowerShell windows
echo   2. Open a NEW PowerShell window
echo   3. Run: npm run dev
echo   4. Test converters at: http://localhost:3000/tools/converters
echo.
pause
