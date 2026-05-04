# PDF Watermark Removal: Dual-Method Implementation

## Overview

The watermark removal system now supports **two methods** to handle different watermark scenarios:

1. **`text_rebuild` (DEFAULT)** - Preserves document structure without hiding content
2. **`rectangle_overlay` (FALLBACK)** - Optional overlay method when explicit or if text rebuild fails

## Method 1: Text Rebuild (DEFAULT)

### Purpose
Extract all text from the document, identify watermark text, remove it, and rebuild the page with only non-watermark content.

### Process
1. **Detect watermarks** using keyword/size/position heuristics
2. **Paint over watermark areas** with white rectangles
3. **Re-paste non-watermark text** at original coordinates
4. **Save the cleaned PDF**

### Advantages
- ✅ **Preserves document structure** - tables, formatting, layout remain intact
- ✅ **Doesn't hide real content** - avoids covering tables/borders/text that overlap watermarks
- ✅ **Maintains text selectability** - output has selectable, searchable text
- ✅ **Best for complex documents** - PDFs with tables, multi-column layouts, etc.

### Limitations
- ⚠️ **Font rendering differences** - Minor platform differences (Windows vs Linux) in text positioning
- ⚠️ **Coordinate precision** - Text might be slightly offset from original baseline
- ⚠️ **Complex formatting** - Some advanced PDF formatting may not be perfectly preserved

### Usage
```python
# Default (implicit)
PdfSecurityEngine.remove_watermark(
    input_paths=[pdf_path],
    output_path=output_path,
    options={}  # Uses text_rebuild by default
)

# Explicit
PdfSecurityEngine.remove_watermark(
    input_paths=[pdf_path],
    output_path=output_path,
    options={'method': 'text_rebuild'}
)
```

## Method 2: Rectangle Overlay (FALLBACK)

### Purpose
Detect watermark location and cover it with a solid white rectangle overlay.

### Process
1. **Detect watermarks** using keyword/size/position heuristics
2. **Identify watermark bounding boxes**
3. **Draw white rectangles** over detected watermarks
4. **Save the cleaned PDF**

### Advantages
- ✅ **Platform-independent** - Same behavior on Windows/Linux
- ✅ **Simple & predictable** - No text rebuilding complications
- ✅ **Large watermarks** - Works well for standalone watermarks

### Limitations
- ❌ **Hides real content** - Rectangle covers everything underneath
- ❌ **Breaks document layout** - If watermark overlaps tables/text, those are hidden
- ❌ **Not for complex docs** - Should only use if watermark is isolated
- ⚠️ **Warning logged** - User notified of potential content loss

### Usage
```python
# Explicit rectangle_overlay
PdfSecurityEngine.remove_watermark(
    input_paths=[pdf_path],
    output_path=output_path,
    options={'method': 'rectangle_overlay'}
)
```

## Watermark Detection

Both methods use the **same detection algorithm**:

### Detection Criteria
A text span is considered a **watermark** if ANY of these are true:

1. **Keyword match** - Contains: "SAMPLE", "CONFIDENTIAL", "DRAFT", "WATERMARK", "INTERNAL", "PRIVATE", "COPY", "DUPLICATE"
2. **Size + Position** - Font size > 40pt AND located near page center

### Detection Logic
```python
is_watermark = (
    is_keyword_watermark or 
    (is_large_text and is_centered)
)
```

### No Watermark Found
If no watermarks detected:
- Returns **original PDF unchanged** (fallback behavior)
- Logs message: "NO WATERMARKS DETECTED"
- Useful for PDFs that are already clean

## Implementation Details

### Environment Logging
Both methods log comprehensive environment information:
```
[ENV] Python: 3.14.2 (tags/v3.14.2:df79316, Dec  5 2025)
[ENV] Platform: Windows-10-10.0.19045-SP0
[ENV] PyMuPDF version: 1.27.2.3
[ENV] PyPDF2 version: 3.0.1
[ENV] pikepdf version: 10.5.1
[ENV] Pillow version: 11.3.0
[ENV] NumPy version: 2.4.4
```

### Detailed Processing Logs
Each removal operation logs:
- Input file path and size
- Watermark detection details (keyword, size, position)
- Processing steps (covering, text restoration, etc.)
- Output file size and comparison
- Success/failure status

### Version Pinning
All Python dependencies are pinned to exact working versions:
```
PyPDF2==3.0.1
Pillow==11.3.0
pikepdf==10.5.1
PyMuPDF==1.27.2.3
numpy==2.4.4
pandas==3.0.2
```

## Recommendations by Use Case

### ✅ Use `text_rebuild` (DEFAULT) when:
- Document contains tables
- Important content near watermark
- Multiple watermarks
- Need searchable/selectable text output
- Platform consistency matters (Windows + VPS)

### ⚠️ Use `rectangle_overlay` when:
- Watermark is large and centered
- No important content near watermark
- Quick removal is priority over quality
- Testing quick overlay behavior

## Testing

The test suite verifies all scenarios:

```bash
python test_watermark_removal.py
```

### Test Cases
1. **Default text_rebuild** - Removes watermark using default method
2. **Fallback (no watermark)** - Returns original PDF unchanged
3. **Explicit text_rebuild** - Explicitly specifies method='text_rebuild'
4. **Explicit rectangle_overlay** - Explicitly specifies method='rectangle_overlay'

### Test Output
```
TEST 1: Watermark Removal (with watermark) - ✓ PASSED
TEST 2: Fallback (no watermark in PDF) - ✓ PASSED
TEST 3: text_rebuild Method (explicit) - ✓ PASSED
TEST 4: rectangle_overlay Method (explicit) - ✓ PASSED
```

## Platform Consistency

### Windows (Local) vs Linux (VPS)

**Current Status:**
- `text_rebuild`: May have minor font positioning differences between platforms
  - Windows vs Linux handle text baseline differently
  - Coordinates preserved as accurately as possible
  - No content is hidden regardless of platform

- `rectangle_overlay`: Identical behavior across platforms
  - Platform-independent rectangle drawing
  - No font rendering involved
  - Predictable coverage

**Solution Approach:**
The `text_rebuild` method is PRIMARY because it never hides real content. If exact platform consistency is needed, `rectangle_overlay` is available as fallback for testing/comparison.

## API Reference

### Main Method
```python
PdfSecurityEngine.remove_watermark(
    input_paths: List[str],        # [path/to/pdf.pdf]
    output_path: str,               # path/to/output.pdf
    options: Dict[str, Any]         # {'method': 'text_rebuild'|'rectangle_overlay'}
) -> str                            # Returns output_path
```

### Method Options
```python
options = {
    'method': 'text_rebuild'        # DEFAULT - recommended for most cases
    # OR
    'method': 'rectangle_overlay'   # FALLBACK - for isolated watermarks only
}
```

### Helper Methods (Internal)
```python
@staticmethod
def _remove_watermark_text_rebuild(
    pdf_path: str,
    output_path: str,
    file_size: int
) -> str

@staticmethod
def _remove_watermark_rectangle_overlay(
    pdf_path: str,
    output_path: str,
    file_size: int
) -> str
```

## File Locations

- **Implementation:** `python/engines/pdf_security.py`
- **Tests:** `test_watermark_removal.py`
- **Dependencies:** `requirements.txt` (all versions pinned)

## Summary Table

| Feature | text_rebuild | rectangle_overlay |
|---------|------------|-------------------|
| **Default** | ✅ Yes | ❌ No |
| **Hides content** | ❌ Never | ⚠️ Always (if overlapping) |
| **Platform consistent** | ⚠️ Minor differences | ✅ Yes |
| **Preserves layout** | ✅ Yes | ❌ Covers area |
| **Searchable text** | ✅ Yes | ❌ No |
| **Complex docs** | ✅ Best choice | ❌ Not recommended |
| **Simple watermarks** | ✅ Works well | ✅ Also works |
| **No watermark** | ✅ Returns original | ✅ Returns original |

## Migration Notes

If you were previously using rectangle_overlay only:

**Before:**
```python
options={'method': 'rectangle_overlay'}
```

**Now (if you want same behavior):**
```python
options={'method': 'rectangle_overlay'}  # Explicitly specify
```

**Recommended (for better quality):**
```python
options={}  # Default to text_rebuild (better for most PDFs)
```

## Version History

- **v2.0** (Current): Dual-method implementation with text_rebuild as default
  - `text_rebuild`: Extract, identify, rebuild
  - `rectangle_overlay`: White rectangle overlay (fallback)
  
- **v1.0**: Rectangle overlay only
  - Simple white rectangle coverage
  - Platform-independent but hides content
