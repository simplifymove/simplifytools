#!/usr/bin/env python3
"""
Root cause analysis for PIL import issue
"""
import sys
import os

print("=" * 60)
print("PYTHON IMPORT DIAGNOSIS")
print("=" * 60)

print("\n[1] Python Executable:")
print(f"    {sys.executable}")

print("\n[2] Python Version:")
print(f"    {sys.version}")

print("\n[3] Current Working Directory:")
print(f"    {os.getcwd()}")

print("\n[4] sys.path entries:")
for i, path in enumerate(sys.path, 1):
    exists = "✓" if os.path.exists(path) else "✗"
    print(f"    [{i}] {exists} {path}")

print("\n[5] Attempting to import PIL:")
try:
    import PIL
    print(f"    ✓ SUCCESS - imported from: {PIL.__file__}")
except ImportError as e:
    print(f"    ✗ FAILED - {e}")

print("\n[6] Attempting to import pdfminer:")
try:
    import pdfminer
    print(f"    ✓ SUCCESS - imported from: {pdfminer.__file__}")
except ImportError as e:
    print(f"    ✗ FAILED - {e}")

print("\n[7] Checking site-packages locations:")
try:
    import site
    sps = site.getsitepackages()
    print(f"    site.getsitepackages() returned:")
    for sp in sps:
        exists = "✓" if os.path.exists(sp) else "✗"
        print(f"      {exists} {sp}")
except Exception as e:
    print(f"    ✗ Error: {e}")

print("\n[8] Checking for PIL in common locations:")
common_paths = [
    '/usr/local/lib/python3.12/site-packages/PIL',
    '/usr/local/lib/python3.11/site-packages/PIL',
    '/usr/lib/python3/dist-packages/PIL',
    '/usr/local/lib/python3/dist-packages/PIL',
]
for path in common_paths:
    if os.path.exists(path):
        print(f"    ✓ Found: {path}")
    else:
        print(f"    ✗ Not found: {path}")

print("\n" + "=" * 60)
