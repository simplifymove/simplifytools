#!/usr/bin/env python3
"""
Phase 3: PDF Edit & Stamp Tools - Test Suite
Tests all 6 edit operations: text, watermark, page numbers, annotations, signatures
"""

import json
import sys
import tempfile
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pdf_router import PdfRouter
import fitz  # PyMuPDF

def create_test_pdf():
    """Create a test PDF with multiple pages"""
    doc = fitz.open()
    
    # Page 1
    page = doc.new_page(width=612, height=792)
    page.insert_text((50, 50), "Test PDF - Page 1")
    page.insert_text((50, 100), "Some sample content for testing")
    
    # Page 2
    page = doc.new_page(width=612, height=792)
    page.insert_text((50, 50), "Test PDF - Page 2")
    
    # Page 3
    page = doc.new_page(width=612, height=792)
    page.insert_text((50, 50), "Test PDF - Page 3")
    
    temp_dir = tempfile.gettempdir()
    pdf_path = os.path.join(temp_dir, 'test_phase3.pdf')
    doc.save(pdf_path)
    doc.close()
    return pdf_path

def test_add_text():
    """Test: Add Text to PDF"""
    print("\n" + "="*60)
    print("1️⃣  TEST: Add Text to PDF")
    print("="*60)
    
    pdf_path = create_test_pdf()
    temp_dir = tempfile.gettempdir()
    output_path = os.path.join(temp_dir, 'output_add_text.pdf')
    
    try:
        print("Adding text...")
        result = PdfRouter.process(
            tool_id='add-text',
            input_paths=[pdf_path],
            output_path=output_path,
            options={
                'text': 'Important Note',
                'pageNumber': 0,
                'x': 200,
                'y': 200,
                'fontSize': 18,
                'color': '255,0,0'  # Red
            }
        )
        
        if os.path.exists(result):
            print(f"✅ Success! Output: {result}")
            doc = fitz.open(result)
            print(f"   Pages: {len(doc)}")
            doc.close()
        else:
            print("❌ Output file not created")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    return True

def test_add_watermark():
    """Test: Add Watermark to PDF"""
    print("\n" + "="*60)
    print("2️⃣  TEST: Add Watermark")
    print("="*60)
    
    pdf_path = create_test_pdf()
    temp_dir = tempfile.gettempdir()
    output_path = os.path.join(temp_dir, 'output_watermark.pdf')
    
    try:
        print("Adding watermark...")
        result = PdfRouter.process(
            tool_id='add-watermark',
            input_paths=[pdf_path],
            output_path=output_path,
            options={
                'text': 'CONFIDENTIAL',
                'opacity': 0.2,
                'pageRange': 'all'
            }
        )
        
        if os.path.exists(result):
            print(f"✅ Success! Output: {result}")
            doc = fitz.open(result)
            print(f"   Pages: {len(doc)}")
            doc.close()
        else:
            print("❌ Output file not created")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    return True

def test_add_page_numbers():
    """Test: Add Page Numbers to PDF"""
    print("\n" + "="*60)
    print("3️⃣  TEST: Add Page Numbers")
    print("="*60)
    
    pdf_path = create_test_pdf()
    temp_dir = tempfile.gettempdir()
    output_path = os.path.join(temp_dir, 'output_page_numbers.pdf')
    
    try:
        print("Adding page numbers...")
        result = PdfRouter.process(
            tool_id='add-numbers-to-pdf',
            input_paths=[pdf_path],
            output_path=output_path,
            options={
                'position': 'bottom-right',
                'fontSize': 12,
                'startNumber': 1,
                'pageRange': 'all'
            }
        )
        
        if os.path.exists(result):
            print(f"✅ Success! Output: {result}")
            doc = fitz.open(result)
            print(f"   Pages: {len(doc)}")
            doc.close()
        else:
            print("❌ Output file not created")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    return True

def test_add_watermark_page_range():
    """Test: Add Watermark to Specific Pages"""
    print("\n" + "="*60)
    print("4️⃣  TEST: Add Watermark to Specific Pages")
    print("="*60)
    
    pdf_path = create_test_pdf()
    temp_dir = tempfile.gettempdir()
    output_path = os.path.join(temp_dir, 'output_watermark_range.pdf')
    
    try:
        print("Adding watermark to pages 1-2...")
        result = PdfRouter.process(
            tool_id='add-watermark',
            input_paths=[pdf_path],
            output_path=output_path,
            options={
                'text': 'DRAFT',
                'opacity': 0.4,
                'pageRange': '1-2'
            }
        )
        
        if os.path.exists(result):
            print(f"✅ Success! Output: {result}")
            doc = fitz.open(result)
            print(f"   Pages: {len(doc)}")
            print("   (Watermark should only be on pages 1-2)")
            doc.close()
        else:
            print("❌ Output file not created")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    return True

def test_add_annotation():
    """Test: Annotate PDF"""
    print("\n" + "="*60)
    print("5️⃣  TEST: Annotate PDF")
    print("="*60)
    
    pdf_path = create_test_pdf()
    temp_dir = tempfile.gettempdir()
    output_path = os.path.join(temp_dir, 'output_annotate.pdf')
    
    try:
        print("Adding annotation...")
        result = PdfRouter.process(
            tool_id='annotate-pdf',
            input_paths=[pdf_path],
            output_path=output_path,
            options={
                'type': 'highlight',
                'pageNumber': 0,
                'text': 'This is important!',
                'rect': [50, 50, 300, 100]
            }
        )
        
        if os.path.exists(result):
            print(f"✅ Success! Output: {result}")
            doc = fitz.open(result)
            print(f"   Pages: {len(doc)}")
            annots = doc[0].annots() if doc[0].annots() else []
            print(f"   Annotations: {len(list(annots)) if annots else 0}")
            doc.close()
        else:
            print("❌ Output file not created")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    return True

def test_add_signature():
    """Test: Add eSignature to PDF"""
    print("\n" + "="*60)
    print("6️⃣  TEST: Add eSignature")
    print("="*60)
    
    pdf_path = create_test_pdf()
    temp_dir = tempfile.gettempdir()
    output_path = os.path.join(temp_dir, 'output_signature.pdf')
    
    try:
        print("Adding signature...")
        result = PdfRouter.process(
            tool_id='esign-pdf',
            input_paths=[pdf_path],
            output_path=output_path,
            options={
                'pageNumber': 2,  # Last page
                'signatureText': 'John Doe',
                'x': 100,
                'y': 700
            }
        )
        
        if os.path.exists(result):
            print(f"✅ Success! Output: {result}")
            doc = fitz.open(result)
            print(f"   Pages: {len(doc)}")
            print("   Signature added to page 3")
            doc.close()
        else:
            print("❌ Output file not created")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    return True

def test_combined_operations():
    """Test: Multiple Operations on Same PDF"""
    print("\n" + "="*60)
    print("7️⃣  TEST: Combined Operations")
    print("="*60)
    
    pdf_path = create_test_pdf()
    temp_dir = tempfile.gettempdir()
    
    try:
        # Step 1: Add watermark
        print("Step 1: Adding watermark...")
        step1_output = os.path.join(temp_dir, 'step1_watermark.pdf')
        step1 = PdfRouter.process(
            tool_id='add-watermark',
            input_paths=[pdf_path],
            output_path=step1_output,
            options={'text': 'REVIEW', 'opacity': 0.3, 'pageRange': 'all'}
        )
        print(f"  ✓ Watermark added")
        
        # Step 2: Add page numbers
        print("Step 2: Adding page numbers...")
        step2_output = os.path.join(temp_dir, 'step2_numbers.pdf')
        step2 = PdfRouter.process(
            tool_id='add-numbers-to-pdf',
            input_paths=[step1],
            output_path=step2_output,
            options={'position': 'bottom-center', 'fontSize': 10, 'startNumber': 1}
        )
        print(f"  ✓ Page numbers added")
        
        # Step 3: Add text
        print("Step 3: Adding text...")
        step3_output = os.path.join(temp_dir, 'step3_text.pdf')
        step3 = PdfRouter.process(
            tool_id='add-text',
            input_paths=[step2],
            output_path=step3_output,
            options={'text': 'APPROVED', 'pageNumber': 2, 'x': 400, 'y': 700, 'fontSize': 14, 'color': '0,128,0'}
        )
        print(f"  ✓ Text added")
        
        if os.path.exists(step3):
            print(f"\n✅ Combined operations successful!")
            print(f"   Final output: {step3}")
            doc = fitz.open(step3)
            print(f"   Pages: {len(doc)}")
            doc.close()
        else:
            print("❌ Final output not created")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

def main():
    """Run all Phase 3 tests"""
    print("\n" + "="*60)
    print("🧪 PHASE 3: PDF EDIT & STAMP TOOLS - TEST SUITE")
    print("="*60)
    
    results = []
    
    results.append(("Add Text", test_add_text()))
    results.append(("Add Watermark", test_add_watermark()))
    results.append(("Add Page Numbers", test_add_page_numbers()))
    results.append(("Watermark Page Range", test_add_watermark_page_range()))
    results.append(("Annotate PDF", test_add_annotation()))
    results.append(("Add Signature", test_add_signature()))
    results.append(("Combined Operations", test_combined_operations()))
    
    # Summary
    print("\n" + "="*60)
    print("📋 TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All Phase 3 tests passed!")
        return 0
    else:
        print(f"\n❌ {total - passed} test(s) failed")
        return 1

if __name__ == '__main__':
    sys.exit(main())
