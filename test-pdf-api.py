#!/usr/bin/env python3
"""
Quick test to verify the fix for PDF API Python imports
"""

import subprocess
import sys

print("[TEST] Checking if system Python can import required packages...")

# Test locally first
try:
    import PIL
    import pdfminer
    import pdfplumber
    print("[✓] All packages available locally")
except ImportError as e:
    print(f"[✗] Local import failed: {e}")
    sys.exit(1)

# Test on VPS
print("\n[TEST] Testing on VPS (75.119.155.15)...")
ssh_cmd = [
    'ssh', 'root@75.119.155.15',
    'python3 -c "import PIL; import pdfminer; import pdfplumber; print(\'SUCCESS\')"'
]

try:
    result = subprocess.run(ssh_cmd, capture_output=True, text=True, timeout=30)
    if result.returncode == 0 and 'SUCCESS' in result.stdout:
        print("[✓] VPS Python imports working!")
    else:
        print(f"[✗] VPS test failed:")
        print(f"  STDOUT: {result.stdout}")
        print(f"  STDERR: {result.stderr}")
        print(f"  Return code: {result.returncode}")
except Exception as e:
    print(f"[!] Could not test VPS (may need password): {e}")

print("\n[INFO] PDF API fix applied:")
print("  - Changed to use /usr/bin/python3 on Linux/VPS")
print("  - Set PYTHONPATH environment variable for system site-packages")
print("  - API route updated in app/api/pdf/route.ts")
