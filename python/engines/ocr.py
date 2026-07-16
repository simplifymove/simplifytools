"""OCR Engine - Extract text from images/PDFs using Tesseract and pdfplumber"""
import os
import subprocess
import json
import logging
from PIL import Image
from .utils import validate_file_exists, safe_remove, log_execution

logger = logging.getLogger(__name__)

EASYOCR_LANGUAGE_MAP = {
    'eng': 'en',
    'spa': 'es',
    'fra': 'fr',
    'deu': 'de',
    'chi_sim': 'ch_sim',
    'jpn': 'ja',
    'ita': 'it',
    'por': 'pt',
    'rus': 'ru',
}

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
    temp_img = None
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
        logger.warning("Tesseract binary not found; using the configured EasyOCR fallback")
        return _ocr_image_with_easyocr(input_file, output_file, to_format, options)
    except Exception as e:
        logger.error(f"Image OCR failed: {str(e)}")
        raise
    finally:
        if temp_img:
            safe_remove(temp_img)


def _ocr_image_with_easyocr(input_file: str, output_file: str, to_format: str, options: dict) -> bool:
    """Use the declared EasyOCR dependency when the Tesseract executable is unavailable."""
    try:
        import easyocr

        language = EASYOCR_LANGUAGE_MAP.get(options.get('language', 'eng'), 'en')
        reader = easyocr.Reader([language], gpu=False, verbose=False)
        lines = reader.readtext(input_file, detail=0, paragraph=True)
        text = '\n'.join(str(line) for line in lines)

        if to_format.lower() == 'pdf':
            from reportlab.lib.pagesizes import A4
            from reportlab.pdfgen import canvas

            pdf = canvas.Canvas(output_file, pagesize=A4)
            width, height = A4
            text_object = pdf.beginText(40, height - 50)
            text_object.setFont('Helvetica', 11)
            for paragraph in text.splitlines() or ['']:
                words = paragraph.split()
                line = ''
                for word in words:
                    candidate = f'{line} {word}'.strip()
                    if pdf.stringWidth(candidate, 'Helvetica', 11) > width - 80 and line:
                        text_object.textLine(line)
                        line = word
                    else:
                        line = candidate
                text_object.textLine(line)
            pdf.drawText(text_object)
            pdf.save()
        else:
            with open(output_file, 'w', encoding='utf-8') as output:
                output.write(text)

        logger.info(f"EasyOCR fallback successful: {output_file}")
        log_execution("EasyOCR", 'image', to_format, input_file, output_file, True)
        return True
    except Exception as error:
        safe_remove(output_file)
        raise RuntimeError(f"EasyOCR fallback failed: {str(error)}") from error
