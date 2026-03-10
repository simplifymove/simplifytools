#!/usr/bin/env python3
"""Test PDF merge to identify the issue"""

import tempfile
import os
from pathlib import Path
import fitz  # PyMuPDF
import PyPDF2

# Create test PDFs
def create_test_pdf(name):
    doc = fitz.open()
    page = doc.new_page(width=612, height=792)
    page.insert_text((50, 50), f"Test PDF - {name}")
    
    temp_dir = tempfile.gettempdir()
    pdf_path = os.path.join(temp_dir, f'test_{name}.pdf')
    doc.save(pdf_path)
    doc.close()
    return pdf_path

print("Creating test PDFs...")
pdf1 = create_test_pdf("1")
pdf2 = create_test_pdf("2")
pdf3 = create_test_pdf("3")

print(f"PDF1: {pdf1}")
print(f"PDF2: {pdf2}")
print(f"PDF3: {pdf3}")

# Test merge using PyPDF2
output_path = os.path.join(tempfile.gettempdir(), 'merged_test.pdf')

try:
    print("\nAttempting merge with PyPDF2...")
    merger = PyPDF2.PdfMerger()
    
    for pdf_path in [pdf1, pdf2, pdf3]:
        print(f"  Adding: {pdf_path}")
        merger.append(pdf_path)
    
    print(f"Writing to: {output_path}")
    merger.write(output_path)
    merger.close()
    
    if os.path.exists(output_path):
        size = os.path.getsize(output_path) / 1024
        print(f"✅ Merge successful! Output: {output_path} ({size:.1f} KB)")
    else:
        print("❌ Output file not created")
        
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()

# Test with fitz (alternative)
print("\n\nTesting with PyMuPDF (alternative)...")
try:
    output_pdf = os.path.join(tempfile.gettempdir(), 'merged_fitz.pdf')
    doc = fitz.open()
    
    for pdf_path in [pdf1, pdf2, pdf3]:
        print(f"  Adding: {pdf_path}")
        src = fitz.open(pdf_path)
        doc.insert_pdf(src)
        src.close()
    
    doc.save(output_pdf)
    doc.close()
    
    if os.path.exists(output_pdf):
        size = os.path.getsize(output_pdf) / 1024
        print(f"✅ Merge successful! Output: {output_pdf} ({size:.1f} KB)")
    else:
        print("❌ Output file not created")
        
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
