#!/usr/bin/env python3
"""
Test PDF merge through the actual pdf_router
Simulates the workflow that happens when user submits form
"""

import json
import sys
import tempfile
import os
from pathlib import Path

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pdf_router import PdfRouter
import fitz  # PyMuPDF

def create_test_pdfs():
    """Create 3 test PDF files"""
    temp_dir = tempfile.gettempdir()
    pdf_files = []
    
    for i in range(3):
        doc = fitz.open()
        page = doc.new_page(width=612, height=792)
        page.insert_text((50, 50 + i*20), f"Test PDF {i+1}")
        
        pdf_path = os.path.join(temp_dir, f'merge_test_{i+1}.pdf')
        doc.save(pdf_path)
        doc.close()
        pdf_files.append(pdf_path)
        print(f"Created: {pdf_path}")
    
    return pdf_files

def test_merge_via_router():
    """Test merge through PdfRouter (as called from API)"""
    print("\n" + "="*60)
    print("Testing PDF Merge via PdfRouter")
    print("="*60)
    
    # Create test PDFs
    input_files = create_test_pdfs()
    
    # Create output path
    temp_dir = tempfile.gettempdir()
    output_path = os.path.join(temp_dir, 'merged_output.pdf')
    
    # Test merge
    try:
        print(f"\nInput files: {len(input_files)}")
        for f in input_files:
            print(f"  - {f}")
        
        print(f"\nOutput path: {output_path}")
        
        # Call router
        result = PdfRouter.process(
            tool_id='merge-pdf',
            input_paths=input_files,
            output_path=output_path,
            options={}
        )
        
        print(f"\n✅ Merge successful!")
        print(f"Result: {result}")
        
        if os.path.exists(result):
            size = os.path.getsize(result) / 1024
            doc = fitz.open(result)
            num_pages = len(doc)
            doc.close()
            print(f"Output file: {result}")
            print(f"File size: {size:.1f} KB")
            print(f"Pages: {num_pages}")
        else:
            print("❌ Output file not found!")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == '__main__':
    success = test_merge_via_router()
    sys.exit(0 if success else 1)
