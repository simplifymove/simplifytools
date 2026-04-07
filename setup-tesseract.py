#!/usr/bin/env python3
"""
Tesseract OCR Setup Script for Project
Downloads Tesseract OCR installer to project tools directory
"""

import os
import urllib.request
import sys
from pathlib import Path

def setup_tesseract():
    version = "5.3.3"
    tools_dir = Path("tools")
    installer_name = f"tesseract-ocr-w64-setup-v{version}.exe"
    installer_path = tools_dir / installer_name
    
    print("\n" + "="*40)
    print("Tesseract OCR Project Setup")
    print("="*40 + "\n")
    
    # Create tools directory
    tools_dir.mkdir(exist_ok=True)
    
    # Download URL
    url = f"https://github.com/UB-Mannheim/tesseract/releases/download/v{version}/{installer_name}"
    
    print(f"Downloading Tesseract OCR v{version}...")
    print(f"URL: {url}\n")
    
    try:
        urllib.request.urlretrieve(url, str(installer_path))
        size_mb = installer_path.stat().st_size / (1024 * 1024)
        
        print(f"✓ Download complete!")
        print(f"  File: {installer_path}")
        print(f"  Size: {size_mb:.1f} MB\n")
        print("Next steps:")
        print(f"1. Run: {installer_path}")
        print(f"2. Install to: C:\\Program Files\\Tesseract-OCR")
        print(f"3. Restart your development server\n")
        return True
        
    except Exception as e:
        print(f"✗ Download failed!")
        print(f"Error: {e}\n")
        print("Manual installation:")
        print(f"Visit: https://github.com/UB-Mannheim/tesseract/releases")
        print(f"Download: {installer_name}")
        print(f"Run the installer\n")
        return False

if __name__ == "__main__":
    success = setup_tesseract()
    sys.exit(0 if success else 1)
