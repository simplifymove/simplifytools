"""Document Engine - Convert Visio, Photoshop, and document formats"""
import os
import subprocess
import logging
import tempfile
import base64
from PIL import Image
from .utils import validate_file_exists

logger = logging.getLogger(__name__)

# Try to find ImageMagick executable
def get_magick_exe():
    """Find magick executable, with fallback to PATH"""
    hardcoded_path = r"C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe"
    if os.path.exists(hardcoded_path):
        return hardcoded_path
    # Fallback to PATH lookup - will use shell=True
    return "magick"


def document_convert(input_file: str, output_file: str, from_format: str, to_format: str, options=None) -> bool:
    validate_file_exists(input_file)
    options = options or {}

    try:
        from_fmt = from_format.lower()
        to_fmt = to_format.lower()

        if from_fmt == "psd":
            if to_fmt in ["jpg", "jpeg", "png"]:
                return convert_psd_to_image(input_file, output_file, to_fmt, options)
            elif to_fmt == "svg":
                return convert_psd_to_svg(input_file, output_file, options)

        if from_fmt in ["vsdx", "vsd", "vdx"]:
            if to_fmt in ["pdf", "docx", "pptx", "xlsx", "jpg", "png"]:
                return convert_visio_to_format(input_file, output_file, to_fmt, options)

        logger.error(f"Unsupported conversion: {from_fmt} → {to_fmt}")
        return False

    except Exception as e:
        logger.error(f"Document conversion failed: {str(e)}")
        return False


def run_magick(input_path, output_path, quality):
    magick_exe = get_magick_exe()
    use_shell = magick_exe == "magick"
    
    if use_shell:
        cmd_str = f'magick "{input_path}" -quality {quality} "{output_path}"'
        logger.info(f"Executing: {cmd_str}")
        result = subprocess.run(cmd_str, shell=True, capture_output=True, text=True, timeout=120)
    else:
        cmd = [magick_exe, input_path, "-quality", str(quality), output_path]
        logger.info(f"Executing: {' '.join(cmd)}")
        result = subprocess.run(cmd, shell=False, capture_output=True, text=True, timeout=120)

    if result.returncode != 0:
        raise RuntimeError(result.stderr)


def convert_psd_to_image(input_file: str, output_file: str, output_format: str, options) -> bool:
    """Convert PSD to image format using PIL with fallback to ImageMagick"""
    try:
        quality = int(options.get("quality", 85))
        pillow_format = "JPEG" if output_format.lower() in ("jpg", "jpeg") else output_format.upper()
        
        # Try PIL/Pillow first (works for many PSD files)
        try:
            logger.info(f"Attempting PSD conversion with PIL...")
            img = Image.open(input_file)
            
            # Handle different image modes
            if img.mode in ['RGBA', 'LA', 'P']:
                # Keep transparency if present
                if output_format.lower() == 'png':
                    img.save(output_file, 'PNG')
                else:
                    # JPG doesn't support transparency, convert to RGB
                    if img.mode == 'RGBA':
                        background = Image.new('RGB', img.size, (255, 255, 255))
                        background.paste(img, mask=img.split()[3])
                        background.save(output_file, pillow_format, quality=quality)
                    elif img.mode == 'LA':
                        background = Image.new('RGB', img.size, (255, 255, 255))
                        background.paste(img, mask=img.split()[1])
                        background.save(output_file, pillow_format, quality=quality)
                    else:
                        img.convert('RGB').save(output_file, pillow_format, quality=quality)
            else:
                # No transparency, save directly
                if img.mode == 'P':
                    img = img.convert('RGB')
                img.save(output_file, pillow_format, quality=quality)
            
            logger.info(f"✓ PSD conversion successful with PIL")
            return True
            
        except Exception as pil_error:
            logger.warning(f"PIL conversion failed: {str(pil_error)}, trying ImageMagick...")
            
            # Fallback to ImageMagick
            try:
                run_magick(input_file, output_file, quality)
                
                if not os.path.exists(output_file):
                    raise RuntimeError("ImageMagick: Output image not created")
                
                logger.info(f"✓ PSD conversion successful with ImageMagick")
                return True
                
            except Exception as magick_error:
                logger.error(f"ImageMagick conversion also failed: {str(magick_error)}")
                raise RuntimeError(f"Both PIL and ImageMagick failed: PIL({str(pil_error)}) ImageMagick({str(magick_error)})")

    except Exception as e:
        logger.error(f"PSD conversion failed: {str(e)}")
        return False


def convert_psd_to_svg(input_file: str, output_file: str, options) -> bool:
    """Convert PSD to SVG by first rasterizing to PNG, then embedding"""
    temp_png = None

    try:
        quality = options.get("quality", 85)
        temp_png = os.path.join(tempfile.gettempdir(), f"psd_temp_{id(input_file)}.png")

        # Try PIL first
        try:
            logger.info(f"[PSD→SVG] Converting with PIL...")
            img = Image.open(input_file)
            
            # Convert to RGB if needed (for transparency handling)
            if img.mode in ['RGBA', 'LA']:
                # Keep alpha by saving as PNG
                img.save(temp_png, 'PNG')
            else:
                img = img.convert('RGB')
                img.save(temp_png, 'PNG', quality=quality)
                
        except Exception as pil_error:
            logger.warning(f"[PSD→SVG] PIL failed, trying ImageMagick: {str(pil_error)}")
            
            # Fallback to ImageMagick
            magick_exe = get_magick_exe()
            use_shell = magick_exe == "magick"
            
            if use_shell:
                cmd_str = f'magick "{input_file}" -quality {quality} "{temp_png}"'
                logger.info(f"[PSD→SVG] Executing: {cmd_str}")
                result = subprocess.run(cmd_str, shell=True, capture_output=True, text=True, timeout=120)
            else:
                cmd = [magick_exe, input_file, "-quality", str(quality), temp_png]
                logger.info(f"[PSD→SVG] Executing: {' '.join(cmd)}")
                result = subprocess.run(cmd, shell=False, capture_output=True, text=True, timeout=120)

            if result.returncode != 0:
                raise RuntimeError(f"ImageMagick failed: {result.stderr}")

        if not os.path.exists(temp_png):
            raise RuntimeError("Temporary PNG not created")

        img = Image.open(temp_png)
        width, height = img.size

        with open(temp_png, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")

        svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
  <image width="{width}" height="{height}" href="data:image/png;base64,{encoded}"/>
</svg>
'''

        with open(output_file, "w", encoding="utf-8") as f:
            f.write(svg)

        logger.info(f"[PSD→SVG] ✓ Conversion successful")
        return True

    except Exception as e:
        logger.error(f"PSD to SVG conversion failed: {str(e)}")
        return False

    finally:
        if temp_png and os.path.exists(temp_png):
            try:
                os.remove(temp_png)
            except Exception:
                pass


def convert_visio_to_format(input_file: str, output_file: str, output_format: str, options) -> bool:
    try:
        output_dir = os.path.dirname(output_file)

        cmd = [
            "libreoffice",
            "--headless",
            "--convert-to",
            output_format,
            "--outdir",
            output_dir,
            input_file,
        ]

        logger.info(f"[Visio] {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

        expected_output = os.path.join(
            output_dir,
            os.path.splitext(os.path.basename(input_file))[0] + f".{output_format}",
        )

        if os.path.exists(expected_output) and expected_output != output_file:
            os.rename(expected_output, output_file)

        if not os.path.exists(output_file):
            raise RuntimeError("Output file not created")

        return True

    except Exception as e:
        logger.error(f"Visio conversion failed: {str(e)}")
        return False