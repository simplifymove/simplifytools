"""OCR Engine - Extract text from images/PDFs using Tesseract and pdfplumber"""
import os
import subprocess
import json
import logging
from PIL import Image
from .utils import validate_file_exists, safe_remove, log_execution

logger = logging.getLogger(__name__)

def ocr_convert(input_file: str, output_file: str, from_format: str, to_format: str, options=None) -> bool:
    """
    Extract text from image/PDF/TIFF
    PDFs: Uses pdfplumber for direct text extraction (no OCR needed)
    Images: Uses Tesseract OCR for text recognition
    """
    validate_file_exists(input_file)
    options = options or {}
    
    try:
        # Handle PDF special case - extract text directly without OCR
        if from_format.lower() == 'pdf':
            return _extract_pdf_text(input_file, output_file, options)
        
        # For images, use Tesseract OCR
        return _ocr_image(input_file, output_file, from_format, to_format, options)
        
    except Exception as e:
        logger.error(f"OCR conversion failed: {str(e)}")
        raise


def _extract_pdf_text(input_file: str, output_file: str, options: dict) -> bool:
    """Extract text from PDF using pdfplumber (no external binaries needed)"""
    try:
        import pdfplumber
        
        logger.info(f"[OCREngine] Extracting text from PDF using pdfplumber")
        
        full_text = []
        with pdfplumber.open(input_file) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text()
                if text:
                    full_text.append(f"--- Page {page_num} ---\n{text}\n")
        
        # Write extracted text
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(full_text))
        
        logger.info(f"✓ PDF text extraction successful: {output_file}")
        log_execution("PDFExtract", "pdf", "txt", input_file, output_file, True)
        return True
        
    except ImportError:
        logger.error("pdfplumber not installed. Install with: pip install pdfplumber")
        raise RuntimeError("pdfplumber not available for PDF text extraction")
    except Exception as e:
        logger.error(f"PDF text extraction failed: {str(e)}")
        raise


def _ocr_image(input_file: str, output_file: str, from_format: str, to_format: str, options: dict) -> bool:
    """Extract text from image using Tesseract OCR"""
    try:
        lang = options.get('language', 'eng')
        
        # Deskew image for better OCR accuracy
        if options.get('deskew', True):
            temp_img = input_file.rsplit('.', 1)[0] + '_deskew.tif'
            img = Image.open(input_file)
            img.save(temp_img, 'TIFF')
            input_file = temp_img
        
        # Run Tesseract
        base_output = output_file.rsplit('.', 1)[0]
        format_ext = 'txt' if to_format.lower() == 'txt' else 'pdf'
        
        cmd = [
            'tesseract',
            input_file,
            base_output,
            '-l', lang,
            format_ext,
        ]
        
        logger.info(f"[OCREngine] Executing: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode != 0:
            raise RuntimeError(f"Tesseract failed: {result.stderr}")
        
        # Verify output
        output_with_ext = f"{base_output}.{format_ext}"
        if not os.path.exists(output_with_ext):
            raise RuntimeError(f"OCR output file was not created: {output_with_ext}")
        
        # Move to desired output path if different
        if output_with_ext != output_file:
            os.rename(output_with_ext, output_file)
        
        logger.info(f"✓ OCR successful: {output_file}")
        log_execution("Tesseract", from_format, to_format, input_file, output_file, True)
        return True
        
    except FileNotFoundError:
        logger.error("Tesseract binary not found. Install with: 'winget install UB-Mannheim.TesseractOCR'")
        raise RuntimeError("Tesseract OCR not installed")
    except Exception as e:
        logger.error(f"Image OCR failed: {str(e)}")
        raise
