# Tesseract.js OCR Setup (100% FREE)

## Overview

TinyTools now uses **Tesseract.js** for PDF/Image OCR - completely free, open-source, and requires no API keys or credits.

- ✅ **Cost:** $0 per document
- ✅ **Accuracy:** 85-90% (great for documents)
- ✅ **Speed:** 2-10 seconds per page
- ✅ **No credentials needed**
- ✅ **Unlimited usage**

---

## Quick Start

### 1. Install Dependencies
```bash
npm install tesseract.js docx
```

### 2. No Configuration Needed!
Unlike Google Cloud Vision, Tesseract.js requires:
- ✅ No API keys
- ✅ No environment variables
- ✅ No service accounts
- ✅ No authentication

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access the Tool
```
http://localhost:3000/all-tools/pdf/ocr-to-text
```

Upload a PDF or image and it works immediately!

---

## How It Works

### Architecture

```
User uploads PDF/Image
         ↓
Browser sends to /api/pdf/ocr endpoint
         ↓
Server receives file
         ↓
PDF → Convert to images (using PDF.js)
Images → Run Tesseract.js OCR
         ↓
Extract text and confidence scores
         ↓
Return extracted text to frontend
         ↓
User can copy or download
```

### Processing Steps

1. **File Validation**
   - Check file type (PDF, JPG, PNG, WebP, TIFF)
   - Check file size (<50MB)

2. **PDF to Images**
   - For PDFs: Convert each page to image (2x zoom for quality)
   - For images: Use directly

3. **OCR Processing**
   - Run Tesseract.js on each image
   - Extract text and word boundaries
   - Calculate confidence scores

4. **Text Assembly**
   - Sort text by position (top-left to bottom-right)
   - Combine words into full document text
   - Return structured data

---

## File Structure

```
app/
├── lib/
│   ├── tesseract-ocr.ts        # Core OCR logic
│   ├── docx-export.ts          # DOCX export utilities
│   └── google-cloud-vision.ts  # (deprecated - can delete)
├── api/
│   └── pdf/
│       └── ocr/
│           └── route.ts         # API endpoint
└── all-tools/
    └── pdf/
        └── ocr-to-text/
            └── page.tsx        # Frontend UI
```

---

## API Reference

### POST `/api/pdf/ocr`

**Request:**
```bash
curl -X POST http://localhost:3000/api/pdf/ocr \
  -F "file=@document.pdf"
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "fullText": "Extracted text content from the PDF...",
    "textBlocks": [
      {
        "text": "First word",
        "confidence": 0.95,
        "bounds": {
          "x": 100,
          "y": 50,
          "width": 80,
          "height": 20
        }
      },
      {
        "text": "Second word",
        "confidence": 0.92,
        "bounds": {
          "x": 200,
          "y": 50,
          "width": 70,
          "height": 20
        }
      }
    ],
    "confidence": 93,
    "pages": 3,
    "fileName": "document.pdf"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "File too large. Maximum size: 50MB"
}
```

---

## Features

✅ **Free** - No costs whatsoever
✅ **Open Source** - Tesseract.js source code available
✅ **No API Keys** - Works instantly
✅ **Multi-Format** - PDF, JPG, PNG, WebP, TIFF
✅ **Multi-Page** - Process entire documents
✅ **Confidence Scoring** - See accuracy per page
✅ **Text Extraction** - Get structured text blocks
✅ **Editable Output** - Copy or download text
✅ **Unlimited** - Process as many documents as you want

---

## Accuracy & Performance

### Accuracy by Document Type

| Document Type | Accuracy | Notes |
|---------------|----------|-------|
| Printed text (good quality) | 90-95% | Best results |
| Scanned documents | 85-90% | Good for most use cases |
| Handwritten text | 60-70% | Limited support |
| Poor quality scans | 70-80% | Preprocessing helps |
| Complex layouts | 75-85% | May lose some formatting |

### Processing Speed

| Document | Pages | Time | Speed |
|----------|-------|------|-------|
| Simple letter | 1 | 2-3s | ~3s/page |
| Business document | 5 | 10-15s | ~2-3s/page |
| Scanned book | 20 | 30-50s | ~2-3s/page |
| Large PDF | 50 | 100-150s | ~2-3s/page |

**Note:** Actual speed depends on:
- Document quality (resolution)
- Page complexity
- Server CPU
- Browser performance

---

## Customization

### Adjust Processing Parameters

Edit `/app/lib/tesseract-ocr.ts`:

```typescript
// Change PDF page zoom level (higher = better quality)
const viewport = page.getViewport({ scale: 2 }); // Change 2 to 3 or 4

// Change language (default: English)
// See: https://github.com/naptha/tesseract.js#languages
await Tesseract.recognize(imageData, 'eng', { /* ... */ });

// To support multiple languages:
await Tesseract.recognize(imageData, 'eng+deu+fra', { /* ... */ });
```

### Adjust Max File Size

Edit `/app/api/pdf/ocr/route.ts`:

```typescript
// Change from 50MB to your desired limit
if (file.size > 100 * 1024 * 1024) { // 100MB
```

---

## Deployment

### Vercel (Recommended)
No special configuration needed. Just deploy normally:
```bash
git push  # Vercel auto-deploys
```

Tesseract.js works in Vercel's serverless environment.

### Self-Hosted / Docker
```bash
# Build
npm run build

# Start
npm start

# Or with Docker
docker build -t tinytools .
docker run -p 3000:3000 tinytools
```

### Environment Variables
No environment variables needed! Tesseract.js is completely self-contained.

---

## Troubleshooting

### "Module not found: tesseract.js"
```bash
npm install tesseract.js
npm run dev
```

### Slow OCR processing
- Ensure files are <50MB
- Use high-quality PDFs (300+ DPI)
- For 50+ pages, expect 2+ minutes

### Low accuracy results
- Try improving document quality (scan at higher DPI)
- Straighten skewed pages
- Remove background noise
- Use higher resolution images

### PDF shows as blank
- Verify PDF has text content (not image-only)
- Try converting to high-quality image first
- Check file isn't corrupted

---

## Languages Supported

Tesseract.js supports 100+ languages:

**Common languages:**
- English (eng)
- Spanish (spa)
- French (fra)
- German (deu)
- Portuguese (por)
- Italian (ita)
- Russian (rus)
- Chinese (chi_sim / chi_tra)
- Japanese (jpn)
- Korean (kor)
- Arabic (ara)
- and more...

To add language support:
```typescript
// In app/lib/tesseract-ocr.ts
await Tesseract.recognize(imageData, 'eng+spa+fra', {
  logger: (m: any) => console.log(m),
});
```

See [Tesseract.js documentation](https://github.com/naptha/tesseract.js) for full language list.

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start dev server: `npm run dev`
3. ✅ Test the tool: Visit `/all-tools/pdf/ocr-to-text`
4. ✅ Upload a PDF and extract text
5. ✅ Customize if needed (size limits, languages, etc.)
6. ✅ Deploy to production (no credentials to configure!)

---

## Comparison with Removed Google Cloud Vision

| Feature | Tesseract.js | Google Cloud Vision |
|---------|------------|-------------------|
| **Cost** | FREE | $1.50 per 1,000 |
| **Setup** | Zero config | Requires API keys |
| **Accuracy** | 85-90% | 95%+ |
| **Speed** | 2-10s/page | <1s/page |
| **Requires** | Nothing | GCP account + billing |
| **Deployment** | Anywhere | Needs credentials |
| **Best for** | Free usage | High accuracy at scale |

We chose Tesseract.js because:
- ✅ No cost
- ✅ No API keys needed
- ✅ Good accuracy for business documents
- ✅ Open source
- ✅ Works offline

---

## Additional Resources

- [Tesseract.js GitHub](https://github.com/naptha/tesseract.js)
- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [docx Library](https://docx.js.org/)

---

## Performance Optimization Tips

1. **Limit PDF pages** - Process first 50 pages only (see code)
2. **Use image optimization** - Upscale before OCR
3. **Batch processing** - Queue multiple PDFs
4. **Caching** - Cache OCR results in database
5. **Async/await** - Already implemented

---

## Support & Issues

For issues:
1. Check Tesseract.js documentation
2. Verify file format and quality
3. Try with sample PDF first
4. Check browser console for errors

**Common error fixes:**
- "File too large" → Reduce size or increase limit
- "No text extracted" → Verify PDF has text (not image-only)
- "Slow processing" → Expected for multi-page PDFs
- "Accuracy low" → Use higher quality source documents
