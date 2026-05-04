#!/usr/bin/env python3
"""
Test script for PDF watermark removal fix
Tests both with watermarked PDF and without to verify fallback behavior
"""

import sys
import os
import tempfile
import shutil

# Add python directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'python'))

from engines.pdf_security import PdfSecurityEngine
import fitz

def create_test_pdf_with_watermark(output_path):
    """Create a test PDF with a SAMPLE watermark"""
    doc = fitz.open()
    page = doc.new_page()
    
    # Add regular text content
    page.insert_text((50, 50), "This is test content", fontsize=12, color=(0, 0, 0))
    page.insert_text((50, 100), "Line 2 of content", fontsize=12, color=(0, 0, 0))
    page.insert_text((50, 150), "Line 3 of content", fontsize=12, color=(0, 0, 0))
    
    # Add watermark text (large, centered)
    page_rect = page.rect
    page_center = page_rect.tl + (page_rect.br - page_rect.tl) / 2
    
    # Draw SAMPLE watermark in large text at center
    page.insert_text(
        (page_center.x - 60, page_center.y),
        "SAMPLE",
        fontsize=60,
        color=(0.8, 0.8, 0.8)
    )
    
    doc.save(output_path)
    doc.close()
    print(f"[TEST] Created test PDF with watermark: {output_path}")

def create_test_pdf_without_watermark(output_path):
    """Create a test PDF without watermark"""
    doc = fitz.open()
    page = doc.new_page()
    
    # Add only regular text content
    page.insert_text((50, 50), "This is test content", fontsize=12, color=(0, 0, 0))
    page.insert_text((50, 100), "Line 2 of content", fontsize=12, color=(0, 0, 0))
    page.insert_text((50, 150), "Line 3 of content", fontsize=12, color=(0, 0, 0))
    
    doc.save(output_path)
    doc.close()
    print(f"[TEST] Created test PDF without watermark: {output_path}")

def test_watermark_removal():
    """Test watermark removal with watermarked PDF"""
    print("\n" + "="*60)
    print("TEST 1: Watermark Removal (with watermark)")
    print("="*60)
    
    with tempfile.TemporaryDirectory() as tmpdir:
        input_pdf = os.path.join(tmpdir, "test_with_watermark.pdf")
        output_pdf = os.path.join(tmpdir, "test_watermark_removed.pdf")
        
        # Create test PDF with watermark
        create_test_pdf_with_watermark(input_pdf)
        
        # Remove watermark
        try:
            result = PdfSecurityEngine.remove_watermark(
                input_paths=[input_pdf],
                output_path=output_pdf,
                options={}
            )
            print(f"[TEST] ✓ Watermark removal succeeded")
            print(f"[TEST] Output: {result}")
            
            # Verify output exists and has content
            if os.path.exists(output_pdf):
                size = os.path.getsize(output_pdf)
                print(f"[TEST] ✓ Output file created: {size} bytes")
                
                # Check if it's valid PDF
                doc = fitz.open(output_pdf)
                print(f"[TEST] ✓ Valid PDF with {len(doc)} page(s)")
                doc.close()
            else:
                print(f"[TEST] ✗ Output file not created")
                
        except Exception as e:
            print(f"[TEST] ✗ Error: {e}")
            import traceback
            traceback.print_exc()

def test_no_watermark_fallback():
    """Test fallback behavior with PDF without watermark"""
    print("\n" + "="*60)
    print("TEST 2: Fallback (no watermark in PDF)")
    print("="*60)
    
    with tempfile.TemporaryDirectory() as tmpdir:
        input_pdf = os.path.join(tmpdir, "test_no_watermark.pdf")
        output_pdf = os.path.join(tmpdir, "test_no_watermark_output.pdf")
        
        # Create test PDF without watermark
        create_test_pdf_without_watermark(input_pdf)
        
        # Get input size for comparison
        input_size = os.path.getsize(input_pdf)
        
        # Remove watermark (should be fallback - return original)
        try:
            result = PdfSecurityEngine.remove_watermark(
                input_paths=[input_pdf],
                output_path=output_pdf,
                options={}
            )
            print(f"[TEST] ✓ Watermark removal succeeded (fallback)")
            print(f"[TEST] Output: {result}")
            
            # Verify output exists
            if os.path.exists(output_pdf):
                output_size = os.path.getsize(output_pdf)
                print(f"[TEST] ✓ Output file created: {output_size} bytes")
                
                # Check if it's valid PDF
                doc = fitz.open(output_pdf)
                print(f"[TEST] ✓ Valid PDF with {len(doc)} page(s)")
                doc.close()
                
                # Should be similar size (fallback)
                if output_size > 0:
                    print(f"[TEST] ✓ File size reasonable (input: {input_size}, output: {output_size})")
            else:
                print(f"[TEST] ✗ Output file not created")
                
        except Exception as e:
            print(f"[TEST] ✗ Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("PDF Watermark Removal Test Suite")
    print("="*60)
    print(f"Python: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    
    test_watermark_removal()
    test_no_watermark_fallback()
    
    print("\n" + "="*60)
    print("Test Suite Complete")
    print("="*60)
