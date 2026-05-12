import sys
import os
from pathlib import Path
from PIL import Image, ImageDraw
import tempfile

# Add the python directory to path
sys.path.insert(0, os.path.join(os.getcwd(), 'python'))
from engines.document import convert_psd_to_image

test_psd = os.path.join(tempfile.gettempdir(), 'test_convert.psd')
output_png = os.path.join(tempfile.gettempdir(), 'test_output_final.png')

# Create a simple PNG
img = Image.new('RGB', (200, 200), color='white')
temp_png = os.path.join(tempfile.gettempdir(), 'temp.png')
img.save(temp_png, 'PNG')

# Rename to .psd
if os.path.exists(test_psd): os.remove(test_psd)
os.rename(temp_png, test_psd)
print(f"Test file created: {test_psd}")

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
