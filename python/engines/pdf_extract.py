# -*- coding: utf-8 -*-
"""
PDF Extract Engine
Handles extraction: text, images, tables
"""

from typing import Dict, Any, List
from pathlib import Path
import fitz  # PyMuPDF
import zipfile
import pandas as pd
import sys
import traceback


class PdfExtractEngine:
    """PDF extraction operations"""
    
    @staticmethod
    def extract_text(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Extract text from PDF"""
        try:
            pdf_path = input_paths[0]
            page_range = options.get('pageRange', 'all')
            ocr_fallback = options.get('ocrFallback', False)
            
            doc = fitz.open(pdf_path)
            text_content = []
            
            pages_to_extract = []
            if page_range == 'all':
                pages_to_extract = list(range(len(doc)))
            else:
                for part in page_range.split(','):
                    if '-' in part:
                        start, end = map(int, part.split('-'))
                        pages_to_extract.extend(range(start-1, end))
                    else:
                        pages_to_extract.append(int(part)-1)
            
            for page_num in pages_to_extract:
                page = doc[page_num]
                text = page.get_text()
                
                # If page has no text and OCR is enabled, try to OCR it
                if not text.strip() and ocr_fallback:
                    try:
                        import pytesseract
                        from PIL import Image
                        import io
                        
                        # Render page as image
                        pix = page.get_pixmap(alpha=False)
                        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                        
                        # OCR the image
                        text = pytesseract.image_to_string(img)
                    except:
                        text = "[OCR Failed]"
                
                text_content.append(f"--- Page {page_num+1} ---\n{text}\n\n")
            
            doc.close()
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.writelines(text_content)
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to extract text: {str(e)}")
    
    @staticmethod
    def extract_images(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Extract images from PDF"""
        try:
            print("[PDF_EXTRACT_IMAGES] Starting image extraction")
            pdf_path = input_paths[0]
            page_range = options.get('pageRange', 'all')
            image_format = options.get('format', 'png')  # png, jpg
            
            print(f"[PDF_EXTRACT_IMAGES] PDF path: {pdf_path}")
            print(f"[PDF_EXTRACT_IMAGES] Image format: {image_format}")
            print(f"[PDF_EXTRACT_IMAGES] Page range: {page_range}")
            
            print(f"[PDF_EXTRACT_IMAGES] Opening PDF: {pdf_path}")
            doc = fitz.open(pdf_path)
            print(f"[PDF_EXTRACT_IMAGES] PDF opened, total pages: {len(doc)}")
            
            pages_to_extract = []
            if page_range == 'all':
                pages_to_extract = list(range(len(doc)))
            else:
                for part in page_range.split(','):
                    if '-' in part:
                        start, end = map(int, part.split('-'))
                        pages_to_extract.extend(range(start-1, end))
                    else:
                        pages_to_extract.append(int(part)-1)
            
            print(f"[PDF_EXTRACT_IMAGES] Pages to extract: {pages_to_extract}")
            
            output_dir = Path(output_path).parent
            # Create a dedicated temp directory for images (in same location as output zip)
            temp_images_dir = output_dir / f"temp_images_{Path(output_path).stem}"
            temp_images_dir.mkdir(parents=True, exist_ok=True)
            print(f"[PDF_EXTRACT_IMAGES] Created temp images directory: {temp_images_dir}")
            
            # Use temp_images_dir instead of output_dir for saving images
            save_images_dir = temp_images_dir
            
            image_files = []
            image_count = 0
            
            for page_num in pages_to_extract:
                print(f"[PDF_EXTRACT_IMAGES] Processing page {page_num + 1}")
                try:
                    page = doc[page_num]
                    image_list = page.get_images()
                    print(f"[PDF_EXTRACT_IMAGES] Page {page_num + 1} has {len(image_list)} images")
                    
                    for img_index, img in enumerate(image_list):
                        try:
                            print(f"[PDF_EXTRACT_IMAGES] Extracting image {img_index} from page {page_num + 1}")
                            xref = img[0]
                            print(f"[PDF_EXTRACT_IMAGES] Image xref: {xref}")
                            
                            pix = fitz.Pixmap(doc, xref)
                            print(f"[PDF_EXTRACT_IMAGES] Pixmap created: {pix.width}x{pix.height}, n={pix.n}, alpha={pix.alpha}")
                            
                            # Convert CMYK or other formats to RGB
                            if pix.n - pix.alpha < 4:  # GRAY or RGB
                                pix = fitz.Pixmap(fitz.csRGB, pix)
                                print(f"[PDF_EXTRACT_IMAGES] Converted to RGB: {pix.width}x{pix.height}")
                            
                            image_count += 1
                            img_file = save_images_dir / f"image_{page_num+1}_{img_index}.{image_format}"
                            
                            print(f"[PDF_EXTRACT_IMAGES] Saving image to: {img_file}")
                            # PyMuPDF's Pixmap.save() method auto-detects format from filename extension
                            pix.save(str(img_file))
                            
                            # Verify file was actually created
                            if img_file.exists():
                                file_size = img_file.stat().st_size
                                print(f"[PDF_EXTRACT_IMAGES] Image saved successfully, size: {file_size} bytes")
                                image_files.append(str(img_file))
                            else:
                                print(f"[PDF_EXTRACT_IMAGES] ERROR: Image file was not created: {img_file}", file=sys.stderr)
                        except Exception as img_error:
                            print(f"[PDF_EXTRACT_IMAGES] Error extracting image {img_index} on page {page_num + 1}: {str(img_error)}", file=sys.stderr)
                            print(f"[PDF_EXTRACT_IMAGES] {traceback.format_exc()}", file=sys.stderr)
                            # Continue with next image rather than failing completely
                            
                except Exception as page_error:
                    print(f"[PDF_EXTRACT_IMAGES] Error processing page {page_num + 1}: {str(page_error)}", file=sys.stderr)
                    print(f"[PDF_EXTRACT_IMAGES] {traceback.format_exc()}", file=sys.stderr)
                    # Continue with next page rather than failing completely
            
            doc.close()
            print(f"[PDF_EXTRACT_IMAGES] PDF closed")
            
            print(f"[PDF_EXTRACT_IMAGES] Total images extracted: {image_count}")
            print(f"[PDF_EXTRACT_IMAGES] Total image files to zip: {len(image_files)}")
            
            if image_count == 0:
                raise Exception("No images found in PDF")
            
            if not image_files:
                raise Exception("No image files were successfully saved")
            
            # If single image, return it; else zip
            if len(image_files) == 1:
                print(f"[PDF_EXTRACT_IMAGES] Single image found, returning: {image_files[0]}")
                return image_files[0]
            else:
                print(f"[PDF_EXTRACT_IMAGES] Multiple images found ({len(image_files)}), creating ZIP archive: {output_path}")
                try:
                    # Use ZIP_DEFLATED for compression
                    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                        for idx, img_file in enumerate(image_files):
                            img_file_str = str(img_file)
                            if Path(img_file_str).exists():
                                file_size = Path(img_file_str).stat().st_size
                                arcname = Path(img_file_str).name
                                print(f"[PDF_EXTRACT_IMAGES] Adding image {idx+1}/{len(image_files)}: {arcname} ({file_size} bytes)")
                                zf.write(img_file_str, arcname=arcname)
                                print(f"[PDF_EXTRACT_IMAGES] Successfully added to ZIP: {arcname}")
                            else:
                                print(f"[PDF_EXTRACT_IMAGES] WARNING: Image file not found, skipping: {img_file_str}", file=sys.stderr)
                    
                    # Verify zip file was created and has content
                    zip_size = Path(output_path).stat().st_size if Path(output_path).exists() else 0
                    print(f"[PDF_EXTRACT_IMAGES] ZIP archive created successfully")
                    print(f"[PDF_EXTRACT_IMAGES] ZIP file size: {zip_size} bytes")
                    print(f"[PDF_EXTRACT_IMAGES] ZIP file path: {output_path}")
                    
                    if zip_size == 0:
                        raise Exception("ZIP file is empty - images may not have been added")
                    
                    return output_path
                except Exception as zip_error:
                    print(f"[PDF_EXTRACT_IMAGES] ZIP creation error: {str(zip_error)}", file=sys.stderr)
                    print(f"[PDF_EXTRACT_IMAGES] {traceback.format_exc()}", file=sys.stderr)
                    raise Exception(f"Failed to create ZIP archive: {str(zip_error)}")
                finally:
                    # Clean up temp image directory
                    try:
                        import shutil
                        if temp_images_dir.exists():
                            print(f"[PDF_EXTRACT_IMAGES] Cleaning up temp directory: {temp_images_dir}")
                            shutil.rmtree(temp_images_dir)
                    except Exception as cleanup_error:
                        print(f"[PDF_EXTRACT_IMAGES] Warning: Failed to clean up temp directory: {cleanup_error}", file=sys.stderr)
        except Exception as e:
            error_msg = f"Failed to extract images: {str(e)}"
            print(f"[PDF_EXTRACT_IMAGES] ERROR: {error_msg}", file=sys.stderr)
            print(f"[PDF_EXTRACT_IMAGES] {traceback.format_exc()}", file=sys.stderr)
            raise Exception(error_msg)
    
    @staticmethod
    def extract_tables(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Extract tables from PDF to Excel/CSV"""
        try:
            print("[PDF_EXTRACT_TABLES] Starting table extraction")
            pdf_path = input_paths[0]
            output_format = options.get('format', 'csv')  # csv, xlsx
            page_range = options.get('pageRange', 'all')
            
            print(f"[PDF_EXTRACT_TABLES] PDF path: {pdf_path}")
            print(f"[PDF_EXTRACT_TABLES] Output format: {output_format}")
            print(f"[PDF_EXTRACT_TABLES] Page range: {page_range}")
            
            # Use pdfplumber for table extraction
            try:
                import pdfplumber
                print("[PDF_EXTRACT_TABLES] pdfplumber imported successfully")
            except ImportError as e:
                raise Exception(f"pdfplumber not installed: {str(e)}")
            
            all_tables = []
            table_metadata = []
            
            print(f"[PDF_EXTRACT_TABLES] Opening PDF file: {pdf_path}")
            with pdfplumber.open(pdf_path) as pdf:
                print(f"[PDF_EXTRACT_TABLES] PDF opened, total pages: {len(pdf.pages)}")
                
                pages_to_extract = []
                if page_range == 'all':
                    pages_to_extract = list(range(len(pdf.pages)))
                else:
                    for part in page_range.split(','):
                        if '-' in part:
                            start, end = map(int, part.split('-'))
                            pages_to_extract.extend(range(start-1, end))
                        else:
                            pages_to_extract.append(int(part)-1)
                
                print(f"[PDF_EXTRACT_TABLES] Pages to extract: {pages_to_extract}")
                
                for page_num in pages_to_extract:
                    print(f"[PDF_EXTRACT_TABLES] Processing page {page_num + 1}")
                    try:
                        page = pdf.pages[page_num]
                        print(f"[PDF_EXTRACT_TABLES] Page {page_num + 1} opened")
                        
                        tables = page.extract_tables()
                        print(f"[PDF_EXTRACT_TABLES] Page {page_num + 1} has {len(tables) if tables else 0} tables")
                        
                        if tables:
                            for table_idx, table in enumerate(tables):
                                print(f"[PDF_EXTRACT_TABLES] Table {table_idx} on page {page_num + 1}: {len(table)} rows x {len(table[0]) if table else 0} cols")
                                all_tables.append(table)
                                table_metadata.append({'page': page_num + 1, 'table_on_page': table_idx})
                    except Exception as page_error:
                        print(f"[PDF_EXTRACT_TABLES] Error processing page {page_num + 1}: {str(page_error)}")
                        print(f"[PDF_EXTRACT_TABLES] Traceback: {traceback.format_exc()}")
                        raise
            
            print(f"[PDF_EXTRACT_TABLES] Total tables extracted: {len(all_tables)}")
            
            if not all_tables:
                raise Exception("No tables found in PDF - the PDF may not contain any structured tables")
            
            # Convert to DataFrame and save
            print(f"[PDF_EXTRACT_TABLES] Converting first table to DataFrame")
            first_table = all_tables[0]
            print(f"[PDF_EXTRACT_TABLES] First table structure: {len(first_table)} rows, {len(first_table[0]) if first_table else 0} columns")
            
            # Create DataFrame from the first table
            if len(first_table) > 0:
                # Use first row as header if it exists
                headers = first_table[0] if len(first_table) > 0 else None
                data_rows = first_table[1:] if len(first_table) > 1 else first_table
                
                if headers and data_rows:
                    df = pd.DataFrame(data_rows, columns=headers)
                else:
                    df = pd.DataFrame(first_table)
                
                print(f"[PDF_EXTRACT_TABLES] DataFrame created: {df.shape[0]} rows x {df.shape[1]} columns")
            else:
                raise Exception("First table is empty")
            
            print(f"[PDF_EXTRACT_TABLES] Saving to {output_path} as {output_format}")
            
            if output_format == 'xlsx':
                df.to_excel(output_path, index=False, engine='openpyxl')
                print(f"[PDF_EXTRACT_TABLES] Saved to Excel: {output_path}")
            else:  # CSV
                df.to_csv(output_path, index=False, encoding='utf-8')
                print(f"[PDF_EXTRACT_TABLES] Saved to CSV: {output_path}")
            
            print(f"[PDF_EXTRACT_TABLES] Table extraction complete")
            return output_path
        except Exception as e:
            error_msg = f"Failed to extract tables: {str(e)}"
            print(f"[PDF_EXTRACT_TABLES] ERROR: {error_msg}", file=sys.stderr)
            print(f"[PDF_EXTRACT_TABLES] {traceback.format_exc()}", file=sys.stderr)
            raise Exception(error_msg)
