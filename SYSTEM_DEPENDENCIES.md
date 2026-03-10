# System Dependencies for TinyTools Image Converters

This document outlines all system-level dependencies required for the converter engines to function properly.

## Installation Overview

The converter system uses external tools for various format conversions. Installing these is **essential** for the converters to work reliably.

---

## Core Dependencies by Engine

### 1. Raster Engine (JPG, PNG, WebP, BMP, TIFF)
**Tools**: Pillow (Python library)
**Status**: ✅ Python-only, no system install needed

```bash
# Already in requirements.txt
pip install -r requirements.txt
```

---

### 2. Vector Render Engine (PDF, EPS → JPG/PNG)
**Tools**: Poppler, Ghostscript

#### Windows Installation

```powershell
# Using Chocolatey (recommended)
choco install poppler ghostscript

# Or download manually:
# Poppler: https://github.com/oschwartz10612/poppler-windows/releases/
# Ghostscript: https://www.ghostscript.com/download/gsdnld.html
```

#### macOS Installation

```bash
brew install poppler ghostscript
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get install poppler-utils ghostscript
```

#### Verify Installation

```bash
pdftoppm --version  # Should show version info
gs --version        # Should show Ghostscript version
```

---

### 3. Animation Engine (GIF ↔ MP4)
**Tools**: FFmpeg

#### Windows Installation

```powershell
# Using Chocolatey
choco install ffmpeg

# Or download: https://ffmpeg.org/download.html
```

#### macOS Installation

```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get install ffmpeg
```

#### Verify Installation

```bash
ffmpeg -version  # Should show FFmpeg version and codec info
```

---

### 4. Vector Trace Engine (PNG/JPG → SVG) [Future]
**Tools**: Potrace, Inkscape

#### Windows Installation

```powershell
# Potrace
choco install potrace

# Inkscape
choco install inkscape
```

#### macOS Installation

```bash
brew install potrace inkscape
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get install potrace inkscape
```

---

### 5. OCR Engine (Image → Text) [Future]
**Tools**: Tesseract

#### Windows Installation

```powershell
choco install tesseract
```

#### macOS Installation

```bash
brew install tesseract
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get install tesseract-ocr
```

---

### 6. Document Engine (VSDX, PSD → Formats) [Future]
**Tools**: LibreOffice (headless mode)

#### Windows Installation

```powershell
# Full installation from: https://www.libreoffice.org/download/
# Or via Chocolatey
choco install libreoffice
```

#### macOS Installation

```bash
brew install libreoffice
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get install libreoffice
```

#### Verify Installation

```bash
libreoffice --version
```

---

## Quick Setup Script (Windows with Chocolatey)

```powershell
# Run PowerShell as Administrator

# Install all dependencies
choco install -y poppler ghostscript ffmpeg potrace inkscape tesseract libreoffice

# Verify
Write-Host "Poppler:" ; pdftoppm --version
Write-Host "Ghostscript:" ; gs --version
Write-Host "FFmpeg:" ; ffmpeg -version
Write-Host "Potrace:" ; potrace --version
Write-Host "Inkscape:" ; inkscape --version
Write-Host "Tesseract:" ; tesseract --version
Write-Host "LibreOffice:" ; libreoffice --version
```

---

## Quick Setup Script (Linux - Ubuntu/Debian)

```bash
#!/bin/bash

# Update package lists
sudo apt-get update

# Install all dependencies
sudo apt-get install -y \
  poppler-utils \
  ghostscript \
  ffmpeg \
  potrace \
  inkscape \
  tesseract-ocr \
  libreoffice

# Verify
echo "=== System Dependencies Verification ==="
echo "Poppler:" && pdftoppm --version | head -1
echo "Ghostscript:" && gs --version | head -1
echo "FFmpeg:" && ffmpeg -version | head -1
echo "Potrace:" && potrace --version | head -1
echo "Inkscape:" && inkscape --version | head -1
echo "Tesseract:" && tesseract --version | head -1
echo "LibreOffice:" && libreoffice --version | head -1
```

---

## Quick Setup Script (macOS with Homebrew)

```bash
#!/bin/bash

# Install all dependencies
brew install poppler ghostscript ffmpeg potrace inkscape tesseract libreoffice

# Verify
echo "=== System Dependencies Verification ==="
echo "Poppler:" && pdftoppm --version | head -1
echo "Ghostscript:" && gs --version | head -1
echo "FFmpeg:" && ffmpeg -version | head -1
echo "Potrace:" && potrace --version | head -1
echo "Inkscape:" && inkscape --version | head -1
echo "Tesseract:" && tesseract --version | head -1
echo "LibreOffice:" && libreoffice --version | head -1
```

---

## Dependency Status Check

Run this to see which converters are available:

```bash
# Raster converters (always available if Python deps installed)
python -c "from PIL import Image; print('✓ Raster engine ready')" 2>/dev/null || echo "✗ Raster engine needs setup"

# Vector render (PDF, EPS)
pdftoppm --version >/dev/null 2>&1 && echo "✓ PDF→Image ready" || echo "✗ Install poppler"
gs --version >/dev/null 2>&1 && echo "✓ EPS→Image ready" || echo "✗ Install ghostscript"

# Animation (GIF, MP4)
ffmpeg -version >/dev/null 2>&1 && echo "✓ Animation ready" || echo "✗ Install ffmpeg"

# Vector trace (PNG→SVG)
potrace --version >/dev/null 2>&1 && echo "✓ Vector trace ready" || echo "✗ Install potrace"

# OCR
tesseract --version >/dev/null 2>&1 && echo "✓ OCR ready" || echo "✗ Install tesseract"

# Document
libreoffice --version >/dev/null 2>&1 && echo "✓ Document conversion ready" || echo "✗ Install libreoffice"
```

---

## Troubleshooting

### "pdftoppm not found" / "command not found"
- **Solution**: Install Poppler. Add to PATH if needed.
- Windows: `choco install poppler`
- macOS: `brew install poppler`
- Linux: `sudo apt-get install poppler-utils`

### "Ghostscript error"
- **Solution**: Install Ghostscript
- Windows: `choco install ghostscript`
- macOS: `brew install ghostscript`
- Linux: `sudo apt-get install ghostscript`

### FFmpeg codec missing
- Make sure to install full FFmpeg with libx264:
  ```bash
  brew install ffmpeg  # macOS
  choco install ffmpeg  # Windows (full version)
  sudo apt-get install ffmpeg  # Linux
  ```

### LibreOffice headless mode issues
- Ensure LibreOffice is installed with full components
- On Linux, may need: `sudo apt-get install libreoffice-writer libreoffice-calc`

---

## Docker Setup (Recommended for Production)

All dependencies pre-installed:

```dockerfile
FROM python:3.10

# Install system dependencies
RUN apt-get update && apt-get install -y \
    poppler-utils \
    ghostscript \
    ffmpeg \
    potrace \
    inkscape \
    tesseract-ocr \
    libreoffice \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

WORKDIR /app
COPY . .

CMD ["npm", "run", "dev"]
```

---

## Version Compatibility

| Tool | Min Version | Recommended | Compatible |
|------|------------|-------------|-----------|
| Poppler | 0.84 | 23.x+ | Yes |
| Ghostscript | 9.50 | 10.x+ | Yes |
| FFmpeg | 4.2 | 6.x+ | Yes |
| Potrace | 1.15 | 1.16+ | Yes |
| Inkscape | 0.92 | 1.2+ | Yes |
| Tesseract | 4.0 | 5.x+ | Yes |
| LibreOffice | 6.0 | 7.x+ | Yes |

---

## Next Steps

1. **Install all system dependencies** above
2. **Verify installations** using the status check script
3. **Run the app**: `npm run dev`
4. **Test converters** at: `http://localhost:3000/tools`

If all tools are installed, all converters will be available!
