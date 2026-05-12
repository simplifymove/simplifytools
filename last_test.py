import sys
import os
import tempfile
import subprocess
from pathlib import Path

# Add the python directory to path
sys.path.insert(0, os.path.join(os.getcwd(), 'python'))

test_psd = os.path.join(tempfile.gettempdir(), 'test_real.psd')
output_png = os.path.join(tempfile.gettempdir(), 'test_output_manual_final.png')
magick_path = r'C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe'

# Re-create PSD
subprocess.run([magick_path, '-size', '100x100', 'xc:blue', test_psd], check=True)

print(f"Testing manual command...")
# ImageMagick 7 uses 'magick convert' or just 'magick'
cmd = [magick_path, test_psd, output_png]
result = subprocess.run(cmd, capture_output=True, text=True)

if os.path.exists(output_png):
    print("SUCCESS: Manual output created")
    # Now try the project engine
    from engines.document import convert_psd_to_image
    engine_output = os.path.join(tempfile.gettempdir(), 'test_engine_output.png')
    res = convert_psd_to_image(test_psd, engine_output, 'png', {})
    print(f"Engine result: {res}")
    if os.path.exists(engine_output):
        print("✓ Engine successfully created PNG")
    else:
        print("✗ Engine failed to create PNG")
else:
    print(f"FAIL: {result.stderr}")
