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
    fps: int = 30,
    quality: int = 85
) -> bool:
    """
    Convert GIF to MP4 using imageio + FFmpeg backend
    
    Args:
        input_file: Path to GIF
        output_file: Path to output MP4
        fps: Frames per second
        quality: Quality 0-100
    
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
    Convert MP4 to GIF using imageio + FFmpeg backend
    
    Args:
        input_file: Path to MP4
        output_file: Path to output GIF
        fps: Frames per second for GIF
        scale: Max width/height
    
    Returns:
        bool: Success status
    """
    try:
        logger.info(f"[Animation] Converting MP4 → GIF at {fps} FPS")
        
        if not validate_file_exists(input_file):
            return False
        
        output_dir = os.path.dirname(output_file)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        
        # Read video frames with fps limit
        logger.info(f"Reading MP4 frames at {fps} FPS")
        reader = imageio.get_reader(input_file, 'ffmpeg')
        
        frames = []
        import numpy as np
        
        for frame in reader:
            # Downscale if needed using PIL
            if scale and (frame.shape[0] > scale or frame.shape[1] > scale):
                img = Image.fromarray(frame)
                img.thumbnail((scale, scale), Image.Resampling.LANCZOS)
                frame = np.array(img)
            frames.append(frame)
        
        logger.info(f"✓ Read {len(frames)} frames from MP4")
        
        # Write as GIF using FFmpeg for optimal palette
        logger.info(f"Writing GIF: {fps} fps, {len(frames)} frames")
        
        # Generate palette first
        palette_file = output_file.replace('.gif', '_palette.png')
        cmd_palette = [
            FFMPEG_PATH,
            '-i', input_file,
            '-vf', rf'fps={fps},scale=min(iw\,-4):min(ih\,-4):flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256[p];[s1][p]paletteuse=dither=bayer',
            '-f', 'png',
            '-y', palette_file
        ]
        
        result = subprocess.run(cmd_palette, capture_output=True, text=True, timeout=300)
        if result.returncode != 0:
            raise RuntimeError(f"Palette generation failed: {result.stderr}")
        
        # Use palette to create GIF
        cmd_gif = [
            FFMPEG_PATH,
            '-i', input_file,
            '-i', palette_file,
            '-vf', rf'fps={fps},scale=min(iw\,-4):min(ih\,-4):flags=lanczos[x];[x][1:v]paletteuse=dither=bayer',
            '-f', 'gif',
            '-y', output_file
        ]
        
        result = subprocess.run(cmd_gif, capture_output=True, text=True, timeout=300)
        
        # Cleanup palette
        if os.path.exists(palette_file):
            os.remove(palette_file)
        
        if result.returncode != 0:
            raise RuntimeError(f"GIF creation failed: {result.stderr}")
        
        log_execution('AnimationEngine', 'mp4', 'gif', input_file, output_file, True)
        logger.info(f"✓ MP4 to GIF conversion successful")
        return True
        
    except ImportError:
        logger.error("imageio not installed. Install with: pip install imageio-ffmpeg imageio")
        raise RuntimeError("Animation conversion not available - missing imageio")
    except Exception as e:
        logger.error(f"MP4 to GIF conversion failed: {e}", exc_info=True)
        safe_remove(output_file)
        raise RuntimeError(f"MP4 to GIF conversion failed: {str(e)}")


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
            quality = int(options.get('quality', 85))
            return convert_gif_to_mp4(input_file, output_file, fps, quality)
        
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
    parser.add_argument('--quality', type=int, default=85, help='Quality for MP4')
    parser.add_argument('--options-json', default='{}', help='Additional options')
    
    args = parser.parse_args()
    options = json.loads(args.options_json)
    options['fps'] = args.fps
    options['quality'] = args.quality
    
    success = animation_convert(
        args.input,
        args.output,
        args.from_format,
        args.to_format,
        options
    )
    sys.exit(0 if success else 1)
