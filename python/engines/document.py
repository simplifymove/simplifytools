"""Document Engine - Convert Visio, Photoshop, and document formats"""
import os
import subprocess
import logging
import tempfile
from PIL import Image
from .utils import validate_file_exists, safe_remove, log_execution

logger = logging.getLogger(__name__)

def document_convert(input_file: str, output_file: str, from_format: str, to_format: str, options=None) -> bool:
    """
    Convert document and design formats
    Supports:
    - PSD → JPG/PNG (using ImageMagick)
    - PSD → SVG (PSD → PNG → SVG via Potrace)
    - VSDX/VSD → PDF/DOCX/PPTX (using LibreOffice)
    """
    validate_file_exists(input_file)
    options = options or {}
    
    try:
        from_fmt = from_format.lower()
        to_fmt = to_format.lower()
        
        # PSD conversions
        if from_fmt == 'psd':
            if to_fmt in ['jpg', 'jpeg', 'png']:
                return convert_psd_to_image(input_file, output_file, to_fmt, options)
            elif to_fmt == 'svg':
                return convert_psd_to_svg(input_file, output_file, options)
        
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
        
        # Use ImageMagick convert command - simple direct conversion
        # ImageMagick handles PSD format and layer merging automatically
        cmd_str = f'convert "{input_file}" -quality {quality} "{output_file}"'
        
        logger.info(f"[DocumentEngine-PSD] Executing: {cmd_str}")
        result = subprocess.run(cmd_str, shell=True, capture_output=True, text=True, timeout=120)
        
        if result.returncode != 0:
            raise RuntimeError(f"ImageMagick failed: {result.stderr}")
        
        if not os.path.exists(output_file):
            raise RuntimeError("Output image not created")
        
        log_execution("document_psd", input_file, output_file, options)
        return True
        
    except Exception as e:
        logger.error(f"PSD conversion failed: {str(e)}")
        return False

def convert_psd_to_svg(input_file: str, output_file: str, options) -> bool:
    """
    Convert PSD to SVG via PNG → Potrace pipeline
    Industry standard: Rasterize → Vectorize
    """
    temp_png = None
    try:
        # Step 1: Convert PSD to PNG using ImageMagick (rasterization)
        quality = options.get('quality', 85)
        temp_png = os.path.join(tempfile.gettempdir(), f'psd_temp_{id(input_file)}.png')
        
        # Build simple ImageMagick command for PSD
        # ImageMagick handles PSD format and layer merging automatically
        cmd_str = f'convert "{input_file}" -quality {quality} "{temp_png}"'
        
        logger.info(f"[DocumentEngine-PSD-SVG Step1] Rasterizing: {cmd_str}")
        result = subprocess.run(cmd_str, shell=True, capture_output=True, text=True, timeout=120)
        
        if result.returncode != 0:
            raise RuntimeError(f"ImageMagick rasterization failed: {result.stderr}")
        
        if not os.path.exists(temp_png):
            raise RuntimeError("Temporary PNG not created")
        
        # Step 2: Prepare image for vectorization
        logger.info(f"[DocumentEngine-PSD-SVG Step2] Preparing image for vectorization")
        img = Image.open(temp_png)
        
        # Reduce colors if requested (industry standard for better tracing)
        if options.get('color_reduce', True):
            # Reduce to 256 colors for better edge detection
            img = img.convert('P', palette=Image.ADAPTIVE, colors=256)
        
        # Convert to grayscale for better potrace results
        if img.mode != 'L':
            img = img.convert('L')
        
        # Save processed image
        img.save(temp_png, 'PNG')
        
        # Step 3: Trace to SVG using Potrace (vectorization)
        corner_thresh = options.get('corner_threshold', 100)
        curve_opt = options.get('curve_optimize', 2)
        
        cmd_str = f'potrace \"{temp_png}\" -s -o \"{output_file}\" -t {corner_thresh} -O {curve_opt}'
        
        logger.info(f"[DocumentEngine-PSD-SVG Step3] Vectorizing: {cmd_str}")
        result = subprocess.run(cmd_str, shell=True, capture_output=True, text=True, timeout=120)
        
        if result.returncode != 0:
            raise RuntimeError(f"Potrace vectorization failed: {result.stderr}")
        
        if not os.path.exists(output_file):
            raise RuntimeError("SVG output file was not created")
        
        log_execution("document_psd_svg", input_file, output_file, options)
        return True
        
    except Exception as e:
        logger.error(f"PSD to SVG conversion failed: {str(e)}")
        return False
    finally:
        # Cleanup temporary PNG
        if temp_png and os.path.exists(temp_png):
            try:
                os.remove(temp_png)
                logger.info(f"[DocumentEngine-PSD-SVG] Cleaned up temp file: {temp_png}")
            except Exception as e:
                logger.warning(f"Failed to cleanup temp file: {e}")

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
