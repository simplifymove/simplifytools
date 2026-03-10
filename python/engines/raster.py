"""Raster format converter engine (JPG, PNG, WebP, BMP, TIFF)"""
import os
import json
from typing import Optional, Dict, Any
from PIL import Image
import logging
from .utils import validate_file_exists, safe_remove, log_execution

logger = logging.getLogger(__name__)

QUALITY_PRESETS = {
    'low': (60, 6),
    'medium': (75, 7),
    'high': (90, 8),
    'maximum': (95, 9),
}


def convert_raster(
    input_file: str,
    output_file: str,
    from_format: str,
    to_format: str,
    options: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Convert between raster formats (JPG, PNG, WebP, BMP, TIFF)
    
    Args:
        input_file: Path to input image
        output_file: Path to output image
        from_format: Source format (jpg, png, webp, bmp, tiff)
        to_format: Target format (jpg, png, webp, bmp, tiff)
        options: {
            'quality': 0-100 or 'low'/'medium'/'high'/'maximum',
            'resize': (width, height) or None,
            'bg_color': '#FFFFFF' for transparency replacement
        }
    
    Returns:
        bool: Success status
    """
    try:
        logger.info(f"[Raster] Converting {from_format.upper()} → {to_format.upper()}")
        
        # Validate input
        if not validate_file_exists(input_file):
            return False
        
        options = options or {}
        
        # Load image
        logger.info(f"Loading image: {input_file}")
        img = Image.open(input_file)
        
        # Convert RGBA to RGB if saving as JPG
        if to_format.lower() in ['jpg', 'jpeg'] and img.mode in ['RGBA', 'LA', 'P']:
            logger.info("Converting RGBA → RGB for JPG output")
            bg_color = tuple(int(x.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
            bg = Image.new('RGB', img.size, bg_color)
            if img.mode == 'P':
                img = img.convert('RGBA')
            bg.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = bg
        
        # Resize if requested
        if 'resize' in options and options['resize']:
            width, height = options['resize']
            logger.info(f"Resizing to {width}x{height}")
            img = img.resize((width, height), Image.Resampling.LANCZOS)
        
        # Determine quality
        quality = options.get('quality', 85)
        if isinstance(quality, str) and quality in QUALITY_PRESETS:
            quality = QUALITY_PRESETS[quality][0]
        quality = max(0, min(100, int(quality)))
        
        # Save with appropriate settings
        logger.info(f"Saving as {to_format.upper()} (quality={quality})")
        
        save_kwargs = {}
        if to_format.lower() in ['jpg', 'jpeg']:
            save_kwargs = {'quality': quality, 'optimize': True}
        elif to_format.lower() == 'webp':
            save_kwargs = {'quality': quality, 'method': 6}
        elif to_format.lower() == 'png':
            save_kwargs = {'optimize': True}
        
        # Ensure output directory exists
        output_dir = os.path.dirname(output_file)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        
        # Map format to Pillow format name
        format_map = {
            'jpg': 'JPEG',
            'jpeg': 'JPEG',
            'png': 'PNG',
            'webp': 'WEBP',
            'bmp': 'BMP',
            'tiff': 'TIFF',
            'tif': 'TIFF',
            'gif': 'GIF',
            'heic': 'HEIC',
            'avif': 'AVIF'
        }
        
        pil_format = format_map.get(to_format.lower(), to_format.upper())
        
        # Save
        img.save(output_file, format=pil_format, **save_kwargs)
        
        log_execution('RasterEngine', from_format, to_format, input_file, output_file, True)
        logger.info(f"✓ Conversion successful: {output_file}")
        return True
        
    except Exception as e:
        logger.error(f"✗ Conversion failed: {e}", exc_info=True)
        safe_remove(output_file)
        return False


if __name__ == '__main__':
    import sys
    import argparse
    
    parser = argparse.ArgumentParser(description='Raster Format Converter')
    parser.add_argument('--input', '-i', required=True, help='Input image path')
    parser.add_argument('--output', '-o', required=True, help='Output image path')
    parser.add_argument('--from-format', required=True, choices=['jpg', 'png', 'webp', 'bmp', 'tiff'])
    parser.add_argument('--to-format', required=True, choices=['jpg', 'png', 'webp', 'bmp', 'tiff'])
    parser.add_argument('--quality', type=str, default='85', help='Quality 0-100 or preset')
    parser.add_argument('--options-json', default='{}', help='Additional options as JSON')
    
    args = parser.parse_args()
    options = json.loads(args.options_json)
    if isinstance(args.quality, str) and args.quality.isdigit():
        options['quality'] = int(args.quality)
    else:
        options['quality'] = args.quality
    
    success = convert_raster(
        args.input,
        args.output,
        args.from_format,
        args.to_format,
        options
    )
    sys.exit(0 if success else 1)
