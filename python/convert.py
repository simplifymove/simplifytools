#!/usr/bin/env python3
"""Main converter router - routes format pairs to appropriate engines"""
import argparse
import json
import sys
import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

# Import engines
from engines.raster import convert_raster
from engines.vector_render import vector_render
from engines.vector_trace import vector_trace
from engines.animation import animation_convert
from engines.ocr import ocr_convert
from engines.document import document_convert


# Conversion routing table: (from_fmt, to_fmt) → engine
CONVERSION_ROUTES = {
    # Raster conversions
    ('jpg', 'png'): convert_raster,
    ('jpg', 'webp'): convert_raster,
    ('jpg', 'bmp'): convert_raster,
    ('jpg', 'tiff'): convert_raster,
    ('png', 'jpg'): convert_raster,
    ('png', 'webp'): convert_raster,
    ('png', 'bmp'): convert_raster,
    ('png', 'tiff'): convert_raster,
    ('webp', 'jpg'): convert_raster,
    ('webp', 'png'): convert_raster,
    ('webp', 'bmp'): convert_raster,
    ('webp', 'tiff'): convert_raster,
    ('bmp', 'jpg'): convert_raster,
    ('bmp', 'png'): convert_raster,
    ('bmp', 'webp'): convert_raster,
    ('tiff', 'jpg'): convert_raster,
    ('tiff', 'png'): convert_raster,
    ('tiff', 'webp'): convert_raster,
    ('heic', 'jpg'): convert_raster,
    ('heic', 'png'): convert_raster,
    ('heic', 'webp'): convert_raster,
    
    # Vector/Document to Raster
    ('pdf', 'jpg'): vector_render,
    ('pdf', 'png'): vector_render,
    ('eps', 'jpg'): vector_render,
    ('eps', 'png'): vector_render,
    
    # Raster to Vector
    ('jpg', 'svg'): vector_trace,
    ('png', 'svg'): vector_trace,
    ('bmp', 'svg'): vector_trace,
    ('tiff', 'svg'): vector_trace,
    
    # Animation
    ('gif', 'mp4'): animation_convert,
    ('mp4', 'gif'): animation_convert,
    
    # OCR
    ('jpg', 'txt'): ocr_convert,
    ('png', 'txt'): ocr_convert,
    ('pdf', 'txt'): ocr_convert,
    ('tiff', 'txt'): ocr_convert,
    ('webp', 'txt'): ocr_convert,
    ('image', 'text'): ocr_convert,
    ('image', 'txt'): ocr_convert,  # Generic image to text (used by UI)
    ('pdf', 'pdf'): ocr_convert,  # Searchable PDF
    
    # Document
    ('vsdx', 'pdf'): document_convert,
    ('vsdx', 'docx'): document_convert,
    ('vsdx', 'pptx'): document_convert,
    ('vsdx', 'jpg'): document_convert,
    ('vsd', 'pdf'): document_convert,
    ('vsd', 'docx'): document_convert,
    ('vsd', 'pptx'): document_convert,
    ('psd', 'jpg'): document_convert,
    ('psd', 'png'): document_convert,
    ('psd', 'svg'): document_convert,
}


def convert(
    input_file: str,
    output_file: str,
    from_format: str,
    to_format: str,
    options: dict = None
) -> bool:
    """
    Main conversion router
    
    Args:
        input_file: Path to input file
        output_file: Path to output file
        from_format: Source format (lowercase)
        to_format: Target format (lowercase)
        options: Additional conversion options
    
    Returns:
        bool: Success status
    """
    options = options or {}
    
    logger.info(f"Converting: {from_format.upper()} → {to_format.upper()}")
    logger.info(f"Input: {input_file}")
    logger.info(f"Output: {output_file}")
    
    # Validate input
    if not os.path.exists(input_file):
        logger.error(f"Input file not found: {input_file}")
        return False
    
    # Find engine for this conversion
    route_key = (from_format.lower(), to_format.lower())
    
    if route_key not in CONVERSION_ROUTES:
        logger.error(f"Unsupported conversion: {from_format} → {to_format}")
        logger.info("Supported conversions:")
        for key in sorted(CONVERSION_ROUTES.keys()):
            logger.info(f"  {key[0].upper()} → {key[1].upper()}")
        return False
    
    engine_func = CONVERSION_ROUTES[route_key]
    logger.info(f"Using engine: {engine_func.__module__}")
    
    try:
        success = engine_func(
            input_file,
            output_file,
            from_format,
            to_format,
            options
        )
        
        if success:
            logger.info(f"✓ Conversion completed successfully")
            if os.path.exists(output_file):
                size_mb = os.path.getsize(output_file) / (1024 * 1024)
                logger.info(f"Output file size: {size_mb:.2f} MB")
        else:
            logger.error(f"✗ Conversion failed")
        
        return success
        
    except Exception as e:
        logger.error(f"Conversion error: {e}", exc_info=True)
        return False


def main():
    parser = argparse.ArgumentParser(
        description='Universal Image/Document Converter',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python convert.py --input photo.jpg --output photo.png --from jpg --to png
  python convert.py --input document.pdf --output page1.jpg --from pdf --to jpg --options '{"dpi": 300}'
  python convert.py --input animation.gif --output video.mp4 --from gif --to mp4 --options '{"fps": 30}'
        '''
    )
    
    parser.add_argument('--input', '-i', required=True, help='Input file path')
    parser.add_argument('--output', '-o', required=True, help='Output file path')
    parser.add_argument('--from', dest='from_format', required=True,
                       help='Source format (jpg, png, pdf, gif, etc.)')
    parser.add_argument('--to', dest='to_format', required=True,
                       help='Target format (png, webp, mp4, etc.)')
    parser.add_argument('--options', default='{}',
                       help='JSON options for conversion (e.g., {"quality": 85})')
    
    args = parser.parse_args()
    
    try:
        options = json.loads(args.options)
    except json.JSONDecodeError:
        logger.error("Invalid JSON options")
        return 1
    
    success = convert(
        args.input,
        args.output,
        args.from_format,
        args.to_format,
        options
    )
    
    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(main())
