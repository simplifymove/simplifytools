import sys
import os
from pathlib import Path
from PIL import Image, ImageDraw
import tempfile

# Add the python directory to path
sys.path.insert(0, os.path.join(os.getcwd(), 'python'))
from engines.document import convert_psd_to_image

# Create a simple test PSD file (via PNG first, or just use a real PSD)
# Since PIL can't save PSD, we'll use a dummy approach or just assume ImageMagick handles the input
# Wait, if we can't create a PSD with PIL, we can't easily test it this way.
# Let's try to find an existing PSD in the project if any, or just create a dummy file and see if ImageMagick fails gracefully.

test_psd = os.path.join(tempfile.gettempdir(), 'test_convert.psd')
output_png = os.path.join(tempfile.gettempdir(), 'test_output_final.png')

# Create a simple PNG and just rename it to .psd to see if ImageMagick detects it
img = Image.new('RGB', (200, 200), color='white')
img.save(test_psd) # Saves as PNG but with .psd extension
print(f"Test file (PNG-as-PSD) created: {test_psd}")

# Now test the conversion
try:
    result = convert_psd_to_image(test_psd, output_png, 'png', {'quality': 85})
    print(f"Conversion result: {result}")
    
    if os.path.exists(output_png):
        print(f"✓ Output PNG created: {output_png}")
    else:
        print(f"✗ Output file not created")
        
except Exception as e:
    print(f"✗ Error: {e}")
