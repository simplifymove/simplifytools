import sys
import os
import tempfile
import subprocess
from pathlib import Path

# Add the python directory to path
sys.path.insert(0, os.path.join(os.getcwd(), 'python'))

# Use ImageMagick to create a valid PSD
test_psd = os.path.join(tempfile.gettempdir(), 'test_real.psd')
output_png = os.path.join(tempfile.gettempdir(), 'test_output_real.png')

# Create a real PSD using ImageMagick
magick_path = r'C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe'
try:
    subprocess.run([magick_path, '-size', '100x100', 'xc:blue', test_psd], check=True)
except Exception as e:
    print(f"Subprocess failed: {e}")

if os.path.exists(test_psd):
    print(f"Test PSD file created with ImageMagick: {test_psd}")
    print(f"File size: {os.path.getsize(test_psd)} bytes")

    # Test the conversion
    from engines.document import convert_psd_to_image

    try:
        result = convert_psd_to_image(test_psd, output_png, 'png', {})
        print(f"Conversion result: {result}")
        
        if os.path.exists(output_png):
            size = os.path.getsize(output_png)
            print(f"Output file created: {output_png}")
            print(f"Output file size: {size} bytes")
            # Check if it's a valid PNG
            with open(output_png, 'rb') as f:
                header = f.read(8)
                if header == b'\x89PNG\r\n\x1a\n':
                    print("✓ Valid PNG file!")
                else:
                    print(f"✗ Invalid PNG file! Header: {header.hex()}")
        else:
            print("✗ Output file not created")
            
    except Exception as e:
        print(f"Error: {e}")
except:
    print("Failed to setup test PSD")
