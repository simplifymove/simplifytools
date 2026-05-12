import sys
import os
from pathlib import Path

# Add the python directory to path
sys.path.insert(0, os.path.join(os.getcwd(), 'python'))
from engines.document import convert_psd_to_image

# Create a simple test image and save as PSD using PIL
from PIL import Image, ImageDraw
import tempfile

# Create a simple test PSD file
test_psd = os.path.join(tempfile.gettempdir(), 'test_convert.psd')
output_png = os.path.join(tempfile.gettempdir(), 'test_output_final.png')

# Create a colorful test image
img = Image.new('RGB', (200, 200), color='white')
draw = ImageDraw.Draw(img)
draw.rectangle([50, 50, 150, 150], fill='blue', outline='red')
draw.text((70, 90), "TEST", fill='black') # Color might need to be compatible

# Save as PSD
img.save(test_psd, 'PSD')
print(f"Test PSD created: {test_psd} ({os.path.getsize(test_psd)} bytes)")

# Now test the conversion
try:
    # PSD transformation might need specific options if ImageMagick is picky
    result = convert_psd_to_image(test_psd, output_png, 'png', {'quality': 85})
    print(f"Conversion result: {result}")
    
    if os.path.exists(output_png):
        size = os.path.getsize(output_png)
        print(f"✓ Output PNG created: {output_png} ({size} bytes)")
        
        # Verify it's a valid PNG
        with open(output_png, 'rb') as f:
            header = f.read(8)
            # The shell might escape \x89... let's check bytes literally
            expected = bytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
            if header == expected:
                print("✓ Valid PNG header!")
            else:
                print(f"✗ Invalid PNG header: {header.hex()}")
        
        # Try to open it with PIL to verify
        test_img = Image.open(output_png)
        print(f"✓ PNG opens successfully: {test_img.size} {test_img.mode}")
    else:
        print(f"✗ Output file not created")
        
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
