#!/usr/bin/env python3
"""
Verify which of the 48 target packages are installed on VPS
Run via: ssh root@75.119.155.15 'python3 < verify-vps-packages.py'
"""

import subprocess
import json

# Check what packages are installed
result = subprocess.run(['pip', 'list', '--format', 'json'], capture_output=True, text=True)
packages = json.loads(result.stdout)

# Our 48 target packages
targets = [
    'pdfminer.six', 'pdfplumber', 'pikepdf', 'pypdf', 'pytesseract',
    'easyocr', 'paddleocr', 'scikit-image', 'pillow-heif', 'opencv-python',
    'imageio', 'imageio-ffmpeg', 'pandas', 'openpyxl', 'xlrd',
    'python-docx', 'python-pptx', 'polars', 'markdown', 'pyyaml',
    'toml', 'lxml', 'beautifulsoup4', 'html2text', 'yt-dlp',
    'instagrapi', 'tweepy', 'protobuf', 'msgpack', 'python-magic',
    'chardet', 'pathvalidate', 'google-auth', 'google-cloud-translate',
    'torch', 'torchvision', 'tensorflow', 'keras', 'pillow',
    'fitz', 'youtube-dl', 'google-cloud-vision', 'google-auth-httplib2',
    'avro', 'sympy', 'cryptography', 'numpy', 'scipy'
]

installed = {p['name'].lower() for p in packages}
success = []
failed = []

for target in targets:
    target_lower = target.lower().replace('_', '-')
    if any(target_lower in p for p in installed):
        success.append(target)
    else:
        failed.append(target)

print("\n" + "="*70)
print("VPS PACKAGE VERIFICATION REPORT")
print("="*70)

print(f'\n✅ SUCCESSFULLY INSTALLED: {len(success)}/{len(targets)}')
for pkg in sorted(success):
    print(f'   • {pkg}')

print(f'\n❌ FAILED/MISSING: {len(failed)}/{len(targets)}')
for pkg in sorted(failed)[:15]:
    print(f'   • {pkg}')
if len(failed) > 15:
    print(f'   ... and {len(failed)-15} more')

print("\n" + "="*70)
print(f"SUCCESS RATE: {len(success)}/{len(targets)} ({100*len(success)//len(targets)}%)")
print("="*70 + "\n")
