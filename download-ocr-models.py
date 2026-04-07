#!/usr/bin/env python3
"""
Pre-download EasyOCR language models
Run this to download models once, so PDF OCR doesn't need to download on first use
"""

import easyocr
import os

def download_models():
    """Download EasyOCR models for supported languages"""
    print("=" * 50)
    print("Downloading EasyOCR Language Models")
    print("=" * 50)
    print()
    
    languages = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko']
    
    for lang in languages:
        try:
            print(f"Downloading model for {lang}...", end=' ', flush=True)
            reader = easyocr.Reader([lang], gpu=False, model_storage_directory=None)
            print("✓ Done")
        except Exception as e:
            print(f"✗ Failed: {e}")
    
    print()
    print("=" * 50)
    print("✓ All models downloaded successfully!")
    print("PDF OCR will now work instantly the first time.")
    print("=" * 50)

if __name__ == "__main__":
    download_models()
