# Windows Setup Guide for Phase 2 Converters

This guide covers installing system dependencies for advanced image processing engines.

## ✅ Installed (Python Packages)
- `pytesseract` - Python OCR wrapper
- `pdf2image` - Python PDF to image conversion
- `Pillow` - Image processing (already installed)

## ⏳ Required System Binaries

### 1. **Tesseract OCR** (Required for Image→Text, PDF→Text)

**Method A: Direct Download (Recommended)**
1. Download: https://github.com/UB-Mannheim/tesseract/wiki
2. Download latest: `tesseract-ocr-w64-setup-v5.x.x.exe`
3. Run installer
4. Install location: `C:\Program Files\Tesseract-OCR` (default)
5. Add to PATH:
   - Right-click "This PC" → Properties
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", click "New"
   - Variable name: `TESSERACT_CMD`
   - Variable value: `C:\Program Files\Tesseract-OCR\tesseract.exe`
   - Click OK

**Test:**
```powershell
tesseract --version
```

---

### 2. **Poppler** (Required for PDF→Image, PDF→Text)

**Method A: Direct Download**
1. Download: https://github.com/oschwartz10612/poppler-windows/releases/
2. Download: `Release-xx.07.00-0.zip` (latest)
3. Extract to: `C:\Program Files\poppler`
4. Add to PATH:
   - Environment Variables → System Variables → New
   - Variable name: `PATH`
   - Add: `C:\Program Files\poppler\Library\bin`

**Method B: Via Python (Easier)**
```powershell
python -m pip install poppler-windows
```
This auto-configures Poppler for Python.

---

### 3. **Potrace** (Required for PNG/JPG/TIFF→SVG)

**Direct Download**
1. Download: http://potrace.sourceforge.net/ or https://github.com/skyrpex/potrace/releases
2. Download: `potrace-x.x.x-win64.zip` (or win32 for 32-bit)
3. Extract to: `C:\Program Files\potrace`
4. Add to PATH: `C:\Program Files\potrace\bin`

**Test:**
```powershell
potrace --version
```

---

### 4. **ImageMagick** (Required for PSD→JPG/PNG)

**Direct Download**
1. Download: https://imagemagick.org/script/download.php#windows
2. Download: `ImageMagick-x-QuantumDepth-x86_64-dll.exe` (64-bit)
3. Run installer
4. **IMPORTANT:** Check "Install ImageMagick object support" (for COM)
5. Install location: `C:\Program Files\ImageMagick` (default)
6. Adds to PATH automatically

**Test:**
```powershell
convert --version
```

---

### 5. **LibreOffice** (Required for VSD/VSDX→PDF/DOCX/PPTX)

**Direct Download**
1. Download: https://www.libreoffice.org/download/
2. Download Windows installer (MSI)
3. Run installer with default options
4. Install location: `C:\Program Files\LibreOffice`
5. Adds to PATH automatically

**Test:**
```powershell
soffice --version
```

---

## 🔧 Final PATH Configuration

After installing all binaries, verify PATH includes:
```powershell
# Open PowerShell and check:
$env:PATH -split ';' | Where-Object { $_ -match '(Tesseract|potrace|ImageMagick|LibreOffice)' }
```

Expected entries:
- `C:\Program Files\Tesseract-OCR\`
- `C:\Program Files\potrace\bin\`
- `C:\Program Files\ImageMagick\`
- `C:\Program Files\LibreOffice\program\`

## ✅ Verification Script

Run all tests:
```powershell
Write-Host "Testing Phase 2 Dependencies..." -ForegroundColor Green

$tools = @(
    @{ name = "Tesseract"; cmd = "tesseract"; args = "--version" },
    @{ name = "Poppler"; cmd = "pdftoimage"; args = "-h" },
    @{ name = "Potrace"; cmd = "potrace"; args = "--version" },
    @{ name = "ImageMagick"; cmd = "convert"; args = "--version" },
    @{ name = "LibreOffice"; cmd = "soffice"; args = "--version" }
)

foreach ($tool in $tools) {
    try {
        & $tool.cmd $tool.args 2>&1 | Out-Null
        Write-Host "✓ $($tool.name)" -ForegroundColor Green
    } catch {
        Write-Host "✗ $($tool.name) - NOT FOUND" -ForegroundColor Red
    }
}
```

## 🚀 After Installation

1. Verify all tests pass
2. Restart PowerShell/terminal for PATH changes
3. Run: `npm run build`
4. Test converters at http://localhost:3000/tools/converters

## 📋 Quick Reference: Installation Order

1. **Tesseract OCR** (10 min) - Essential
2. **Poppler** (2 min) - Essential
3. **Potrace** (5 min) - For SVG conversion
4. **ImageMagick** (15 min) - For PSD support
5. **LibreOffice** (30 min) - For Visio/Document support

**Total Time:** ~60 minutes

---

## 🆘 Troubleshooting

**"Command not found"**
- Restart PowerShell after adding to PATH
- Check PATH with: `$env:PATH`

**Python still can't find binary**
- Update Python engine files with full paths
- Example: Edit `/python/engines/ocr.py` line 25:
  ```python
  result = subprocess.run(['C:\\Program Files\\Tesseract-OCR\\tesseract.exe', ...])
  ```

**Converter returns error**
- Check if binary is in PATH: `where tesseract`
- Run individual binary to debug: `tesseract --help`

