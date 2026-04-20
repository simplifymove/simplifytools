# Document Engine Improvements - PSD Conversion with Tool Fallback

## Overview
Enhanced the PSD conversion engine with robust fallback support for multiple image conversion tools. This ensures conversions work even if one tool is unavailable.

## Changes Made

### File: `python/engines/document.py`

#### Key Improvements:

1. **Multi-Tool Fallback Strategy**
   - Primary: ImageMagick `convert` command (traditional)
   - Secondary: ImageMagick `magick` command (newer syntax)
   - Tertiary: GraphicsMagick `gm` command

2. **New Functions**
   - `convert_psd_to_image()`: Tries multiple tools with graceful fallback
   - `convert_psd_to_png_with_fallback()`: PNG-specific conversion with tool attempts
   - Enhanced `convert_psd_to_svg_chained()`: PSD → PNG → SVG pipeline

3. **Error Handling**
   - Detailed logging showing which tools were attempted
   - Clear error messages indicating all failed attempts
   - Last error information provided for debugging

4. **Logging Improvements**
   - Each conversion step logs the tool being used
   - Success indicators show which tool ultimately worked
   - Debug logs track all tool attempts and failures

## Implementation Details

### convert_psd_to_image() Function
```python
def convert_psd_to_image(input_file: str, output_file: str, output_format: str, options) -> bool:
    """Convert PSD to JPG/PNG with fallback tools"""
    # Tries: ImageMagick → ImageMagick (magick) → GraphicsMagick
```

### convert_psd_to_png_with_fallback() Function
```python
def convert_psd_to_png_with_fallback(input_file: str, output_file: str, quality: int = 85) -> bool:
    """Convert PSD to PNG with multiple tool fallback"""
    # Attempts each tool in sequence
    # Raises detailed error if all fail
```

### convert_psd_to_svg_chained() Function
```python
def convert_psd_to_svg_chained(input_file: str, output_file: str, options) -> bool:
    """Convert PSD to SVG via PNG intermediate"""
    # Step 1: PSD → PNG (with tool fallback)
    # Step 2: PNG → SVG (vector tracing)
    # Cleans up temporary files automatically
```

## Deployment Instructions

### Via SSH (when VPS is online):
```bash
# Option 1: Using the deployment script
python deploy-document-fix.py

# Option 2: Manual SCP
scp python/engines/document.py root@94.74.87.164:/root/tinytools-app/python/engines/document.py

# Restart Gunicorn
ssh root@94.74.87.164 'systemctl restart gunicorn'
```

### Via Manual Upload:
1. Copy `python/engines/document.py` to VPS at `/root/tinytools-app/python/engines/`
2. Restart Gunicorn: `systemctl restart gunicorn`
3. Restart FastAPI if running: `systemctl restart fastapi`

## Testing the Changes

### Test PSD to PNG Conversion:
```bash
curl -X POST http://localhost:8000/api/convert \
  -F "file=@test.psd" \
  -F "from=psd" \
  -F "to=png" \
  -F "quality=85"
```

### Monitor Logs:
```bash
# Watch Gunicorn logs
tail -f /var/log/gunicorn/error.log

# Check for messages like:
# [PSD→PNG] Trying ImageMagick
# [PSD→PNG] ✓ Successfully converted using ImageMagick
```

### Expected Behavior:
- If ImageMagick is available: Uses it (fastest)
- If only GraphicsMagick: Falls back to it
- If multiple tools: Uses the first available one
- Clear logging shows which tool was used

## Benefits

1. **Robustness**: Conversions succeed with any of three tools installed
2. **Flexibility**: Works on different system configurations
3. **Debugging**: Detailed logs show exactly what was tried and why
4. **Performance**: No unnecessary fallbacks - uses best available tool
5. **Maintenance**: Easy to add more tools to the fallback chain

## Related Files
- `python/engines/vector_trace.py` - SVG conversion
- `python/engines/utils.py` - Utility functions
- `app/api/document.py` - API endpoint

## VPS Deployment Status
- Document Engine: ✅ Updated locally
- VPS Status: ⏳ Connection timeout (as of last attempt)
- Pending Deployment: Ready to deploy once VPS is online

## Future Enhancements
- Add support for Photoshop executable (if available)
- Implement caching for converted files
- Add conversion quality metrics
- Support batch PSD conversions
