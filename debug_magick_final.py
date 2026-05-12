import sys
import os
import tempfile
import subprocess
from pathlib import Path

# Add the python directory to path
sys.path.insert(0, os.path.join(os.getcwd(), 'python'))

test_psd = os.path.join(tempfile.gettempdir(), 'test_real.psd')
output_png = os.path.join(tempfile.gettempdir(), 'test_output_manual.png')
magick_path = r'C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe'

# Re-create PSD just in case
subprocess.run([magick_path, '-size', '100x100', 'xc:blue', test_psd], check=True)

print(f"Testing manual command...")
cmd = [magick_path, test_psd, '-quality', '85', output_png]
result = subprocess.run(cmd, capture_output=True, text=True)
print(f"Return Code: {result.returncode}")
print(f"STDERR: {result.stderr}")

if os.path.exists(output_png):
    print("SUCCESS: Manual output created")
else:
    # Try different order
    print("Trying alternative command order...")
    output_png_alt = os.path.join(tempfile.gettempdir(), 'test_output_alt.png')
    cmd_alt = [magick_path, 'convert', test_psd, output_png_alt]
    result_alt = subprocess.run(cmd_alt, capture_output=True, text=True)
    if os.path.exists(output_png_alt):
        print("SUCCESS: Alt output created")
    else:
        print(f"FAIL: Alt output not created. STDERR: {result_alt.stderr}")

