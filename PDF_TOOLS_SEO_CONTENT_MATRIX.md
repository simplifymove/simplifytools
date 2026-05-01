# PDF Tools SEO Content Quick Reference Matrix

## ✅ TOOLS WITH FULL CUSTOM SEO CONTENT (11 tools)

| Tool Slug | Lines | H1 Custom | Intro | HowTo | Benefits | Format Comp. | Use Cases | FAQ | Schema | Status |
|-----------|-------|-----------|-------|-------|----------|--------------|-----------|-----|--------|--------|
| **unlock-pdf** | 550-750 | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | 🟢 COMPLETE |
| **pdf-watermark-remover** | 750-950 | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | 🟢 COMPLETE |
| **pdf-to-jpg** | 950-1350 | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ⭐ ENHANCED |
| **pdf-to-png** | 1350-1750 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⭐ ENHANCED |
| **pdf-to-tiff** | 1750-2150 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⭐ ENHANCED |
| **jpg-to-pdf** | 2150-2550 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⭐ ENHANCED |
| **png-to-pdf** | 2550-2750 | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | 🟡 PARTIAL |
| **tiff-to-pdf** | 2800-3300 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⭐ ENHANCED |
| **gif-to-pdf** | 3300-3700 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⭐ ENHANCED |
| **heic-to-pdf** | 3700-3900 | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | 🟢 COMPLETE |
| **eps-to-pdf** | 3800-4200 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⭐ ENHANCED |

---

## ⚠️ TOOLS WITH PARTIAL/MINIMAL SEO CONTENT (2-3 tools)

| Tool Slug | Lines | Status | Missing Content | Completeness |
|-----------|-------|--------|-----------------|--------------|
| **png-to-pdf** | 2550-2750 | 🟡 PARTIAL | How It Works, Benefits, Use Cases | 45% |
| **webp-to-pdf** | 4800-4950 | 🟡 MINIMAL | Almost everything except FAQ | 20% |
| **pdf-to-word** | 4300+ | ❓ UNKNOWN | Full audit needed | TBD |

---

## ❌ TOOLS WITHOUT CUSTOM SEO CONTENT (Fall back to generic)

These tools show **only** generic header, controls panel, info panel, and 3-card features section:

- merge-pdf
- compress-pdf
- split-pdf
- rotate-pdf
- crop-pdf
- protect-pdf
- fill-form
- sign-pdf
- remove-pages
- extract-text
- And any other tools in the system

**These tools need:** Full custom SEO content implementation

---

## CUSTOM H1 OVERRIDES

**Currently implemented (4 tools only):**
```javascript
tool.id === 'heic-to-pdf' → 'Convert HEIC to PDF Online Free (iPhone Photos)'
tool.id === 'eps-to-pdf' → 'Convert EPS to PDF Online Free (Vector Graphics)'
tool.id === 'images-to-pdf' → 'Convert Images to PDF Online Free (Merge JPG, PNG, HEIC)'
tool.id === 'pdf-to-word' → 'Convert PDF to Word Online Free (DOCX Converter)'
```

**Should add custom H1s to:**
- pdf-to-jpg → "Convert PDF Pages to JPG Images Online Free"
- pdf-to-png → "Convert PDF Pages to PNG Images Online Free"
- pdf-to-tiff → "Convert PDF Pages to TIFF Images Online Free"

---

## CUSTOM BUTTON TEXT

**Customized button text (lines 457-468):**
- unlock-pdf → "Unlock PDF"
- pdf-watermark-remover → "Remove Watermark"
- protect-pdf → "Protect PDF"
- jpg-to-pdf → "Convert to PDF"
- png-to-pdf → "Convert to PDF"
- tiff-to-pdf → "Convert to PDF"
- webp-to-pdf → "Convert to PDF"
- gif-to-pdf → "Convert to PDF"
- heic-to-pdf → "Convert to PDF"
- eps-to-pdf → "Convert to PDF"
- pdf-to-jpg → "Convert to JPG"
- pdf-to-png → "Download PNG Images"
- pdf-to-tiff → "Download TIFF Images"

**Default fallback:**
- All others → "Process [format.toUpperCase()]"

---

## SEO CONTENT ELEMENTS BY TOOL

### ⭐ TOOLS WITH MOST COMPREHENSIVE CONTENT:

**1. pdf-to-jpg** 
- Includes: Image placeholders, DPI comparison chart, before/after comparison
- Keywords: PDF to JPG, convert PDF to images, image quality

**2. pdf-to-png**
- Includes: Format comparison table (PNG vs JPG vs PDF), transparency emphasis
- Keywords: PDF to PNG, transparent backgrounds, lossless

**3. eps-to-pdf**
- Includes: Vector quality emphasis, comparison table (EPS vs PDF)
- Keywords: Vector graphics, EPS conversion, designer tools

**4. images-to-pdf**
- Includes: Multi-format hub, supported formats table, SoftwareApplication Schema
- Keywords: Image to PDF, merge images, batch conversion

---

## SPECIAL CASE: ANNOTATE-PDF

- **Location:** Lines 5040+
- **Implementation:** Separate `AnnotatePdfPage` component
- **Reason:** Complex PDF annotation interface with file editing
- **No SEO content blocks:** (Special handling redirects to different component)

---

## SCHEMA MARKUP SUMMARY

### ✅ Implemented:
- FAQ Schema (JSON-LD) - 13 tools
- SoftwareApplication Schema - 1 tool (images-to-pdf)

### ❌ Missing:
- HowTo Schema (steps are rendered but not marked up)
- Breadcrumb Schema (breadcrumbs visible but no schema)
- Organization/LocalBusiness Schema
- AggregateRating Schema
- Product/Tool Schema

---

## CONDITIONAL RENDERING LOGIC

All custom SEO content is wrapped in conditional blocks:
```javascript
{tool.id === 'SLUG_NAME' && (
  <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
    {/* Custom content here */}
  </div>
)}
```

**If tool.id doesn't match ANY block:** Falls back to generic content only

---

## IMAGE PLACEHOLDERS (READY FOR OPTIMIZATION)

These tools have image placeholder comments ready for implementation:

1. **pdf-to-jpg** (lines 1020-1048)
   - Preview image placeholder
   - Before/after comparison placeholder
   - DPI comparison chart placeholder

2. **pdf-to-png** (lines 1427-1440)
   - Preview image placeholder
   - Before/after comparison placeholder
   - DPI comparison chart placeholder

3. **pdf-to-tiff** (lines 1833-1851)
   - Preview image placeholder
   - Before/after comparison placeholder
   - DPI comparison chart placeholder

---

## CROSS-PROMOTION PATTERNS

**Contextual Links section** (found in 5 tools):
- jpg-to-pdf → links to png-to-pdf, merge-pdf, compress-pdf
- png-to-pdf → links to jpg-to-pdf
- tiff-to-pdf → links to jpg-to-pdf, png-to-pdf, merge-pdf, compress-pdf
- gif-to-pdf → links to jpg-to-pdf, png-to-pdf, tiff-to-pdf, merge-pdf, compress-pdf
- eps-to-pdf → links to jpg-to-pdf, png-to-pdf, gif-to-pdf, merge-pdf, compress-pdf

**Related Tools section** (found in all 13 tools with custom content):
- Typically 3 tools linked
- Common pattern: Compress PDF, Merge PDF, PDF-to-JPG/PNG

---

## CONTENT WORD COUNT ESTIMATES

| Tool | Approx Words | Complexity |
|------|-------------|-----------|
| unlock-pdf | ~2,500 | Medium |
| pdf-watermark-remover | ~2,800 | Medium |
| pdf-to-jpg | ~3,500 | High (includes tips) |
| pdf-to-png | ~4,000 | High (includes comparison) |
| pdf-to-tiff | ~3,800 | High (includes comparison) |
| jpg-to-pdf | ~3,200 | Medium-High |
| png-to-pdf | ~1,200 | Low (INCOMPLETE) |
| tiff-to-pdf | ~3,500 | Medium-High |
| gif-to-pdf | ~3,800 | High |
| heic-to-pdf | ~3,000 | Medium |
| eps-to-pdf | ~3,200 | Medium-High |
| webp-to-pdf | ~800 | Very Low (INCOMPLETE) |
| images-to-pdf | ~3,500 | High (hub tool) |

---

## PRIORITY FIX CHECKLIST

### 🔴 CRITICAL (Do First)
- [ ] Complete webp-to-pdf content (currently 20% complete)
- [ ] Complete png-to-pdf content (currently 45% complete)
- [ ] Verify pdf-to-word full implementation
- [ ] Add H1 overrides to pdf-to-jpg, pdf-to-png, pdf-to-tiff

### 🟡 IMPORTANT (Next Sprint)
- [ ] Add image assets to pdf-to-jpg placeholder locations
- [ ] Add image assets to pdf-to-png placeholder locations
- [ ] Add image assets to pdf-to-tiff placeholder locations
- [ ] Review all FAQ sections for minimum 50-word answers
- [ ] Implement HowTo Schema markup

### 🟢 NICE-TO-HAVE (Polish)
- [ ] Add Organization Schema
- [ ] Add AggregateRating Schema
- [ ] Create tool comparison pages
- [ ] Add SoftwareApplication Schema to more tools
- [ ] A/B test custom button text

---

## FILE STRUCTURE NOTES

- **File Path:** `app/all-tools/pdf/[slug]/page.tsx`
- **Total Lines:** ~5,100+
- **Generic sections:** Lines 1-550 (header, controls, features)
- **Custom content blocks:** Lines 550-4,850+
- **Special component:** Lines 5,040+ (AnnotatePdfPage)
- **Closing tags:** Lines 5,080+

**Key Functions:**
- `PdfToolPage()` - Main page component
- `AnnotatePdfPage()` - Special handling for annotate-pdf tool
- Dynamic PDF processing via `/api/pdf` endpoint
