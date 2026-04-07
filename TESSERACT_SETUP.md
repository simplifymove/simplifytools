# Tesseract OCR Setup Guide

## 📋 Summary

The PDF OCR tool requires **Tesseract OCR** to be installed on your system. This is a separate system-level installation, not a Node.js package.

---

## ✅ Quick Install (Choose ONE method)

### Windows - Option 1: Direct Download (Easiest)
1. Visit: **https://github.com/UB-Mannheim/tesseract/releases**
2. Scroll down and download the latest **`.exe`** file (e.g., `tesseract-ocr-w64-setup-v5.3.3.exe` or newer)
3. Double-click to run the installer
4. Accept all defaults (installs to `C:\Program Files\Tesseract-OCR`)
5. Finish installation

### Windows - Option 2: Using Scoop (Package Manager)
```powershell
scoop install tesseract
```

### Windows - Option 3: Using Chocolatey (Package Manager)
```powershell
choco install tesseract
```

### macOS
```bash
brew install tesseract
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install tesseract-ocr
```

---

## ✔️ Verify Installation

After installing, verify it's working:

**Windows (PowerShell):**
```powershell
& "C:\Program Files\Tesseract-OCR\tesseract.exe" --version
```

**macOS/Linux:**
```bash
tesseract --version
```

You should see output like:
```
tesseract 5.3.3
  leptonica-1.82.0
  ...
```

---

## 🚀 Test PDFOCRTool

Once installed:

1. **Restart dev server:**
   ```bash
   npm run dev
   ```

2. **Visit:** `http://localhost:3000/all-tools/pdf/pdf-ocr`

3. **Upload a PDF** and it should work! ✓

---

## 🔍 Troubleshooting

### "Tesseract is not installed" Error on macOS/Linux?

The auto-detection looks for Tesseract at:
- `/usr/local/bin/tesseract`
- `/opt/homebrew/bin/tesseract`
- `/usr/bin/tesseract`

If you installed it elsewhere, verify the path:
```bash
which tesseract
which -a tesseract
```

### Still not working?

1. Close VS Code completely
2. Restart your terminal/PowerShell
3. Restart dev server: `npm run dev`
4. Try again

---

## 📁 Project Structure

```
tinytools-app/
├── setup-tesseract.py          (Python setup helper)
├── setup-tesseract.ps1         (PowerShell setup helper)  
├── TESSERACT_SETUP.md          (this file)
├── python/
│   └── engines/
│       └── pdf_ocr_translate.py (auto-detects Tesseract)
```

---

## 🆘 FAQ

**Q: Where does the code look for Tesseract?**
A: The Python code in `python/engines/pdf_ocr_translate.py` automatically checks common installation locations.

**Q: Can I install it in a custom location?**
A: Yes! The code will find it if it's in your PATH or in common locations.

**Q: Will PDF OCR work without Tesseract?**
A: No, all OCR features require Tesseract. Other PDF tools (like PDF to image, merge, etc.) don't need it.

**Q: How much disk space does Tesseract need?**
A: About 150-200 MB for the base installation with English language.

---

## ✨ Next Steps

1. ✅ Install Tesseract using one of the methods above
2. ✅ Verify installation
3. ✅ Restart dev server
4. ✅ Test the PDF OCR tool

That's it! 🎉


