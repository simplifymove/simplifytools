"""Document Engine - Convert Visio, Photoshop, and document formats"""
import os
import subprocess
import logging
from PIL import Image
from .utils import validate_file_exists, safe_remove, log_execution

logger = logging.getLogger(__name__)

def document_convert(input_file: str, output_file: str, from_format: str, to_format: str, options=None) -> bool:
    """
    Convert document and design formats
    Supports:
    - PSD → JPG/PNG (using ImageMagick)
    - VSDX/VSD → PDF/DOCX/PPTX (using LibreOffice)
    """
    validate_file_exists(input_file)
    options = options or {}
    
    try:
        from_fmt = from_format.lower()
        to_fmt = to_format.lower()
        
        # PSD conversions (use ImageMagick)
        if from_fmt == 'psd':
            if to_fmt in ['jpg', 'jpeg', 'png']:
                return convert_psd_to_image(input_file, output_file, to_fmt, options)
        
        # Visio conversions (use LibreOffice)
        if from_fmt in ['vsdx', 'vsd', 'vdx']:
            if to_fmt in ['pdf', 'docx', 'pptx', 'xlsx', 'jpg', 'png']:
                return convert_visio_to_format(input_file, output_file, to_fmt, options)
        
        logger.error(f"Unsupported conversion: {from_fmt} → {to_fmt}")
        return False
        
    except Exception as e:
        logger.error(f"Document conversion failed: {str(e)}")
        return False

def convert_psd_to_image(input_file: str, output_file: str, output_format: str, options) -> bool:
    """Convert PSD to JPG/PNG using ImageMagick"""
    try:
        quality = options.get('quality', 85)
        
        # Use ImageMagick convert command (from GraphicsMagick or ImageMagick)
        cmd = [
            'convert',
            f"-quality {quality}",
            input_file,
            output_file
        ]
        
        logger.info(f"[DocumentEngine-PSD] Executing: {' '.join(cmd)}")
        result = subprocess.run(' '.join(cmd), shell=True, capture_output=True, text=True, timeout=120)
        
        if result.returncode != 0:
            raise RuntimeError(f"ImageMagick failed: {result.stderr}")
        
        if not os.path.exists(output_file):
            raise RuntimeError("Output image not created")
        
        log_execution("document_psd", input_file, output_file, options)
        return True
        
    except Exception as e:
        logger.error(f"PSD conversion failed: {str(e)}")
        return False

def convert_visio_to_format(input_file: str, output_file: str, output_format: str, options) -> bool:
    """Convert Visio to PDF/DOCX/PPTX using LibreOffice"""
    try:
        # LibreOffice headless conversion
        filter_map = {
            'pdf': 'writer_pdf_Export',
            'docx': 'MS Word 2007 XML',
            'pptx': 'Impress MS PowerPoint 2007 XML',
            'xlsx': 'Calc MS Excel 2007 XML',
            'jpg': 'jpg',
            'png': 'png',
        }
        
        output_filter = filter_map.get(output_format, 'pdf')
        output_dir = os.path.dirname(output_file)
        
        cmd = [
            'libreoffice',
            '--headless',
            '--convert-to', output_format,
            '--outdir', output_dir,
            input_file
        ]
        
        logger.info(f"[DocumentEngine-Visio] Executing: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode != 0:
            logger.warning(f"LibreOffice conversion note: {result.stderr}")
        
        # LibreOffice may create output with original name
        expected_output = os.path.join(
            output_dir,
            os.path.splitext(os.path.basename(input_file))[0] + f'.{output_format}'
        )
        
        if os.path.exists(expected_output) and expected_output != output_file:
            os.rename(expected_output, output_file)
        
        if not os.path.exists(output_file):
            raise RuntimeError(f"Output file not created: {output_file}")
        
        log_execution("document_visio", input_file, output_file, options)
        return True
        
    except Exception as e:
        logger.error(f"Visio conversion failed: {str(e)}")
        return False
