"""
PDF Extract Engine
Handles extraction: text, images, tables
"""

from typing import Dict, Any, List
from pathlib import Path
import fitz  # PyMuPDF
import zipfile
import pandas as pd


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
            pdf_path = input_paths[0]
            page_range = options.get('pageRange', 'all')
            image_format = options.get('format', 'png')  # png, jpg
            
            doc = fitz.open(pdf_path)
            
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
            
            output_dir = Path(output_path).parent
            image_files = []
            image_count = 0
            
            for page_num in pages_to_extract:
                page = doc[page_num]
                image_list = page.get_images()
                
                for img_index, img in enumerate(image_list):
                    xref = img[0]
                    pix = fitz.Pixmap(doc, xref)
                    
                    if pix.n - pix.alpha < 4:  # GRAY or RGB
                        pix = fitz.Pixmap(fitz.csRGB, pix)
                    
                    image_count += 1
                    img_file = output_dir / f"image_{page_num+1}_{img_index}.{image_format}"
                    
                    if image_format == 'jpg':
                        pix.save_jpeg(str(img_file))
                    else:
                        pix.save_png(str(img_file))
                    
                    image_files.append(str(img_file))
            
            doc.close()
            
            if image_count == 0:
                raise Exception("No images found in PDF")
            
            # If single image, return it; else zip
            if len(image_files) == 1:
                return image_files[0]
            else:
                with zipfile.ZipFile(output_path, 'w') as zf:
                    for img_file in image_files:
                        zf.write(img_file, arcname=Path(img_file).name)
                return output_path
        except Exception as e:
            raise Exception(f"Failed to extract images: {str(e)}")
    
    @staticmethod
    def extract_tables(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Extract tables from PDF to Excel/CSV"""
        try:
            pdf_path = input_paths[0]
            output_format = options.get('format', 'csv')  # csv, xlsx
            page_range = options.get('pageRange', 'all')
            
            # Use pdfplumber for table extraction
            import pdfplumber
            
            all_tables = []
            
            with pdfplumber.open(pdf_path) as pdf:
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
                
                for page_num in pages_to_extract:
                    page = pdf.pages[page_num]
                    tables = page.extract_tables()
                    
                    if tables:
                        for table in tables:
                            all_tables.append(table)
            
            if not all_tables:
                raise Exception("No tables found in PDF")
            
            # Convert to DataFrame and save
            df = pd.DataFrame(all_tables[0])
            
            if output_format == 'xlsx':
                df.to_excel(output_path, index=False)
            else:  # CSV
                df.to_csv(output_path, index=False)
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to extract tables: {str(e)}")
