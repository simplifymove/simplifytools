"""
PDF Core Engine
Handles structural PDF operations: merge, split, rotate, rearrange, crop, delete pages, create
"""

import json
from typing import Dict, Any, List
from pathlib import Path
import PyPDF2
import fitz  # PyMuPDF
from PIL import Image, ImageDraw


class PdfCoreEngine:
    """Core PDF structural operations"""
    
    @staticmethod
    def merge(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Merge multiple PDF files"""
        try:
            if not input_paths or len(input_paths) < 2:
                raise ValueError("At least 2 PDF files required for merge")
            
            # Verify all input files exist
            for pdf_path in input_paths:
                if not Path(pdf_path).exists():
                    raise FileNotFoundError(f"Input file not found: {pdf_path}")
            
            # Try PyPDF2 first
            try:
                merger = PyPDF2.PdfMerger()
                for pdf_path in input_paths:
                    merger.append(pdf_path)
                merger.write(output_path)
                merger.close()
                
                # Verify output was created
                if not Path(output_path).exists():
                    raise Exception("Output file was not created by PyPDF2")
                
                return output_path
            
            except Exception as e1:
                # Fallback to PyMuPDF (fitz)
                try:
                    doc = fitz.open()
                    for pdf_path in input_paths:
                        src = fitz.open(pdf_path)
                        doc.insert_pdf(src)
                        src.close()
                    doc.save(output_path)
                    doc.close()
                    
                    if not Path(output_path).exists():
                        raise Exception("Output file was not created by fitz")
                    
                    return output_path
                except Exception as e2:
                    raise Exception(f"Merge failed with both PyPDF2 ({str(e1)}) and fitz ({str(e2)})")
        
        except Exception as e:
            raise Exception(f"Failed to merge PDFs: {str(e)}")
    
    @staticmethod
    def split(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Split PDF into pages or by range"""
        try:
            pdf_path = input_paths[0]
            mode = options.get('mode', 'all')  # all, range, every_n
            page_range = options.get('pageRange', '')
            every_n = int(options.get('everyN', 1))
            
            pdf = PyPDF2.PdfReader(pdf_path)
            pages_to_split = []
            
            if mode == 'all':
                pages_to_split = list(range(len(pdf.pages)))
            elif mode == 'range' and page_range:
                # Parse range like "1-5" or "1,3,5"
                for part in page_range.split(','):
                    if '-' in part:
                        start, end = map(int, part.split('-'))
                        pages_to_split.extend(range(start-1, end))
                    else:
                        pages_to_split.append(int(part)-1)
            elif mode == 'every_n':
                pages_to_split = list(range(0, len(pdf.pages), every_n))
            
            output_dir = Path(output_path).parent
            results = []
            
            for idx, page_num in enumerate(pages_to_split):
                writer = PyPDF2.PdfWriter()
                writer.add_page(pdf.pages[page_num])
                out_file = output_dir / f"page_{page_num+1}.pdf"
                with open(out_file, 'wb') as f:
                    writer.write(f)
                results.append(str(out_file))
            
            # If single page, return it; else zip all
            if len(results) == 1:
                return results[0]
            else:
                import zipfile
                with zipfile.ZipFile(output_path, 'w') as zf:
                    for pdf_file in results:
                        zf.write(pdf_file, arcname=Path(pdf_file).name)
                return output_path
        except Exception as e:
            raise Exception(f"Failed to split PDF: {str(e)}")
    
    @staticmethod
    def rotate(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Rotate PDF pages"""
        try:
            pdf_path = input_paths[0]
            angle = int(options.get('angle', 90))  # 90, 180, 270
            page_range = options.get('pageRange', 'all')
            
            pdf = PyPDF2.PdfReader(pdf_path)
            writer = PyPDF2.PdfWriter()
            
            pages_to_rotate = []
            if page_range == 'all':
                pages_to_rotate = list(range(len(pdf.pages)))
            else:
                for part in page_range.split(','):
                    if '-' in part:
                        start, end = map(int, part.split('-'))
                        pages_to_rotate.extend(range(start-1, end))
                    else:
                        pages_to_rotate.append(int(part)-1)
            
            for idx, page in enumerate(pdf.pages):
                if idx in pages_to_rotate:
                    page.rotate(angle)
                writer.add_page(page)
            
            with open(output_path, 'wb') as f:
                writer.write(f)
            return output_path
        except Exception as e:
            raise Exception(f"Failed to rotate PDF: {str(e)}")
    
    @staticmethod
    def rearrange(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Rearrange PDF pages"""
        try:
            pdf_path = input_paths[0]
            page_order = options.get('pageOrder', [])  # e.g., [0, 2, 1, 3]
            
            if not page_order:
                raise ValueError("pageOrder not provided")
            
            pdf = PyPDF2.PdfReader(pdf_path)
            writer = PyPDF2.PdfWriter()
            
            for page_idx in page_order:
                writer.add_page(pdf.pages[page_idx])
            
            with open(output_path, 'wb') as f:
                writer.write(f)
            return output_path
        except Exception as e:
            raise Exception(f"Failed to rearrange PDF: {str(e)}")
    
    @staticmethod
    def crop(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Crop PDF pages"""
        try:
            pdf_path = input_paths[0]
            page_range = options.get('pageRange', 'all')
            # Crop box: [left, bottom, right, top]
            crop_box = options.get('cropBox', [0, 0, 612, 792])
            
            pdf = PyPDF2.PdfReader(pdf_path)
            writer = PyPDF2.PdfWriter()
            
            pages_to_crop = []
            if page_range == 'all':
                pages_to_crop = list(range(len(pdf.pages)))
            else:
                for part in page_range.split(','):
                    if '-' in part:
                        start, end = map(int, part.split('-'))
                        pages_to_crop.extend(range(start-1, end))
                    else:
                        pages_to_crop.append(int(part)-1)
            
            for idx, page in enumerate(pdf.pages):
                if idx in pages_to_crop:
                    page.mediabox.lower_left = (crop_box[0], crop_box[1])
                    page.mediabox.upper_right = (crop_box[2], crop_box[3])
                writer.add_page(page)
            
            with open(output_path, 'wb') as f:
                writer.write(f)
            return output_path
        except Exception as e:
            raise Exception(f"Failed to crop PDF: {str(e)}")
    
    @staticmethod
    def delete_pages(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Delete specific pages from PDF"""
        try:
            pdf_path = input_paths[0]
            pages_to_delete = options.get('pagesToDelete', [])  # 0-indexed
            
            pdf = PyPDF2.PdfReader(pdf_path)
            writer = PyPDF2.PdfWriter()
            
            for idx, page in enumerate(pdf.pages):
                if idx not in pages_to_delete:
                    writer.add_page(page)
            
            with open(output_path, 'wb') as f:
                writer.write(f)
            return output_path
        except Exception as e:
            raise Exception(f"Failed to delete pages: {str(e)}")
    
    @staticmethod
    def create(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Create PDF from images or blank pages"""
        try:
            doc = fitz.open()
            
            if input_paths:  # Create from images
                for img_path in input_paths:
                    img = Image.open(img_path)
                    width, height = img.size
                    # Create page
                    page = doc.new_page(width=width, height=height)
                    pix = fitz.Pixmap(img_path)
                    rect = fitz.Rect(0, 0, width, height)
                    page.insert_image(rect, pixmap=pix)
            else:  # Create blank pages
                num_pages = int(options.get('numPages', 1))
                width = float(options.get('width', 612))
                height = float(options.get('height', 792))
                
                for _ in range(num_pages):
                    doc.new_page(width=width, height=height)
            
            doc.save(output_path)
            doc.close()
            return output_path
        except Exception as e:
            raise Exception(f"Failed to create PDF: {str(e)}")
    
    @staticmethod
    def compress(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Compress PDF by recompressing images and removing unused objects"""
        try:
            pdf_path = input_paths[0]
            compression_level = options.get('level', 'medium')  # low, medium, high
            
            doc = fitz.open(pdf_path)
            
            # Compression quality settings
            quality_map = {
                'low': 85,     # Lower compression
                'medium': 70,  # Medium
                'high': 50     # High compression
            }
            quality = quality_map.get(compression_level, 70)
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                # Re-compress images
                images = page.get_images()
                for img_index in images:
                    xref = img_index[0]
                    pix = fitz.Pixmap(doc, xref)
                    if pix.n - pix.alpha < 4:  # GRAY or RGB
                        pix = fitz.Pixmap(fitz.csRGB, pix)
                    pix.save_png(f'/tmp/img_{xref}.png')
                    pix_new = fitz.Pixmap(f'/tmp/img_{xref}.png')
                    doc.replace_image(xref, pixmap=pix_new)
            
            # Clean unused objects
            doc.xref_stream()
            doc.save(output_path, garbage=3, deflate=True)
            doc.close()
            return output_path
        except Exception as e:
            raise Exception(f"Failed to compress PDF: {str(e)}")
