#!/usr/bin/env python3
"""
Phase 2 PDF Image Conversion Test Script
Tests all image-to-PDF and PDF-to-image conversions
"""

import os
import json
import tempfile
from pathlib import Path
from PIL import Image
import fitz  # PyMuPDF

# Import the engines
from engines.pdf_convert import PdfConvertEngine
from engines.pdf_core import PdfCoreEngine

def create_test_image(width=300, height=200, color='red', format='jpg'):
    """Create a simple test image"""
    img = Image.new('RGB', (width, height), color)
    temp_dir = tempfile.gettempdir()
    img_path = os.path.join(temp_dir, f'test_image_{format}.{format}')
    img.save(img_path, format.upper())
    return img_path

def create_test_pdf(num_pages=3):
    """Create a simple test PDF"""
    doc = fitz.open()
    for i in range(num_pages):
        page = doc.new_page(width=612, height=792)
        text = f"Test PDF - Page {i+1}"
        page.insert_text((50, 50), text)
    
    temp_dir = tempfile.gettempdir()
    pdf_path = os.path.join(temp_dir, 'test_pdf.pdf')
    doc.save(pdf_path)
    doc.close()
    return pdf_path

def test_image_to_pdf():
    """Test converting images to PDF"""
    print("\n📝 Testing Image to PDF Conversions...")
    engine = PdfConvertEngine()
    temp_dir = tempfile.gettempdir()
    
    # Test 1: Single JPG to PDF
    print("  1. Testing JPG → PDF...")
    jpg_path = create_test_image(format='jpg')
    output_path = os.path.join(temp_dir, 'test_jpg_to_pdf.pdf')
    try:
        result = engine.image_to_pdf([jpg_path], output_path, {})
        if os.path.exists(result):
            size = os.path.getsize(result) / 1024
            print(f"     ✅ JPG → PDF: {result} ({size:.1f} KB)")
        else:
            print(f"     ❌ Output file not created")
    except Exception as e:
        print(f"     ❌ Error: {str(e)}")
    
    # Test 2: Multiple images to PDF
    print("  2. Testing Multiple Images → PDF...")
    img1 = create_test_image(color='blue', format='png')
    img2 = create_test_image(color='green', format='png')
    output_path = os.path.join(temp_dir, 'test_multi_to_pdf.pdf')
    try:
        result = engine.image_to_pdf([img1, img2], output_path, {})
        if os.path.exists(result):
            doc = fitz.open(result)
            num_pages = len(doc)
            size = os.path.getsize(result) / 1024
            print(f"     ✅ Multiple Images → PDF: {num_pages} pages, {size:.1f} KB")
            doc.close()
        else:
            print(f"     ❌ Output file not created")
    except Exception as e:
        print(f"     ❌ Error: {str(e)}")
    
    # Test 3: PNG with transparency to PDF
    print("  3. Testing PNG (with transparency) → PDF...")
    png_img = Image.new('RGBA', (300, 200), (255, 0, 0, 128))  # Semi-transparent red
    temp_dir = tempfile.gettempdir()
    png_path = os.path.join(temp_dir, 'test_transparent.png')
    png_img.save(png_path)
    output_path = os.path.join(temp_dir, 'test_transparent_to_pdf.pdf')
    try:
        result = engine.image_to_pdf([png_path], output_path, {})
        if os.path.exists(result):
            size = os.path.getsize(result) / 1024
            # Verify it's valid PDF
            doc = fitz.open(result)
            print(f"     ✅ PNG (transparent) → PDF: {size:.1f} KB")
            doc.close()
        else:
            print(f"     ❌ Output file not created")
    except Exception as e:
        print(f"     ❌ Error: {str(e)}")

def test_pdf_to_image():
    """Test converting PDF to images"""
    print("\n🖼️  Testing PDF to Image Conversions...")
    engine = PdfConvertEngine()
    temp_dir = tempfile.gettempdir()
    
    # Create test PDF
    pdf_path = create_test_pdf(num_pages=3)
    
    # Test 1: PDF to JPG
    print("  1. Testing PDF → JPG (72 DPI)...")
    output_path = os.path.join(temp_dir, 'test_pdf_to_jpg.zip')
    try:
        result = engine.pdf_to_image([pdf_path], output_path, {'format': 'jpg', 'dpi': 72, 'pageMode': 'all'})
        if os.path.exists(result):
            size = os.path.getsize(result) / 1024
            print(f"     ✅ PDF → JPG: {result} ({size:.1f} KB)")
        else:
            print(f"     ❌ Output file not created")
    except Exception as e:
        print(f"     ❌ Error: {str(e)}")
    
    # Test 2: PDF to PNG
    print("  2. Testing PDF → PNG (150 DPI)...")
    output_path = os.path.join(temp_dir, 'test_pdf_to_png.zip')
    try:
        result = engine.pdf_to_image([pdf_path], output_path, {'format': 'png', 'dpi': 150, 'pageMode': 'all'})
        if os.path.exists(result):
            size = os.path.getsize(result) / 1024
            print(f"     ✅ PDF → PNG: {result} ({size:.1f} KB)")
        else:
            print(f"     ❌ Output file not created")
    except Exception as e:
        print(f"     ❌ Error: {str(e)}")
    
    # Test 3: PDF to TIFF
    print("  3. Testing PDF → TIFF (300 DPI)...")
    output_path = os.path.join(temp_dir, 'test_pdf_to_tiff.zip')
    try:
        result = engine.pdf_to_image([pdf_path], output_path, {'format': 'tiff', 'dpi': 300, 'pageMode': 'all'})
        if os.path.exists(result):
            size = os.path.getsize(result) / 1024
            print(f"     ✅ PDF → TIFF: {result} ({size:.1f} KB)")
        else:
            print(f"     ❌ Output file not created")
    except Exception as e:
        print(f"     ❌ Error: {str(e)}")
    
    # Test 4: PDF to JPG with page range
    print("  4. Testing PDF → JPG (page range 1-2)...")
    output_path = os.path.join(temp_dir, 'test_pdf_to_jpg_range.zip')
    try:
        result = engine.pdf_to_image([pdf_path], output_path, {'format': 'jpg', 'dpi': 150, 'pageMode': 'selected', 'pageRange': '1-2'})
        if os.path.exists(result):
            size = os.path.getsize(result) / 1024
            print(f"     ✅ PDF → JPG (page range): {result} ({size:.1f} KB)")
        else:
            print(f"     ❌ Output file not created")
    except Exception as e:
        print(f"     ❌ Error: {str(e)}")
    
    # Test 5: Single page PDF to JPG (should return single file, not ZIP)
    print("  5. Testing Single Page PDF → JPG (single file)...")
    single_page_pdf = create_test_pdf(num_pages=1)
    output_path = os.path.join(temp_dir, 'test_single_page.jpg')
    try:
        result = engine.pdf_to_image([single_page_pdf], output_path, {'format': 'jpg', 'dpi': 150, 'pageMode': 'all'})
        if os.path.exists(result):
            size = os.path.getsize(result) / 1024
            print(f"     ✅ Single Page PDF → JPG: {result} ({size:.1f} KB)")
        else:
            print(f"     ❌ Output file not created")
    except Exception as e:
        print(f"     ❌ Error: {str(e)}")

def test_quality_parameters():
    """Test quality and DPI parameters"""
    print("\n⚙️  Testing Quality Parameters...")
    engine = PdfConvertEngine()
    temp_dir = tempfile.gettempdir()
    
    pdf_path = create_test_pdf(num_pages=1)
    
    # Test different DPI settings
    dpi_settings = [72, 150, 300, 600]
    sizes = {}
    
    for dpi in dpi_settings:
        output_path = os.path.join(temp_dir, f'test_pdf_dpi_{dpi}.jpg')
        try:
            result = engine.pdf_to_image([pdf_path], output_path, {'format': 'jpg', 'dpi': dpi, 'pageMode': 'all'})
            if os.path.exists(result):
                size = os.path.getsize(result) / 1024
                sizes[dpi] = size
                print(f"  {dpi:3d} DPI: {size:7.1f} KB")
        except Exception as e:
            print(f"  {dpi:3d} DPI: ❌ Error: {str(e)}")
    
    # Verify quality increases with DPI
    if len(sizes) > 1:
        sorted_sizes = sorted(sizes.items())
        if all(sorted_sizes[i][1] <= sorted_sizes[i+1][1] for i in range(len(sorted_sizes)-1)):
            print("  ✅ Quality increases with DPI")
        else:
            print("  ⚠️  Quality doesn't scale proportionally with DPI")

def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 Phase 2 PDF Image Conversion Tests")
    print("=" * 60)
    
    try:
        test_image_to_pdf()
        test_pdf_to_image()
        test_quality_parameters()
        
        print("\n" + "=" * 60)
        print("✅ Phase 2 Testing Complete!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Fatal Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
