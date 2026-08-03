"""Animation converter engine (GIF, MP4) using imageio with FFmpeg backend"""
import os
import json
import subprocess
from typing import Optional, Dict, Any
import logging
import imageio
from PIL import Image
from .utils import validate_file_exists, safe_remove, log_execution

try:
    import imageio_ffmpeg
    FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()
except:
    FFMPEG_PATH = 'ffmpeg'  # Fallback to system FFmpeg

logger = logging.getLogger(__name__)


def convert_gif_to_mp4(
    input_file: str,
    output_file: str,
    fps: int = 30
) -> bool:
    """
    Convert GIF to MP4 using imageio + FFmpeg backend
    
    Args:
        input_file: Path to GIF
        output_file: Path to output MP4
        fps: Frames per second
    
    Returns:
        bool: Success status
    """
    try:
        logger.info(f"[Animation] Converting GIF → MP4 at {fps} FPS")
        
        if not validate_file_exists(input_file):
            return False
        
        output_dir = os.path.dirname(output_file)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        
        # Read GIF frames
        logger.info(f"Reading GIF frames from {input_file}")
        gif = imageio.mimread(input_file)
        
        if not gif:
            raise RuntimeError("Could not read GIF frames")
        
        logger.info(f"✓ Read {len(gif)} frames from GIF")
        
        # Write as MP4 using FFmpeg subprocess
        logger.info(f"Writing MP4: {fps} fps")
        
        # Use FFmpeg directly
        cmd = [
            FFMPEG_PATH,
            '-i', input_file,
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-r', str(fps),
            '-f', 'mp4',  # Explicitly specify format
            '-y',  # Overwrite
            output_file
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg failed: {result.stderr}")
        
        log_execution('AnimationEngine', 'gif', 'mp4', input_file, output_file, True)
        logger.info(f"✓ GIF to MP4 conversion successful")
        return True
        
    except ImportError:
        logger.error("imageio not installed. Install with: pip install imageio-ffmpeg imageio")
        raise RuntimeError("Animation conversion not available - missing imageio")
    except Exception as e:
        logger.error(f"GIF to MP4 conversion failed: {e}", exc_info=True)
        safe_remove(output_file)
        raise RuntimeError(f"GIF to MP4 conversion failed: {str(e)}")


def convert_mp4_to_gif(
    input_file: str,
    output_file: str,
    fps: int = 10,
    scale: int = 512
) -> bool:
    """
    Convert MP4 to animated GIF using FFmpeg with a generated palette.

    Args:
        input_file: Path to MP4
        output_file: Path to output GIF
        fps: Frames per second for GIF
        scale: Maximum output width while preserving aspect ratio
    """
    palette_file = output_file.replace('.gif', '_palette.png')

    try:
        logger.info(
            f"[Animation] Converting MP4 → GIF at {fps} FPS, max width {scale}px"
        )

        if not validate_file_exists(input_file):
            return False

        output_dir = os.path.dirname(output_file)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)

        # Keep values within practical bounds.
        fps = max(1, min(30, int(fps)))
        scale = max(64, min(1920, int(scale)))

        # GIF dimensions must be even for predictable FFmpeg scaling.
        scale_filter = (
            f"fps={fps},"
            f"scale='min({scale},iw)':-2:flags=lanczos"
        )

        # Generate an optimized palette from the same scaled frame stream
        # that will be used for the final GIF.
        cmd_palette = [
            FFMPEG_PATH,
            '-i', input_file,
            '-vf',
            (
                f"{scale_filter},"
                "palettegen=max_colors=256:stats_mode=diff"
            ),
            '-y',
            palette_file,
        ]

        result = subprocess.run(
            cmd_palette,
            capture_output=True,
            text=True,
            timeout=300,
        )

        if result.returncode != 0:
            raise RuntimeError(
                f"Palette generation failed: {result.stderr}"
            )

        cmd_gif = [
            FFMPEG_PATH,
            '-i', input_file,
            '-i', palette_file,
            '-lavfi',
            (
                f"{scale_filter}[x];"
                "[x][1:v]paletteuse=dither=bayer:bayer_scale=5"
            ),
            '-f', 'gif',
            '-y',
            output_file,
        ]

        result = subprocess.run(
            cmd_gif,
            capture_output=True,
            text=True,
            timeout=300,
        )

        if result.returncode != 0:
            raise RuntimeError(
                f"GIF creation failed: {result.stderr}"
            )

        if (
            not os.path.exists(output_file)
            or os.path.getsize(output_file) == 0
        ):
            raise RuntimeError(
                "FFmpeg did not create a valid GIF output file"
            )

        with open(output_file, 'rb') as output:
            signature = output.read(6)

        if signature not in (b'GIF87a', b'GIF89a'):
            raise RuntimeError(
                "Generated output does not contain a valid GIF signature"
            )

        log_execution(
            'AnimationEngine',
            'mp4',
            'gif',
            input_file,
            output_file,
            True,
        )

        logger.info("✓ MP4 to GIF conversion successful")
        return True

    except Exception as e:
        logger.error(
            f"MP4 to GIF conversion failed: {e}",
            exc_info=True,
        )
        safe_remove(output_file)
        raise RuntimeError(
            f"MP4 to GIF conversion failed: {str(e)}"
        )

    finally:
        if os.path.exists(palette_file):
            safe_remove(palette_file)


def animation_convert(
    input_file: str,
    output_file: str,
    from_format: str,
    to_format: str,
    options: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Main entry point for animation conversions
    """
    try:
        options = options or {}
        
        if from_format.lower() == 'gif' and to_format.lower() == 'mp4':
            fps = int(options.get('fps', 30))
            return convert_gif_to_mp4(input_file, output_file, fps)
        
        elif from_format.lower() == 'mp4' and to_format.lower() == 'gif':
            fps = int(options.get('fps', 10))
            scale = int(options.get('scale', 512))
            return convert_mp4_to_gif(input_file, output_file, fps, scale)
        
        else:
            logger.error(f"Unsupported animation conversion: {from_format} → {to_format}")
            return False
        
    except Exception as e:
        logger.error(f"Animation conversion failed: {e}", exc_info=True)
        return False


if __name__ == '__main__':
    import sys
    import argparse
    
    parser = argparse.ArgumentParser(description='Animation Format Converter')
    parser.add_argument('--input', '-i', required=True, help='Input file path')
    parser.add_argument('--output', '-o', required=True, help='Output file path')
    parser.add_argument('--from-format', required=True, choices=['gif', 'mp4'])
    parser.add_argument('--to-format', required=True, choices=['gif', 'mp4'])
    parser.add_argument('--fps', type=int, default=30, help='Frames per second')
    parser.add_argument('--options-json', default='{}', help='Additional options')
    
    args = parser.parse_args()
    options = json.loads(args.options_json)
    options['fps'] = args.fps
    
    success = animation_convert(
        args.input,
        args.output,
        args.from_format,
        args.to_format,
        options
    )
    sys.exit(0 if success else 1)
