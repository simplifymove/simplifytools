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

print(f"Testing manual command...")
cmd = [magick_path, test_psd, '-quality', '85', output_png]
print(f"Running: {' '.join(cmd)}")
result = subprocess.run(cmd, capture_output=True, text=True)
print(f"STDOUT: {result.stdout}")
print(f"STDERR: {result.stderr}")
print(f"Return Code: {result.returncode}")

if os.path.exists(output_png):
    print("SUCCESS: Manual output created")
else:
    print("FAIL: Manual output not created")

# Try with [0] to select first layer
output_png_layer = os.path.join(tempfile.gettempdir(), 'test_output_layer.png')
cmd_layer = [magick_path, f"{test_psd}[0]", '-quality', '85', output_png_layer]
print(f"\nRunning with layer selection: {' '.join(cmd_layer)}")
result_layer = subprocess.run(cmd_layer, capture_output=True, text=True)
print(f"STDOUT: {result_layer.stdout}")
print(f"STDERR: {result_layer.stderr}")

if os.path.exists(output_png_layer):
    print("SUCCESS: Layer output created")
