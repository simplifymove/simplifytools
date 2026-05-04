# VPS Deployment Guide for Updated Watermark Removal

## Quick Summary

The watermark removal system has been updated to use **`text_rebuild` as the default method** instead of rectangle overlay. This preserves document structure and doesn't hide real content.

- **Default method:** `text_rebuild` (extract → clean → rebuild)
- **Fallback method:** `rectangle_overlay` (white rectangle coverage)
- **Default behavior:** Both methods now return original PDF if no watermark detected

## Pre-Deployment Checklist

- [ ] Python 3.14+ on VPS
- [ ] Virtual environment created
- [ ] Fresh requirements.txt installed
- [ ] Test suite ready to run
- [ ] GitHub push completed

✅ **All done locally** - Ready to deploy to VPS

## VPS Deployment Steps

### Step 1: SSH to VPS

```bash
ssh user@vps-ip-address
```

### Step 2: Navigate to Project

```bash
cd /path/to/simplifyconvertapp
```

### Step 3: Create/Activate Virtual Environment

```bash
# If venv doesn't exist
python3.14 -m venv venv

# Activate
source venv/bin/activate
```

### Step 4: Install Updated Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Pinned versions will be installed:**
- PyMuPDF==1.27.2.3
- PyPDF2==3.0.1
- Pillow==11.3.0
- pikepdf==10.5.1
- numpy==2.4.4
- pandas==3.0.2

### Step 5: Verify Installation

```bash
python -c "
import fitz
import PyPDF2
import PIL
import pikepdf
import numpy
print('✅ All dependencies installed')
print(f'PyMuPDF: {fitz.version}')
print(f'PyPDF2: {PyPDF2.__version__}')
print(f'Pillow: {PIL.__version__}')
print(f'pikepdf: {pikepdf.__version__}')
print(f'NumPy: {numpy.__version__}')
"
```

Expected output:
```
✅ All dependencies installed
PyMuPDF: ('1.27.2.3', '1.27.2', None)
PyPDF2: 3.0.1
Pillow: 11.3.0
pikepdf: 10.5.1
NumPy: 2.4.4
```

### Step 6: Run Test Suite

```bash
python test_watermark_removal.py
```

Expected output: **4 tests PASSED**
```
TEST 1: Watermark Removal (with watermark) - ✓ PASSED
TEST 2: Fallback (no watermark in PDF) - ✓ PASSED
TEST 3: text_rebuild Method (explicit) - ✓ PASSED
TEST 4: rectangle_overlay Method (explicit) - ✓ PASSED
```

### Step 7: Verify Environment Logging

The test output should show environment information:
```
[ENV] Python: 3.14.2 (...)
[ENV] Platform: Linux-5.10.0-... (or your Linux version)
[ENV] PyMuPDF version: ('1.27.2.3', '1.27.2', None)
[ENV] PyPDF2 version: 3.0.1
[ENV] pikepdf version: 10.5.1
[ENV] Pillow version: 11.3.0
[ENV] NumPy version: 2.4.4
```

### Step 8: Test with Real PDF

Create a test PDF and test watermark removal:

```bash
python -c "
import sys
sys.path.insert(0, 'python')
from engines.pdf_security import PdfSecurityEngine

# Test 1: Default text_rebuild
print('\\n=== TEST: text_rebuild (DEFAULT) ===')
result = PdfSecurityEngine.remove_watermark(
    input_paths=['/path/to/sample_watermark.pdf'],
    output_path='/tmp/output_text_rebuild.pdf',
    options={}
)
print(f'✓ Output: {result}')

# Test 2: Rectangle overlay
print('\\n=== TEST: rectangle_overlay (FALLBACK) ===')
result = PdfSecurityEngine.remove_watermark(
    input_paths=['/path/to/sample_watermark.pdf'],
    output_path='/tmp/output_rectangle.pdf',
    options={'method': 'rectangle_overlay'}
)
print(f'✓ Output: {result}')
"
```

## Platform Consistency Testing

### Comparing Windows vs Linux Output

1. **On Windows (Local):**
   ```bash
   python test_watermark_removal.py > windows_output.txt 2>&1
   ```

2. **On Linux (VPS):**
   ```bash
   python test_watermark_removal.py > vps_output.txt 2>&1
   ```

3. **Compare outputs:**
   - Both should show same test results (PASSED)
   - Output file sizes may differ slightly (font metrics)
   - No content should be hidden in either version

### Visual Verification

If possible, visually compare the output PDFs:

```bash
# Create test PDF with watermark
python test_watermark_removal.py

# Compare the generated output files
# File sizes and content should be similar but not identical

# For rectangle_overlay, sizes should be even closer
```

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'fitz'"

**Solution:**
```bash
pip install --upgrade PyMuPDF==1.27.2.3
```

### Issue: "ImportError: cannot import name 'PdfSecurityEngine'"

**Solution:**
```bash
# Verify python path
echo $PYTHONPATH

# Make sure you're in project root
pwd  # Should be /path/to/simplifyconvertapp

# Try again
python test_watermark_removal.py
```

### Issue: Tests fail with "No SAMPLE watermark detected"

**Solution:**
1. Check PDF creation in test_watermark_removal.py
2. Verify PyMuPDF is creating watermark correctly
3. Check watermark keyword list matches test PDF

### Issue: Font rendering issues on VPS

**Solution:**
1. Check if text_rebuild method is being used (it should be default)
2. If rectangle_overlay needed: explicitly set method
3. Install additional font packages if needed:
   ```bash
   apt-get update
   apt-get install -y libfreetype6 libfreetype6-dev
   ```

## Integration with API

When integrating with your API endpoint, use:

```python
# Default (text_rebuild)
output = PdfSecurityEngine.remove_watermark(
    input_paths=[uploaded_pdf_path],
    output_path=output_pdf_path,
    options={}  # Uses text_rebuild by default
)

# Or explicit if needed
output = PdfSecurityEngine.remove_watermark(
    input_paths=[uploaded_pdf_path],
    output_path=output_pdf_path,
    options={'method': 'text_rebuild'}
)
```

## Monitoring

### Log Output Format

Watch for these log entries:

```
[PDF] ========== WATERMARK REMOVAL START ==========
[PDF] Method: text_rebuild
[PDF] ========== STEP 1: DETECTING WATERMARKS ==========
[PDF]   Page 0: WATERMARK DETECTED (keyword)
[PDF] ========== STEP 2: REBUILDING PAGES ==========
[PDF] Page 0: Covered 1 watermark(s), Restored 3 text span(s)
[PDF] ========== STEP 3: SAVING PDF ==========
[PDF] ========== WATERMARK REMOVAL COMPLETE (text_rebuild) ==========
```

### Performance Metrics

- **Small PDFs (< 1 MB):** ~500-1000ms
- **Medium PDFs (1-5 MB):** ~1-3s
- **Large PDFs (> 5 MB):** ~5-10s+

Text_rebuild is slower than rectangle_overlay but produces better output.

## Rollback Plan

If text_rebuild doesn't work on VPS, revert to rectangle_overlay:

```python
# In your API code, add fallback
options = {'method': 'text_rebuild'}
if platform.system() == 'Linux':
    options = {'method': 'rectangle_overlay'}  # Temporary fallback

output = PdfSecurityEngine.remove_watermark(
    input_paths=[pdf_path],
    output_path=output_path,
    options=options
)
```

## Deployment Completion

Once tests pass on VPS:

1. ✅ Environment matches Windows (same versions)
2. ✅ text_rebuild works on Linux
3. ✅ Both methods produce valid PDFs
4. ✅ Fallback behavior works (no watermark → original)
5. ✅ Ready for production use

## Next Steps

1. Deploy to VPS using these steps
2. Run test suite to verify
3. Compare output with Windows version
4. Monitor production usage
5. Adjust method parameter if needed for specific use cases

## Files Changed

- `python/engines/pdf_security.py` - Updated with dual-method implementation
- `test_watermark_removal.py` - Updated to test both methods
- `requirements.txt` - All versions pinned for reproducibility
- `PDF_WATERMARK_DUAL_METHOD.md` - Complete method documentation

## Support

For issues during deployment:
1. Check troubleshooting section above
2. Compare test output with windows_output.txt
3. Verify all dependencies installed correctly
4. Check error logs in [PDF] output
