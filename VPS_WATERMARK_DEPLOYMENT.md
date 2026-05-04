# VPS Deployment & Testing Guide: PDF Watermark Remover

## Quick Summary

The PDF watermark remover has been enhanced with:
1. **White rectangle overlay approach** - No text extraction/reinsertion (platform-independent)
2. **Comprehensive debug logging** - Easy to diagnose environment issues
3. **Pinned library versions** - Ensure consistency between Windows and Linux

## Windows (Local) Environment

### Verified Working Versions

```
Python:       3.14.2 (64-bit)
Platform:     Windows-10-10.0.19045-SP0
PyMuPDF:      1.27.2.3
PyPDF2:       3.0.1
pikepdf:      10.5.1
Pillow:       11.3.0
NumPy:        2.4.4
pandas:       3.0.2
```

**Test Result**: ✅ PASSED (both with watermark and fallback)

## VPS Deployment Steps

### Step 1: Pull Latest Code

```bash
cd /path/to/simplifytools
git pull origin main
```

**What Changed**:
- `python/engines/pdf_security.py` - Enhanced debug logging + version detection
- `requirements.txt` - Pinned exact versions (Pillow, PyPDF2)
- `test_watermark_removal.py` - Comprehensive test suite

### Step 2: Remove Old Virtual Environment

```bash
# Stop any running services
sudo systemctl stop simplifytools || true

# Remove old venv
rm -rf /path/to/simplifytools/.venv
```

### Step 3: Create Fresh Virtual Environment

```bash
cd /path/to/simplifytools

# Create new venv
python3 -m venv .venv

# Activate it
source .venv/bin/activate

# Upgrade pip to latest
pip install --upgrade pip

# Install all requirements (pinned versions)
pip install -r requirements.txt --no-cache-dir
```

**Expected output**:
```
Successfully installed pillow-11.3.0 PyPDF2-3.0.1 PyMuPDF-1.27.2.3 pikepdf-10.5.1 ...
```

### Step 4: Install Linux Font Dependencies

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
    fonts-dejavu \
    fonts-liberation \
    fontconfig \
    libfontconfig1 \
    libfreetype6

# Rebuild font cache
sudo fc-cache -f -v

# Check fonts are available
fc-list | grep -E "DejaVu|Liberation"
```

**Why**: PyMuPDF uses system fonts. Must match what PDF expects.

### Step 5: Run Local Tests on VPS

```bash
cd /path/to/simplifytools

# Activate venv
source .venv/bin/activate

# Run test suite
python test_watermark_removal.py
```

**Expected output**:
```
[ENV] Python: 3.10.x (Linux)
[ENV] Platform: Linux-5.x.x...
[ENV] PyMuPDF version: ('1.27.2.3', '1.27.2', None)
[ENV] PyPDF2 version: 3.0.1
...

TEST 1: Watermark Removal (with watermark)
[PDF] ========== WATERMARK REMOVAL START ==========
[PDF] Page 0: size=595.0x842.0, text_length=64, rotation=0
[PDF] WATERMARK DETECTED
[PDF] Covered 'SAMPLE'
[PDF] ========== WATERMARK REMOVAL COMPLETE ==========
[TEST] ✓ Watermark removal succeeded

TEST 2: Fallback (no watermark in PDF)
[PDF] ========== NO WATERMARKS DETECTED ==========
[PDF] Returning original PDF unchanged (fallback)
[TEST] ✓ Watermark removal succeeded (fallback)
```

### Step 6: Test with Real PDFs

```bash
# Create test directory
mkdir -p /tmp/watermark_test
cd /tmp/watermark_test

# Copy a real PDF with watermark
cp /path/to/real-watermarked.pdf test_input.pdf

# Run watermark removal
python -c "
import sys
sys.path.insert(0, '/path/to/simplifytools/python')
from engines.pdf_security import PdfSecurityEngine

result = PdfSecurityEngine.remove_watermark(
    input_paths=['/tmp/watermark_test/test_input.pdf'],
    output_path='/tmp/watermark_test/test_output.pdf',
    options={}
)
print(f'Success: {result}')
"

# Verify output
ls -lh /tmp/watermark_test/test_*.pdf
file /tmp/watermark_test/test_output.pdf
```

**Check output**:
- File size should be similar to input (±15%)
- File type should be valid PDF
- Watermark should be covered with white rectangle
- All original content should be visible

### Step 7: Verify Environment Consistency

```bash
# Check that versions match
python -c "
import sys, platform
import PyPDF2, fitz, pikepdf, PIL, numpy, pandas

print('=== VPS ENVIRONMENT ===')
print(f'Python: {sys.version}')
print(f'Platform: {platform.platform()}')
print(f'PyMuPDF: {fitz.version}')
print(f'PyPDF2: {PyPDF2.__version__}')
print(f'pikepdf: {pikepdf.__version__}')
print(f'Pillow: {PIL.__version__}')
print(f'NumPy: {numpy.__version__}')
print(f'pandas: {pandas.__version__}')
"
```

**Compare with Windows**:
```
WINDOWS                    VPS
Python:   3.14.2          Python:   3.10.x (OK - minor diff)
Platform: Windows-10       Platform: Linux
PyMuPDF:  1.27.2.3        PyMuPDF:  1.27.2.3  ✅ MUST MATCH
PyPDF2:   3.0.1           PyPDF2:   3.0.1     ✅ MUST MATCH
pikepdf:  10.5.1          pikepdf:  10.5.1    ✅ MUST MATCH
Pillow:   11.3.0          Pillow:   11.3.0    ✅ MUST MATCH
NumPy:    2.4.4           NumPy:    2.4.4     ✅ MUST MATCH
pandas:   3.0.2           pandas:   3.0.2     ✅ MUST MATCH
```

### Step 8: Restart Application

```bash
# Restart the service
sudo systemctl restart simplifytools

# Check logs
tail -f /var/log/simplifytools/pdf.log

# Should see environment logs at startup:
# [ENV] Python: 3.10.x...
# [ENV] PyMuPDF: 1.27.2.3
# ...
```

## Debugging on VPS

### If Tests Fail: Check Error Output

The debug logging will show:
1. **Module load errors**: Missing dependencies
2. **PDF open errors**: Corrupted or encrypted PDFs
3. **Detection errors**: Watermark not detected (adjust keywords)
4. **Covering errors**: Can't draw rectangle (rare)
5. **Save errors**: Output file not writable

### Common Issues & Solutions

#### Issue: Module Import Fails
```
ModuleNotFoundError: No module named 'fitz'
```

**Solution**:
```bash
# Verify venv is activated
source .venv/bin/activate

# Check if package installed
pip list | grep -i pymupdf

# If missing, reinstall
pip install --force-reinstall PyMuPDF==1.27.2.3
```

#### Issue: Version Mismatch
```
[ENV] PyMuPDF: ('1.27.1.0', ...)  ← Wrong version!
```

**Solution**:
```bash
# Force exact version
pip install --force-reinstall PyMuPDF==1.27.2.3
pip install --force-reinstall Pillow==11.3.0
```

#### Issue: Watermark Not Detected
```
[PDF] ========== NO WATERMARKS DETECTED ==========
```

**Possible causes**:
1. Watermark text doesn't match keywords (SAMPLE, CONFIDENTIAL, etc.)
2. Font size < 40pt
3. Text not positioned at page center

**Solution**: Check watermark properties:
```bash
python -c "
import fitz
doc = fitz.open('test.pdf')
page = doc[0]
text_dict = page.get_text('dict')
for block in text_dict['blocks']:
    if block['type'] == 0:
        for line in block.get('lines', []):
            for span in line.get('spans', []):
                text = span.get('text', '')
                size = span.get('size', 12)
                bbox = span.get('bbox', [])
                print(f'Text: {text} | Size: {size}pt | Bbox: {bbox}')
"
```

#### Issue: Fonts Look Wrong on VPS
```
Output PDF text is misaligned or has different font
```

**Solution**: Install fonts and rebuild cache
```bash
sudo apt-get install fonts-dejavu fonts-liberation
sudo fc-cache -f -v

# Verify fonts installed
fc-list | grep -i "dejavu\|liberation"
```

## Production Monitoring

### Add to Application Logs

Make sure these logs are captured:

```
[ENV] Python version on startup
[ENV] PyMuPDF version on startup
[PDF] WATERMARK REMOVAL START (input size)
[PDF] WATERMARK DETECTED (count and names)
[PDF] WATERMARK REMOVAL COMPLETE (output size)
```

### Key Metrics to Monitor

1. **Detection Rate**: % of PDFs that have watermarks detected
2. **Success Rate**: % of removals that complete without error
3. **File Size Change**: Output size should be within ±15% of input
4. **Processing Time**: Usually < 1 second per page

### Log File Location

```bash
# On VPS, logs should go to:
/var/log/simplifytools/pdf.log

# Or if using Docker:
/app/logs/pdf.log

# Check for errors:
grep "[ERROR]" /var/log/simplifytools/pdf.log
grep "[WARN]" /var/log/simplifytools/pdf.log
```

## Rollback Plan

If VPS version causes issues:

```bash
# Stop application
sudo systemctl stop simplifytools

# Revert to previous commit
git revert HEAD

# Reinstall old requirements
pip install -r requirements.txt --no-cache-dir

# Restart
sudo systemctl start simplifytools
```

## Performance Expectations

| Metric | Expected |
|--------|----------|
| Detection Time | < 100ms |
| Covering Time | < 50ms/watermark |
| Save Time | 100-500ms |
| **Total** | **< 1 second** |
| Memory Usage | < 50MB |
| Output Size | Within ±15% of input |

## Final Checklist

- [ ] Git pulled latest code
- [ ] Old venv removed
- [ ] New venv created with pinned versions
- [ ] Linux fonts installed
- [ ] Local tests passed on VPS
- [ ] Real PDF test successful
- [ ] Versions match Windows (PyMuPDF, Pillow, etc.)
- [ ] Application restarted
- [ ] Logs showing [ENV] info at startup
- [ ] Logs show successful watermark removal

## Support

If issues persist after following these steps:

1. **Capture full debug output**:
   ```bash
   python test_watermark_removal.py > /tmp/debug.log 2>&1
   cat /tmp/debug.log
   ```

2. **Check environment script**:
   ```bash
   which python
   python --version
   pip list
   ```

3. **Test with minimal example**:
   ```bash
   python -c "import fitz; print(fitz.version)"
   ```

4. **Review recent commits**:
   ```bash
   git log --oneline -5
   git show <commit-hash>
   ```

5. **Check disk space**:
   ```bash
   df -h /tmp
   df -h /
   ```
