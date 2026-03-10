"""
PDF Convert Engine
Handles format conversions: PDF to images, images to PDF, document conversions
"""

from typing import Dict, Any, List
from pathlib import Path
import PyPDF2
import fitz  # PyMuPDF
from PIL import Image
import zipfile
import os
import time


class PdfConvertEngine:
    """PDF format conversion operations"""
    
    @staticmethod
    def pdf_to_image(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Convert PDF to JPG/PNG/TIFF images at specified DPI"""
        try:
            pdf_path = input_paths[0]
            output_format = options.get('format', 'jpg')  # jpg, png, tiff
            dpi = int(options.get('dpi', 150))
            page_mode = options.get('pageMode', 'all')  # all, selected
            page_range = options.get('pageRange', '')
            
            doc = fitz.open(pdf_path)
            zoom = dpi / 72.0
            mat = fitz.Matrix(zoom, zoom)
            
            pages_to_convert = []
            if page_mode == 'all':
                pages_to_convert = list(range(len(doc)))
            else:
                for part in page_range.split(','):
                    if '-' in part:
                        start, end = map(int, part.split('-'))
                        pages_to_convert.extend(range(start-1, end))
                    else:
                        pages_to_convert.append(int(part)-1)
            
            output_dir = Path(output_path).parent
            output_files = []
            
            for page_num in pages_to_convert:
                page = doc[page_num]
                pix = page.get_pixmap(matrix=mat, alpha=False)
                
                # Determine output extension and format
                output_format_lower = output_format.lower()
                if output_format_lower == 'jpg':
                    output_format_lower = 'jpeg'
                    ext = 'jpg'
                elif output_format_lower == 'tiff':
                    ext = 'tiff'
                else:
                    ext = output_format_lower
                
                out_file = output_dir / f"page_{page_num+1}.{ext}"
                
                if output_format_lower == 'jpeg':
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    img.save(out_file, "JPEG", quality=95)
                elif output_format_lower == 'tiff':
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    img.save(out_file, "TIFF", compression='lzw')
                else:  # PNG and others
                    pix.save_png(str(out_file))
                
                output_files.append(str(out_file))
            
            doc.close()
            
            # If single page return it, else zip
            if len(output_files) == 1:
                return output_files[0]
            else:
                with zipfile.ZipFile(output_path, 'w') as zf:
                    for img_file in output_files:
                        zf.write(img_file, arcname=Path(img_file).name)
                return output_path
        except Exception as e:
            raise Exception(f"Failed to convert PDF to image: {str(e)}")
    
    @staticmethod
    def image_to_pdf(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Convert images to PDF with proper scaling and orientation"""
        try:
            # Standard PDF page size (8.5 x 11 inches at 72 DPI = 612 x 792 points)
            page_width = 612
            page_height = 792
            
            doc = fitz.open()
            
            for idx, img_path in enumerate(input_paths):
                try:
                    # Open the image
                    img = Image.open(img_path)
                    
                    # Convert RGBA to RGB if needed (for JPEG compatibility)
                    if img.mode in ('RGBA', 'LA', 'P'):
                        bg = Image.new('RGB', img.size, (255, 255, 255))
                        if img.mode == 'P':
                            img = img.convert('RGBA')
                        bg.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                        img = bg
                    elif img.mode != 'RGB':
                        img = img.convert('RGB')
                    
                    # Calculate aspect ratio
                    img_width, img_height = img.size
                    aspect_ratio = img_width / img_height
                    page_aspect = page_width / page_height
                    
                    # Scale image to fit page while maintaining aspect ratio
                    if aspect_ratio > page_aspect:
                        # Image is wider
                        new_width = page_width - 20
                        new_height = int(new_width / aspect_ratio)
                    else:
                        # Image is taller
                        new_height = page_height - 20
                        new_width = int(new_height * aspect_ratio)
                    
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    
                    # Create page
                    page = doc.new_page(width=page_width, height=page_height)
                    
                    # Center the image on the page
                    x = (page_width - new_width) / 2
                    y = (page_height - new_height) / 2
                    
                    # Save image temporarily and insert
                    import tempfile
                    temp_dir = tempfile.gettempdir()
                    temp_img_path = os.path.join(temp_dir, f'temp_img_{idx}_{int(time.time() * 1000)}.png')
                    img.save(temp_img_path, 'PNG')
                    
                    # Insert image
                    rect = fitz.Rect(x, y, x + new_width, y + new_height)
                    page.insert_image(rect, filename=temp_img_path)
                    
                    # Clean up temp file
                    try:
                        os.remove(temp_img_path)
                    except:
                        pass
                        
                except Exception as img_err:
                    raise Exception(f"Failed to process image {idx + 1} ({img_path}): {str(img_err)}")
            
            if len(doc) == 0:
                raise Exception("No images were successfully converted")
            
            doc.save(output_path)
            doc.close()
            return output_path
        except Exception as e:
            raise Exception(f"Failed to convert images to PDF: {str(e)}")
    
    @staticmethod
    def pdf_to_text(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Extract text from PDF"""
        try:
            pdf_path = input_paths[0]
            page_range = options.get('pageRange', 'all')
            
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
                text_content.append(f"--- Page {page_num+1} ---\n{text}\n")
            
            doc.close()
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.writelines(text_content)
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to extract text: {str(e)}")
    
    @staticmethod
    def pdf_to_docx(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Convert PDF to Word DOCX format"""
        try:
            from docx import Document
            from docx.shared import Pt, Inches
            
            pdf_path = input_paths[0]
            page_range = options.get('pageRange', 'all')
            
            doc_obj = fitz.open(pdf_path)
            document = Document()
            
            pages_to_extract = []
            if page_range == 'all':
                pages_to_extract = list(range(len(doc_obj)))
            else:
                for part in page_range.split(','):
                    if '-' in part:
                        start, end = map(int, part.split('-'))
                        pages_to_extract.extend(range(start-1, end))
                    else:
                        pages_to_extract.append(int(part)-1)
            
            for page_num in pages_to_extract:
                page = doc_obj[page_num]
                text = page.get_text()
                
                # Add page heading
                document.add_heading(f'Page {page_num + 1}', level=2)
                
                # Add content
                if text.strip():
                    for paragraph_text in text.split('\n'):
                        if paragraph_text.strip():
                            p = document.add_paragraph(paragraph_text)
                            p.paragraph_format.space_before = Pt(6)
                            p.paragraph_format.space_after = Pt(6)
                else:
                    document.add_paragraph('(Page with no extractable text)')
                
                document.add_paragraph()  # Add spacing between pages
            
            doc_obj.close()
            document.save(output_path)
            return output_path
        except Exception as e:
            raise Exception(f"Failed to convert PDF to DOCX: {str(e)}")
    
    @staticmethod
    def pdf_to_pptx(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Convert PDF to PowerPoint PPTX format"""
        try:
            from pptx import Presentation
            from pptx.util import Inches, Pt
            from pptx.enum.text import PP_ALIGN
            
            pdf_path = input_paths[0]
            page_range = options.get('pageRange', 'all')
            
            doc = fitz.open(pdf_path)
            prs = Presentation()
            
            # Set slide size
            prs.slide_width = Inches(10)
            prs.slide_height = Inches(7.5)
            
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
                
                # Create blank slide
                blank_slide_layout = prs.slide_layouts[6]  # Blank layout
                slide = prs.slides.add_slide(blank_slide_layout)
                
                # Convert PDF page to image and add to slide
                mat = fitz.Matrix(1, 1)
                pix = page.get_pixmap(matrix=mat, alpha=False)
                
                import tempfile
                temp_dir = tempfile.gettempdir()
                temp_img = os.path.join(temp_dir, f'slide_{page_num}_{int(time.time() * 1000)}.png')
                
                # Save pixmap to image file - use appropriate method for PyMuPDF
                try:
                    pix.save(temp_img)  # Newer PyMuPDF versions use save()
                except AttributeError:
                    pix.save_png(temp_img)  # Fallback for older versions
                
                # Add image to slide (scaled to fit)
                left = Inches(0.5)
                top = Inches(0.5)
                height = Inches(6.5)
                pic = slide.shapes.add_picture(temp_img, left, top, height=height)
                
                # Add page number
                txBox = slide.shapes.add_textbox(Inches(9), Inches(7), Inches(0.8), Inches(0.3))
                tf = txBox.text_frame
                tf.text = f"Page {page_num + 1}"
                p = tf.paragraphs[0]
                p.font.size = Pt(10)
                p.alignment = PP_ALIGN.RIGHT
                
                # Clean up
                try:
                    os.remove(temp_img)
                except:
                    pass
            
            doc.close()
            prs.save(output_path)
            return output_path
        except Exception as e:
            raise Exception(f"Failed to convert PDF to PPTX: {str(e)}")
    
    @staticmethod
    def pdf_to_xlsx(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Convert PDF to Excel XLSX format (extracts text and tables)"""
        try:
            from openpyxl import Workbook
            from openpyxl.styles import Font, PatternFill, Alignment
            import pdfplumber
            
            pdf_path = input_paths[0]
            page_range = options.get('pageRange', 'all')
            
            wb = Workbook()
            wb.remove(wb.active)  # Remove default sheet
            
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
                    
                    # Create sheet for this page
                    ws = wb.create_sheet(title=f"Page {page_num + 1}")
                    
                    # Extract tables if any
                    tables = page.extract_tables()
                    if tables:
                        row = 1
                        for table_idx, table in enumerate(tables):
                            if table_idx > 0:
                                row += 2  # Spacing between tables
                            
                            for table_row_idx, table_row in enumerate(table):
                                for col_idx, cell_val in enumerate(table_row):
                                    cell = ws.cell(row=row, column=col_idx + 1)
                                    cell.value = cell_val
                                    
                                    # Format header row
                                    if table_row_idx == 0:
                                        cell.font = Font(bold=True, color="FFFFFF")
                                        cell.fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
                                    
                                    cell.alignment = Alignment(wrap_text=True, vertical="top")
                                
                                row += 1
                    else:
                        # If no tables, extract text
                        text = page.extract_text()
                        if text:
                            lines = text.split('\n')
                            for line_idx, line in enumerate(lines):
                                cell = ws.cell(row=line_idx + 1, column=1)
                                cell.value = line
                                cell.alignment = Alignment(wrap_text=True)
            
            # Auto-adjust column widths
            for ws in wb.sheetnames:
                sheet = wb[ws]
                for column in sheet.columns:
                    max_length = 0
                    column_letter = column[0].column_letter
                    for cell in column:
                        try:
                            if len(str(cell.value)) > max_length:
                                max_length = len(str(cell.value))
                        except:
                            pass
                    adjusted_width = min(max_length + 2, 50)
                    sheet.column_dimensions[column_letter].width = adjusted_width
            
            wb.save(output_path)
            return output_path
        except Exception as e:
            raise Exception(f"Failed to convert PDF to XLSX: {str(e)}")
    
    @staticmethod
    def pdf_to_html(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Convert PDF to HTML format"""
        try:
            pdf_path = input_paths[0]
            page_range = options.get('pageRange', 'all')
            
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
            
            html_content = """<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF to HTML Conversion</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
        .page { page-break-after: always; margin-bottom: 40px; border: 1px solid #ddd; padding: 20px; }
        .page-number { text-align: right; color: #999; margin-top: 20px; }
        h1 { color: #333; }
        p { color: #666; }
    </style>
</head>
<body>
"""
            
            for page_num in pages_to_extract:
                page = doc[page_num]
                text = page.get_text()
                
                html_content += f'<div class="page">\n'
                html_content += f'<h1>Page {page_num + 1}</h1>\n'
                
                if text.strip():
                    for line in text.split('\n'):
                        if line.strip():
                            html_content += f'<p>{line.strip()}</p>\n'
                else:
                    html_content += '<p><em>(Page with no extractable text)</em></p>\n'
                
                html_content += f'<div class="page-number">Page {page_num + 1}</div>\n'
                html_content += '</div>\n'
            
            html_content += """</body>
</html>"""
            
            doc.close()
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to convert PDF to HTML: {str(e)}")
    
    @staticmethod
    def pdf_to_rtf(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Convert PDF to RTF format"""
        try:
            pdf_path = input_paths[0]
            page_range = options.get('pageRange', 'all')
            
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
            
            rtf_content = r"{\rtf1\ansi\ansicpg1252\deff0{\fonttbl{\f0 Arial;}}" + "\n"
            rtf_content += r"{\colortbl;\red0\green0\blue0;}" + "\n"
            rtf_content += r"\viewkind4\uc1\pard\f0\fs20 " + "\n"
            
            for page_num in pages_to_extract:
                page = doc[page_num]
                text = page.get_text()
                
                # RTF header for page
                rtf_content += r"\b PDF Page " + str(page_num + 1) + r"\b0 \par \par " + "\n"
                
                if text.strip():
                    for line in text.split('\n'):
                        if line.strip():
                            # Escape special RTF characters
                            line_escaped = line.replace('\\', '\\\\').replace('{', '\\{').replace('}', '\\}')
                            rtf_content += line_escaped + r" \par " + "\n"
                else:
                    rtf_content += r"\i (Page with no extractable text) \i0 \par " + "\n"
                
                rtf_content += r"\par \page " + "\n"
            
            rtf_content += "}"
            
            doc.close()
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(rtf_content)
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to convert PDF to RTF: {str(e)}")
    
    @staticmethod
    def pdf_to_document(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Convert PDF to Word/PowerPoint/Excel/CSV (dispatcher)"""
        output_format = options.get('format', 'docx')  # docx, pptx, xlsx, html, rtf
        
        if output_format == 'docx':
            return PdfConvertEngine.pdf_to_docx(input_paths, output_path, options)
        elif output_format == 'pptx':
            return PdfConvertEngine.pdf_to_pptx(input_paths, output_path, options)
        elif output_format == 'xlsx':
            return PdfConvertEngine.pdf_to_xlsx(input_paths, output_path, options)
        elif output_format == 'html':
            return PdfConvertEngine.pdf_to_html(input_paths, output_path, options)
        elif output_format == 'rtf':
            return PdfConvertEngine.pdf_to_rtf(input_paths, output_path, options)
        else:
            raise ValueError(f"Format {output_format} not supported")
    
    @staticmethod
    def pdf_to_ebook(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Convert PDF to EPUB/MOBI/AZW3 (requires ebook-convert/calibre)"""
        try:
            pdf_path = input_paths[0]
            output_format = options.get('format', 'epub')
            
            # This requires ebook-convert (Calibre)
            import subprocess
            result = subprocess.run(
                ['ebook-convert', pdf_path, output_path],
                capture_output=True, text=True
            )
            
            if result.returncode != 0:
                raise Exception(f"ebook-convert failed: {result.stderr}")
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to convert PDF to ebook: {str(e)}")
    
    @staticmethod
    def ebook_to_pdf(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Convert EPUB/MOBI/AZW3 to PDF (requires ebook-convert/calibre)"""
        try:
            ebook_path = input_paths[0]
            
            # This requires ebook-convert (Calibre)
            import subprocess
            result = subprocess.run(
                ['ebook-convert', ebook_path, output_path],
                capture_output=True, text=True
            )
            
            if result.returncode != 0:
                raise Exception(f"ebook-convert failed: {result.stderr}")
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to convert ebook to PDF: {str(e)}")
    
    @staticmethod
    def document_to_pdf(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Convert Word/PowerPoint document to PDF (requires LibreOffice)"""
        try:
            doc_path = input_paths[0]
            
            # Use LibreOffice headless
            import subprocess
            result = subprocess.run([
                'soffice', '--headless', '--convert-to', 'pdf', 
                '--outdir', str(Path(output_path).parent),
                doc_path
            ], capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"LibreOffice conversion failed: {result.stderr}")
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to convert document: {str(e)}")
    
    @staticmethod
    def url_to_pdf(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Convert URL to PDF (requires Playwright/headless browser)"""
        try:
            url = options.get('url', '')
            if not url:
                raise ValueError("URL not provided")
            
            # Use Playwright for headless browser
            from playwright.sync_api import sync_playwright
            
            with sync_playwright() as p:
                browser = p.chromium.launch()
                page = browser.new_page()
                page.goto(url, wait_until='networkidle')
                page.pdf(path=output_path)
                browser.close()
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to convert URL to PDF: {str(e)}")
    
    @staticmethod
    def outlook_to_pdf(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Convert Outlook MSG file to PDF"""
        try:
            msg_path = input_paths[0]
            
            # Try to use win32com on Windows for native support
            try:
                from win32com.client import Dispatch
                outlook = Dispatch("Outlook.Application")
                msg = outlook.CreateItemFromTemplate(msg_path)
                msg.SaveAs(output_path, 4)  # 4 = olSaveAsPDF
                return output_path
            except ImportError:
                # Fallback: extract text and create simple PDF
                raise Exception("outlook_to_pdf requires win32com on Windows")
        except Exception as e:
            raise Exception(f"Failed to convert Outlook to PDF: {str(e)}")
