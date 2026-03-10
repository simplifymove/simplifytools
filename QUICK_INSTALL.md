# ONE-CLICK Installation Guide for Phase 2 Dependencies

This guide provides the fastest way to install all required tools on Windows.

## 🚀 Quick Install (Choose ONE Method)

### Method 1: Windows Package Manager (Recommended if winget works)

Open PowerShell as Administrator and run:

```powershell
# Install each tool individually
winget install -e --id ImageMagick.ImageMagick --accept-source-agreements --accept-package-agreements
winget install -e --id oschwartz10612.poppler --accept-source-agreements --accept-package-agreements
winget install -e --id TheDocumentFoundation.LibreOffice --accept-source-agreements --accept-package-agreements
```

---

### Method 2: Direct Downloads (Most Reliable)

Download and run installers:

1. **Tesseract OCR** (2 min)
   - Download: https://github.com/UB-Mannheim/tesseract/releases
   - File: `tesseract-ocr-w64-setup-v5.x.x.exe`
   - Install to default location: `C:\Program Files\Tesseract-OCR`

2. **ImageMagick** (5 min)
   - Download: https://imagemagick.org/script/download.php#windows
   - File: `ImageMagick-x-QuantumDepth-x86_64-dll.exe`
   - ✓ Check "Install ImageMagick object support"

3. **Poppler** (2 min)
   - Download: https://github.com/oschwartz10612/poppler-windows/releases
   - File: `Release-xx.07.00-0.zip`
   - Extract to: `C:\Program Files\poppler`

4. **LibreOffice** (15 min)
   - Download: https://www.libreoffice.org/download/download.html
   - File: Windows MSI installer
   - Default installation

5. **Potrace** (1 min - Optional)
   - Download: https://sourceforge.net/projects/potrace/files/
   - File: `potrace-x.x.x-win64.zip`
   - Extract to: `C:\Program Files\potrace`

---

## ✅ After Installation

1. **Close all PowerShell windows**
2. **Open NEW PowerShell window**
3. Verify installation:

```powershell
tesseract --version
pdftoppm -h
convert --version
soffice --version
```

Should all show version info.

---

## 🧪 Test Phase 2 Converters

```powershell
# Navigate to project
cd i:\Raghava\Copilot-works\tinytools-app

# Start dev server
npm run dev

# Open browser to test
Start-Process "http://localhost:3000/tools/converters/png-to-svg"
```

---

## 📋 Verification

Run this to confirm all tools are in PATH:

```powershell
$tools = @("tesseract", "pdftoppm", "convert", "soffice")
foreach ($tool in $tools) {
    if (Get-Command $tool -ErrorAction SilentlyContinue) {
        Write-Host "✓ $tool found" -ForegroundColor Green
    } else {
        Write-Host "✗ $tool NOT found" -ForegroundColor Red
    }
}
```

All should show green checkmarks.

---

## 🆘 Troubleshooting

**"Command not found" after installation:**
- Restart PowerShell completely (close and reopen)
- Or run: `$env:Path | Split-Path` to check PATH

**Tesseract download fails (403):**
- Use Method 2 (direct download)
- Alternative: Download from GitLab mirror

**Installation blocked by antivirus:**
- Temporarily disable antivirus during installation
- Add tools to antivirus whitelist: `C:\Program Files\*`

---

## ⏱️ Total Installation Time

- Best case (winget): ~5-10 minutes
- Manual direct downloads: ~30 minutes
- Includes restart time: +2-3 minutes

**Total: 30-45 minutes**

