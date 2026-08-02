"""Vector Trace Engine - Convert raster images to vector SVG using Potrace"""
import os
import subprocess
import logging
from PIL import Image
from .utils import validate_file_exists, safe_remove, log_execution

logger = logging.getLogger(__name__)

def vector_trace(input_file: str, output_file: str, from_format: str, to_format: str, options=None) -> bool:
    """
    Convert raster image to SVG vector using Potrace
    Supports: PNG, JPG, TIFF → SVG
    """
    validate_file_exists(input_file)
    options = options or {}
    
    try:
        # Convert to BMP first (Potrace works best with bitmap)
        temp_bmp = input_file.rsplit('.', 1)[0] + '_temp.bmp'
        
        # Open and prepare image
        img = Image.open(input_file)
        
        # Reduce colors if requested for better tracing
        if options.get('color_optimize', False):
            img = img.convert('P', palette=Image.ADAPTIVE, colors=256)
        
        # Convert to grayscale for better edge detection
        if img.mode != 'L':
            img = img.convert('L')
        
        img.save(temp_bmp, 'BMP')
        
        # Build potrace command
        corner_thresh = options.get('corner_threshold', 100)
        curve_opt = options.get('curve_optimize', 2)
        
        target_format = to_format.lower()
        if target_format == 'svg':
            backend_args = ['-s']
        elif target_format == 'eps':
            backend_args = ['-e']
        else:
            raise ValueError(f"Unsupported vector trace output: {to_format}")

        cmd = [
            'potrace',
            temp_bmp,
            *backend_args,
            '-o', output_file,
            '-t', str(corner_thresh),
            '-O', str(curve_opt),
        ]
        
        logger.info(f"[VectorTraceEngine] Executing: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        
        # Cleanup temp BMP
        safe_remove(temp_bmp)
        
        if result.returncode != 0:
            raise RuntimeError(f"Potrace failed: {result.stderr}")
        
        if not os.path.exists(output_file):
            raise RuntimeError(f"{to_format.upper()} output file was not created")
        
        log_execution("VectorTraceEngine", from_format, to_format, input_file, output_file, True)
        return True
        
    except Exception as e:
        safe_remove(temp_bmp) if 'temp_bmp' in locals() else None
        logger.error(f"Vector trace failed: {str(e)}")
        raise
