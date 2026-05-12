import sys
import os
import tempfile
from pathlib import Path

# Add the python directory to path
sys.path.insert(0, os.path.join(os.getcwd(), 'python'))

# Create a minimal test PSD file (just create a small binary file with PSD header)
test_psd = os.path.join(tempfile.gettempdir(), 'test.psd')
output_png = os.path.join(tempfile.gettempdir(), 'test_output.png')

# Create a valid minimal PSD file structure
with open(test_psd, 'wb') as f:
    # PSD file signature
    f.write(b'8BPS')  # Signature
    f.write(b'\x00\x01')  # Version (1)
    f.write(b'\x00' * 6)  # Reserved
    f.write(b'\x00\x01')  # Number of channels (1)
    f.write(b'\x00' * 4 + b'\x00\x64')  # Height (100)
    f.write(b'\x00' * 4 + b'\x00\x64')  # Width (100)
    # The original provided logic for height/width was slightly off for PSD structure but let's try a simpler approach if it fails.
    # Actually let's use a more robust header.
    f.seek(0)
    f.write(b'8BPS\x00\x01\x00\x00\x00\x00\x00\x00\x00\x01' + (100).to_bytes(4, 'big') + (100).to_bytes(4, 'big') + b'\x00\x08\x00\x01')
    f.write(b'\x00' * 4) # Color Mode Data
    f.write(b'\x00' * 4) # Image Resources
    f.write(b'\x00' * 4) # Layer and Mask Information
    f.write(b'\x00\x00') # Compression (Raw)
    f.write(b'\x00' * 10000) # Dummy data

print(f"Test PSD file created: {test_psd}")
print(f"File size: {os.path.getsize(test_psd)} bytes")

# Test the conversion
try:
    from engines.document import convert_psd_to_image
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
    import traceback
    traceback.print_exc()
