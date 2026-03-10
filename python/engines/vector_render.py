"""Vector/Document to Raster converter engine (PDF, EPS)"""
import os
import subprocess
import json
from typing import Optional, Dict, Any, List
import logging
from .utils import validate_file_exists, safe_remove, log_execution, create_zip

logger = logging.getLogger(__name__)


def convert_pdf_to_images(
    input_file: str,
    output_dir: str,
    dpi: int = 300,
    format: str = 'jpg',
    pages: str = 'all'
) -> List[str]:
    """
    Convert PDF pages to raster images using Poppler (pdftoppm)
    
    Args:
        input_file: Path to PDF
        output_dir: Directory for output images
        dpi: DPI for rendering (default 300)
        format: Output format (jpg, png, tiff)
        pages: 'all', 'first', or page range '1-5'
    
    Returns:
        List of created image files
    """
    try:
        os.makedirs(output_dir, exist_ok=True)
        output_prefix = os.path.join(output_dir, 'page')
        
        logger.info(f"[VectorRender] Converting PDF → {format.upper()} at {dpi}DPI")
        
        # Build pdftoppm command
        if format.lower() == 'jpg':
            cmd = ['pdftoppm', '-jpeg', f'-r {dpi}', input_file, output_prefix]
        elif format.lower() == 'png':
            cmd = ['pdftoppm', '-png', f'-r {dpi}', input_file, output_prefix]
        elif format.lower() == 'tiff':
            cmd = ['pdftoppm', '-tiff', f'-r {dpi}', input_file, output_prefix]
        else:
            cmd = ['pdftoppm', f'-r {dpi}', input_file, output_prefix]
        
        logger.info(f"Executing: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode != 0:
            logger.error(f"pdftoppm failed: {result.stderr}")
            return []
        
        # Find generated files
        output_files = sorted([
            os.path.join(output_dir, f)
            for f in os.listdir(output_dir)
            if f.startswith('page') and f.endswith(('.jpg', '.png', '.tiff'))
        ])
        
        logger.info(f"✓ Generated {len(output_files)} pages")
        return output_files
        
    except Exception as e:
        logger.error(f"PDF conversion failed: {e}", exc_info=True)
        return []


def convert_eps_to_raster(
    input_file: str,
    output_file: str,
    dpi: int = 300,
    format: str = 'jpg'
) -> bool:
    """
    Convert EPS to raster using Ghostscript
    
    Args:
        input_file: Path to EPS file
        output_file: Output image path
        dpi: Resolution in DPI
        format: Output format (jpg, png)
    
    Returns:
        bool: Success status
    """
    try:
        logger.info(f"[VectorRender] Converting EPS → {format.upper()}")
        
        if not validate_file_exists(input_file):
            return False
        
        device_map = {
            'jpg': 'jpeg',
            'png': 'pngalpha',
        }
        device = device_map.get(format.lower(), 'pngalpha')
        
        # Build Ghostscript command
        cmd = [
            'gs',
            '-dQUIET',
            '-dSAFER',
            '-dBATCH',
            '-dNOPAUSE',
            f'-sDEVICE={device}',
            f'-r{dpi}',
            f'-sOutputFile={output_file}',
            input_file
        ]
        
        logger.info(f"Executing Ghostscript: {' '.join(cmd[:6])}...")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode != 0:
            logger.error(f"Ghostscript failed: {result.stderr}")
            return False
        
        log_execution('VectorRenderEngine', 'eps', format, input_file, output_file, True)
        return True
        
    except Exception as e:
        logger.error(f"EPS conversion failed: {e}", exc_info=True)
        safe_remove(output_file)
        return False


def vector_render(
    input_file: str,
    output_file: str,
    from_format: str,
    to_format: str,
    options: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Main entry point for vector/document to raster conversion
    """
    try:
        options = options or {}
        dpi = int(options.get('dpi', 300))
        
        if from_format.lower() == 'pdf':
            logger.info(f"[VectorRender] Converting PDF → {to_format.upper()}")
            
            # For single page output
            if to_format.lower() in ['jpg', 'png']:
                output_dir = os.path.dirname(output_file)
                pages = convert_pdf_to_images(input_file, output_dir, dpi, to_format)
                
                if pages:
                    # Copy first page to output_file
                    import shutil
                    shutil.copy(pages[0], output_file)
                    
                    # Cleanup other pages
                    for page in pages[1:]:
                        safe_remove(page)
                    
                    log_execution('VectorRenderEngine', 'pdf', to_format, input_file, output_file, True)
                    return True
                return False
        
        elif from_format.lower() == 'eps':
            return convert_eps_to_raster(input_file, output_file, dpi, to_format)
        
        else:
            logger.error(f"Unsupported format: {from_format}")
            return False
        
    except Exception as e:
        logger.error(f"Vector render failed: {e}", exc_info=True)
        return False


if __name__ == '__main__':
    import sys
    import argparse
    
    parser = argparse.ArgumentParser(description='Vector to Raster Converter')
    parser.add_argument('--input', '-i', required=True, help='Input file path')
    parser.add_argument('--output', '-o', required=True, help='Output file path')
    parser.add_argument('--from-format', required=True, choices=['pdf', 'eps'])
    parser.add_argument('--to-format', required=True, choices=['jpg', 'png'])
    parser.add_argument('--dpi', type=int, default=300, help='DPI for rendering')
    parser.add_argument('--options-json', default='{}', help='Additional options')
    
    args = parser.parse_args()
    options = json.loads(args.options_json)
    options['dpi'] = args.dpi
    
    success = vector_render(
        args.input,
        args.output,
        args.from_format,
        args.to_format,
        options
    )
    sys.exit(0 if success else 1)
