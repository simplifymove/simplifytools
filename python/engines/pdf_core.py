"""
PDF Core Engine
Handles structural PDF operations: merge, split, rotate, rearrange, crop, delete pages, create
"""

import json
from typing import Dict, Any, List
from pathlib import Path
import PyPDF2
import fitz  # PyMuPDF
import io
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
            
            pdf = PyPDF2.PdfReader(pdf_path)
            total_pages = len(pdf.pages)
            page_groups = []
            pages_to_split = []
            skipped_pages = []
            
            if mode == 'all':
                page_groups = [[page_num] for page_num in range(len(pdf.pages))]
            elif mode == 'range' and page_range:
                # Parse range like "1-5" or "1,3,5"
                all_requested = []
                for part in page_range.split(','):
                    if '-' in part:
                        start, end = map(int, part.split('-'))
                        all_requested.extend(range(start, end+1))
                    else:
                        all_requested.append(int(part))
                
                # Separate valid and invalid pages
                for page_num in all_requested:
                    if page_num > 0 and page_num <= total_pages:
                        pages_to_split.append(page_num - 1)  # Convert to 0-based
                    else:
                        skipped_pages.append(page_num)
                
                # Remove duplicates and sort
                pages_to_split = sorted(set(pages_to_split))
                
                # If no valid pages, raise error
                if not pages_to_split:
                    raise Exception(f"No valid pages found. PDF has {total_pages} pages, but requested {skipped_pages}")
                
                # Log skipped pages for frontend warning
                if skipped_pages:
                    print(f"[WARNING] Skipping out-of-range pages: {skipped_pages} (PDF has only {total_pages} pages)")
                page_groups = [[page_num] for page_num in pages_to_split]
                
            elif mode == 'every_n':
                try:
                    every_n = int(options.get('everyN', 1))
                except (TypeError, ValueError):
                    raise Exception("Every N Pages must be a positive integer")
                if every_n <= 0:
                    raise Exception("Every N Pages must be greater than zero")
                page_groups = [
                    list(range(start, min(start + every_n, total_pages)))
                    for start in range(0, total_pages, every_n)
                ]
            
            output_dir = Path(output_path).parent
            results = []
            
            for page_group in page_groups:
                writer = PyPDF2.PdfWriter()
                for page_num in page_group:
                    writer.add_page(pdf.pages[page_num])
                first_page = page_group[0] + 1
                last_page = page_group[-1] + 1
                filename = f"page_{first_page}.pdf" if first_page == last_page else f"pages_{first_page}-{last_page}.pdf"
                out_file = output_dir / filename
                with open(out_file, 'wb') as f:
                    writer.write(f)
                results.append(str(out_file))
            
            # If one output document was produced, return it directly; otherwise ZIP all chunks.
            if len(results) == 1:
                return results[0]
            else:
                import zipfile
                try:
                    # Create ZIP in memory first for reliability
                    zip_buffer = io.BytesIO()
                    
                    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_STORED) as zf:
                        for pdf_file in results:
                            try:
                                with open(pdf_file, 'rb') as f:
                                    file_data = f.read()
                                zf.writestr(Path(pdf_file).name, file_data, compress_type=zipfile.ZIP_STORED)
                            except Exception as e:
                                print(f"[WARNING] Failed to add {pdf_file} to ZIP: {str(e)}")
                    
                    # Write in-memory ZIP to disk
                    zip_buffer.seek(0)
                    with open(output_path, 'wb') as f:
                        f.write(zip_buffer.getvalue())
                    
                    # Verify ZIP was created and is valid
                    if not Path(output_path).exists():
                        raise Exception("ZIP file was not created")
                    
                    zip_size = Path(output_path).stat().st_size
                    if zip_size == 0:
                        raise Exception("ZIP file is empty")
                    
                    try:
                        with zipfile.ZipFile(output_path, 'r') as verify_zf:
                            test_result = verify_zf.testzip()
                            if test_result is not None:
                                raise Exception(f"ZIP file corrupt at: {test_result}")
                    except Exception as e:
                        raise Exception(f"ZIP file validation failed: {str(e)}")
                    
                    # Clean up temporary PDF files
                    import os
                    for pdf_file in results:
                        try:
                            os.remove(pdf_file)
                        except Exception as e:
                            print(f"[WARNING] Failed to clean up {pdf_file}: {str(e)}")
                    
                    return output_path
                except Exception as e:
                    # Clean up on error
                    import os
                    for pdf_file in results:
                        try:
                            os.remove(pdf_file)
                        except:
                            pass
                    raise Exception(f"Failed to create ZIP file: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to split PDF: {str(e)}")
    
    @staticmethod
    def rotate(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Rotate PDF pages"""
        try:
            pdf_path = input_paths[0]
            # Handle both string and numeric angle values from API
            angle_raw = options.get('angle', 90)
            angle = int(angle_raw) if isinstance(angle_raw, str) else angle_raw
            # Validate angle before processing
            if angle not in [90, 180, 270]:
                raise ValueError(f"Invalid rotation angle: {angle}. Must be 90, 180, or 270 degrees.")
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
            page_order = options.get('pageOrder', [])
            
            # Validate that pageOrder was provided
            if not page_order:
                raise ValueError("Page order not provided. Please arrange all PDF pages before submitting.")
            
            # Convert pageOrder to list of integers (handle various formats)
            if isinstance(page_order, str):
                # Handle comma-separated string format: "0,2,1,3"
                try:
                    page_order = [int(idx.strip()) for idx in page_order.split(',') if idx.strip()]
                except ValueError:
                    raise ValueError(f"Invalid page order format. Expected numbers separated by commas, got: {page_order}")
            elif isinstance(page_order, list):
                # Convert all elements to integers
                try:
                    page_order = [int(idx) for idx in page_order]
                except (ValueError, TypeError):
                    raise ValueError(f"Invalid page order: all elements must be numbers")
            else:
                raise ValueError(f"Invalid page order type: {type(page_order)}")
            
            # Validate page order is not empty
            if not page_order:
                raise ValueError("Page order is empty. Please specify all pages.")
            
            # Get total pages in PDF
            pdf = PyPDF2.PdfReader(pdf_path)
            total_pages = len(pdf.pages)
            
            # Validate page order length matches PDF page count
            if len(page_order) != total_pages:
                raise ValueError(f"Page count mismatch: order has {len(page_order)} pages but PDF has {total_pages} pages. Include all pages.")
            
            # Validate all indices are valid
            invalid_indices = [idx for idx in page_order if idx < 0 or idx >= total_pages]
            if invalid_indices:
                raise ValueError(f"Invalid page numbers: {set(invalid_indices)}. Valid range is 0-{total_pages-1}.")
            
            # Check for duplicates
            if len(set(page_order)) != len(page_order):
                raise ValueError("Duplicate page numbers detected. Each page must appear exactly once.")
            
            # Create reordered PDF
            writer = PyPDF2.PdfWriter()
            for page_idx in page_order:
                writer.add_page(pdf.pages[page_idx])
            
            with open(output_path, 'wb') as f:
                writer.write(f)
            return output_path
        except ValueError as ve:
            raise Exception(f"Page order error: {str(ve)}")
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
            
            # Ensure crop_box is a list of integers
            if isinstance(crop_box, (list, tuple)):
                crop_box = [int(x) for x in crop_box]
            else:
                crop_box = [0, 0, 612, 792]
            
            pdf = PyPDF2.PdfReader(pdf_path)
            writer = PyPDF2.PdfWriter()
            
            pages_to_crop = []
            if page_range == 'all' or not page_range:
                pages_to_crop = list(range(len(pdf.pages)))
            else:
                for part in str(page_range).split(','):
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
            pages_to_delete = options.get('pagesToDelete', '')
            
            # Parse pages to delete - convert from string to list of 0-indexed integers
            indices_to_delete = []
            if pages_to_delete:
                if isinstance(pages_to_delete, str):
                    # Handle comma-separated string like "1,3,5" (1-indexed)
                    indices_to_delete = [int(p.strip()) - 1 for p in pages_to_delete.split(',')]
                else:
                    # Handle list of strings like ["1", "3", "5"]
                    indices_to_delete = [int(p) - 1 for p in pages_to_delete]
            
            pdf = PyPDF2.PdfReader(pdf_path)
            writer = PyPDF2.PdfWriter()
            
            for idx, page in enumerate(pdf.pages):
                if idx not in indices_to_delete:
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
        """Compress PDF using pikepdf with aggressive compression settings"""
        try:
            import os as os_module
            import warnings
            
            pdf_path = input_paths[0]
            compression_level = options.get('level', 'medium')
            
            print(f"[COMPRESS] Starting PDF compression...", flush=True)
            
            original_size = os_module.path.getsize(pdf_path)
            print(f"[COMPRESS] Original size: {original_size / 1024 / 1024:.2f} MB", flush=True)
            print(f"[COMPRESS] Compression level: {compression_level}", flush=True)
            
            # Suppress warnings and logger messages
            warnings.filterwarnings('ignore')
            
            # Try pikepdf first for best compression
            try:
                import pikepdf
                import logging
                
                # Suppress pikepdf logger
                logging.getLogger('pikepdf').setLevel(logging.CRITICAL)
                
                print(f"[COMPRESS] Using pikepdf for compression...", flush=True)
                
                with pikepdf.open(pdf_path) as pdf:
                    print(f"[COMPRESS] PDF opened, {len(pdf.pages)} pages", flush=True)
                    
                    # Apply compression based on level
                    print(f"[COMPRESS] Compressing streams...", flush=True)
                    pdf.compress_streams()
                    
                    if compression_level in ['high', 'maximum']:
                        print(f"[COMPRESS] Removing unreferenced objects...", flush=True)
                        pdf.remove_unreferenced_objects()
                    
                    # Save with pikepdf options
                    print(f"[COMPRESS] Writing compressed PDF...", flush=True)
                    pdf.save(output_path, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
                
                compressed_size = os_module.path.getsize(output_path)
                reduction = ((original_size - compressed_size) / original_size) * 100
                
                print(f"[COMPRESS] Compressed size: {compressed_size / 1024 / 1024:.2f} MB", flush=True)
                print(f"[COMPRESS] Reduction: {reduction:.1f}%", flush=True)
                
                return output_path
                
            except Exception as e:
                print(f"[COMPRESS] pikepdf method failed, trying PyMuPDF: {str(e)}", flush=True)
            
            # Fallback to PyMuPDF compression if pikepdf fails
            print(f"[COMPRESS] Using PyMuPDF for compression...", flush=True)
            
            doc = fitz.open(pdf_path)
            print(f"[COMPRESS] PDF opened, {len(doc)} pages", flush=True)
            
            # Set garbage collection level based on compression
            garbage_level = {
                'low': 1,
                'medium': 2,
                'high': 3
            }.get(compression_level, 2)
            
            print(f"[COMPRESS] Applying garbage collection level {garbage_level}...", flush=True)
            
            # Save with maximum compression
            doc.save(output_path, garbage=garbage_level, deflate=True, incremental=False)
            doc.close()
            
            compressed_size = os_module.path.getsize(output_path)
            reduction = ((original_size - compressed_size) / original_size) * 100
            
            print(f"[COMPRESS] Compressed size: {compressed_size / 1024 / 1024:.2f} MB", flush=True)
            print(f"[COMPRESS] Reduction: {reduction:.1f}%", flush=True)
            
            return output_path
            
        except Exception as e:
            import traceback
            error_msg = f"Failed to compress PDF: {str(e)}\n{traceback.format_exc()}"
            print(f"[COMPRESS] ERROR: {error_msg}", flush=True)
            raise Exception(error_msg)
