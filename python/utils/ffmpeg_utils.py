#!/usr/bin/env python3
"""
FFmpeg utilities for media processing
Handles common FFmpeg operations and validations
"""

import subprocess
import json
import os
import sys
from pathlib import Path
from typing import Dict, Optional, Tuple, List


def _get_ffmpeg_executable() -> str:
    """
    Get the full path to FFmpeg executable
    Handles Windows CapCut installation specially
    """
    configured_path = os.environ.get('FFMPEG_PATH')
    if configured_path and os.path.isfile(configured_path):
        return configured_path

    project_binary = Path(__file__).resolve().parents[2] / 'node_modules' / 'ffmpeg-static' / ('ffmpeg.exe' if sys.platform == 'win32' else 'ffmpeg')
    if project_binary.is_file():
        return str(project_binary)

    # Windows: try CapCut location first
    if sys.platform == 'win32':
        capcut_path = r'I:\CapCut\5.3.0.1964\ffmpeg.exe'
        if os.path.exists(capcut_path):
            return capcut_path
    
    # Fall back to PATH
    return 'ffmpeg'


def run_ffmpeg(args: List[str], capture_output: bool = False) -> Tuple[int, str, str]:
    """
    Run FFmpeg with given arguments
    
    Args:
        args: List of FFmpeg arguments (without 'ffmpeg')
        capture_output: Whether to capture stdout/stderr
    
    Returns:
        Tuple of (exit_code, stdout, stderr)
    """
    ffmpeg_exe = _get_ffmpeg_executable()
    cmd = [ffmpeg_exe, '-y'] + args  # -y to auto-overwrite output
    
    try:
        result = subprocess.run(
            cmd,
            capture_output=capture_output,
            text=True,
            timeout=600  # 10 minutes timeout
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        raise RuntimeError('FFmpeg processing timed out (10 minutes)')
    except FileNotFoundError:
        raise RuntimeError('FFmpeg not found. Please install FFmpeg.')


def _get_ffprobe_executable() -> str:
    """
    Get the full path to FFprobe executable
    Handles Windows CapCut installation specially
    """
    configured_path = os.environ.get('FFPROBE_PATH')
    if configured_path and os.path.isfile(configured_path):
        return configured_path

    platform_name = 'win32' if sys.platform == 'win32' else ('darwin' if sys.platform == 'darwin' else 'linux')
    architecture = 'x64' if sys.maxsize > 2**32 else 'ia32'
    executable = 'ffprobe.exe' if sys.platform == 'win32' else 'ffprobe'
    project_binary = Path(__file__).resolve().parents[2] / 'node_modules' / 'ffprobe-static' / 'bin' / platform_name / architecture / executable
    if project_binary.is_file():
        return str(project_binary)

    # Windows: try CapCut location first
    if sys.platform == 'win32':
        capcut_path = r'I:\CapCut\5.3.0.1964\ffprobe.exe'
        if os.path.exists(capcut_path):
            return capcut_path
    
    # Fall back to PATH
    return 'ffprobe'


def get_media_info(file_path: str) -> Dict:
    """
    Get information about media file using ffprobe
    
    Args:
        file_path: Path to media file
    
    Returns:
        Dictionary with media information
    """
    ffprobe_exe = _get_ffprobe_executable()
    cmd = [
        ffprobe_exe,
        '-v', 'error',
        '-select_streams', 'v:0',
        '-show_entries', 'stream=width,height,r_frame_rate,duration',
        '-of', 'json',
        file_path
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            data = json.loads(result.stdout)
            if data.get('streams'):
                stream = data['streams'][0]
                return {
                    'width': stream.get('width'),
                    'height': stream.get('height'),
                    'duration': float(stream.get('duration', 0)),
                    'frame_rate': stream.get('r_frame_rate'),
                }
    except Exception as e:
        print(f'Warning: Could not get media info: {e}', file=sys.stderr)
    
    return {}


def convert_audio_format(
    input_path: str,
    output_path: str,
    output_format: str,
    quality: Optional[str] = None,
    sample_rate: Optional[str] = None
) -> bool:
    """
    Convert audio file to different format
    
    Args:
        input_path: Input file path
        output_path: Output file path
        output_format: Output format (mp3, wav, aac, flac, etc)
        quality: Quality setting (for MP3: 2-9, lower is better)
        sample_rate: Output sample rate (e.g., 16000, 44100, 48000)
    
    Returns:
        True if successful
    """
    args = ['-i', input_path]
    
    normalized_output_format = output_format.lstrip('.').lower()

    # Add quality settings
    if normalized_output_format == 'mp3' and quality:
        args.extend(['-q:a', quality])

    # FFmpeg does not infer the MP4/iPod muxer from the ringtone-specific .m4r extension.
    if normalized_output_format == 'm4r':
        args.extend(['-c:a', 'aac', '-f', 'ipod'])
    
    # Add sample rate if specified
    if sample_rate:
        args.extend(['-ar', sample_rate])
    
    args.append(output_path)
    
    code, stdout, stderr = run_ffmpeg(args, capture_output=True)
    
    if code != 0:
        raise RuntimeError(f'FFmpeg failed: {stderr}')
    
    return True


def extract_audio(
    input_path: str,
    output_path: str,
    audio_format: Optional[str] = None,
    quality: Optional[str] = None
) -> bool:
    """
    Extract audio from video file
    
    Args:
        input_path: Input video file
        output_path: Output audio file
        audio_format: Output format (mp3, wav, aac, etc)
        quality: Audio quality
    
    Returns:
        True if successful
    """
    args = ['-i', input_path, '-vn']  # -vn removes video
    
    if quality:
        args.extend(['-q:a', quality])
    
    args.append(output_path)
    
    code, stdout, stderr = run_ffmpeg(args, capture_output=True)
    
    if code != 0:
        raise RuntimeError(f'Failed to extract audio: {stderr}')
    
    return True


def trim_media(
    input_path: str,
    output_path: str,
    start_time: str,
    end_time: str,
    output_format: Optional[str] = None
) -> bool:
    """
    Trim media file by time range using stream copy (fastest, no re-encoding)
    
    Args:
        input_path: Input media file
        output_path: Output media file
        start_time: Start time (MM:SS or HH:MM:SS)
        end_time: End time (MM:SS or HH:MM:SS)
        output_format: Output format (if different from input)
    
    Returns:
        True if successful
    """
    import json
    
    # Try to validate using media info, but don't fail if ffprobe unavailable
    try:
        media_info = get_media_info(input_path)
        duration_seconds = float(media_info.get('duration', 0))
        
        # If duration is 0, ffprobe likely failed - skip validation
        if duration_seconds == 0:
            print(f'[trim_media] Warning: Could not get video duration, skipping pre-validation', file=sys.stderr)
        else:
            # Parse time strings to seconds for validation
            def time_to_seconds(time_str: str) -> float:
                parts = time_str.split(':')
                if len(parts) == 2:
                    return int(parts[0]) * 60 + int(parts[1])
                elif len(parts) == 3:
                    return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
                return 0
            
            start_seconds = time_to_seconds(start_time)
            end_seconds = time_to_seconds(end_time)
            trim_duration = end_seconds - start_seconds
            
            # Validation checks
            if trim_duration <= 0:
                raise RuntimeError(f'Invalid trim range: end time must be after start time')
            
            if trim_duration > duration_seconds:
                raise RuntimeError(f'Trim duration ({trim_duration}s) exceeds video duration ({duration_seconds}s)')
            
            if start_seconds >= duration_seconds:
                raise RuntimeError(f'Start time ({start_seconds}s) is beyond video duration ({duration_seconds}s)')
            
            # Validate trim length is reasonable (max 1 hour to prevent extreme cases)
            if trim_duration > 3600:
                raise RuntimeError(f'Trim duration ({trim_duration}s) exceeds maximum of 3600s (1 hour)')
        
    except RuntimeError:
        # Re-raise validation errors
        raise
    except Exception as e:
        # If any other error, just log warning and continue
        print(f'[trim_media] Warning: Could not pre-validate video: {str(e)}', file=sys.stderr)


    
    # Use stream copy for fastest trimming (no re-encoding)
    # Calculate trim duration
    def time_to_seconds(time_str: str) -> float:
        parts = time_str.split(':')
        if len(parts) == 2:
            return int(parts[0]) * 60 + int(parts[1])
        elif len(parts) == 3:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
        return 0
    
    start_seconds = time_to_seconds(start_time)
    end_seconds = time_to_seconds(end_time)
    trim_duration = end_seconds - start_seconds
    
    # Try stream copy first (fastest method)
    # Put -ss BEFORE -i for faster seeking with stream copy
    args = [
        '-ss', start_time,
        '-i', input_path,
        '-t', str(trim_duration),  # Use -t for duration instead of -to for better compatibility
        '-c', 'copy',  # Copy streams without re-encoding
        output_path
    ]
    
    try:
        print(f'[trim_media] Executing: ffmpeg {" ".join(args)}', file=sys.stderr)
        code, stdout, stderr = run_ffmpeg(args, capture_output=True)
        
        if code != 0:
            error_msg = stderr.lower()
            
            # Check for frame duplication issues
            if 'duplicated' in error_msg or 'mismatched' in error_msg:
                # Fallback: if stream copy fails due to codec issues, re-encode
                print(f'[trim_media] Stream copy failed, falling back to re-encode: {stderr[:200]}', file=sys.stderr)
                
                args = [
                    '-ss', start_time,
                    '-i', input_path,
                    '-t', str(trim_duration),
                    '-c:v', 'libx264',
                    '-preset', 'ultrafast',  # Fastest encoding
                    '-crf', '28',  # Lower quality for speed
                    '-c:a', 'aac',
                    output_path
                ]
                print(f'[trim_media] Fallback FFmpeg command: ffmpeg {" ".join(args)}', file=sys.stderr)
                code, stdout, stderr = run_ffmpeg(args, capture_output=True)
                
                if code != 0:
                    raise RuntimeError(f'Failed to trim media (re-encode): {stderr}')
            else:
                print(f'[trim_media] FFmpeg error: {stderr[:500]}', file=sys.stderr)
                raise RuntimeError(f'Failed to trim media: {stderr}')
        
        print(f'[trim_media] Successfully trimmed video', file=sys.stderr)
        return True
        
    except subprocess.TimeoutExpired:
        raise RuntimeError(f'Trim operation timed out after 10 minutes. Video may be very large or corrupted.')



def resize_video(
    input_path: str,
    output_path: str,
    width: int,
    height: int,
    keep_aspect: bool = True
) -> bool:
    """
    Resize video to specified dimensions with high quality output
    
    Args:
        input_path: Input video file
        output_path: Output video file
        width: Target width
        height: Target height
        keep_aspect: Whether to keep aspect ratio
    
    Returns:
        True if successful
    """
    # H.264/yuv420p encoding requires dimensions divisible by 2.
    # Normalize the requested bounding box first.
    width = max(2, width if width % 2 == 0 else width - 1)
    height = max(2, height if height % 2 == 0 else height - 1)

    if keep_aspect:
        # FFmpeg may recalculate one dimension while preserving aspect ratio,
        # so force the resulting dimensions to remain divisible by 2 as well.
        scale_filter = (
            f'scale={width}:{height}:'
            'force_original_aspect_ratio=decrease:force_divisible_by=2'
        )
    else:
        scale_filter = f'scale={width}:{height}'
    
    args = [
        '-i', input_path,
        '-vf', scale_filter,
        '-b:v', '5000k',  # High quality bitrate (5 Mbps)
        '-c:a', 'copy',  # Copy audio unchanged for quality preservation
        output_path
    ]
    
    code, stdout, stderr = run_ffmpeg(args, capture_output=True)
    
    if code != 0:
        raise RuntimeError(f'Failed to resize video: {stderr}')
    
    return True


def mute_video(
    input_path: str,
    output_path: str
) -> bool:
    """
    Remove audio from video
    
    Args:
        input_path: Input video file
        output_path: Output video file
    
    Returns:
        True if successful
    """
    args = [
        '-i', input_path,
        '-c:v', 'copy',  # Copy video unchanged
        '-an',  # No audio
        output_path
    ]
    
    code, stdout, stderr = run_ffmpeg(args, capture_output=True)
    
    if code != 0:
        raise RuntimeError(f'Failed to mute video: {stderr}')
    
    return True


def compress_video(
    input_path: str,
    output_path: str,
    preset: str = 'medium',
    crf: int = 28
) -> bool:
    """
    Compress video with specified quality preset
    
    Args:
        input_path: Input video file
        output_path: Output video file
        preset: Compression preset (fast, medium, slow)
        crf: Quality (0-51, lower is better, default 28)
    
    Returns:
        True if successful
    """
    import os
    
    preset_map = {
        'fast': 'superfast',
        'medium': 'medium',
        'slow': 'slow'
    }
    
    # Adjust CRF based on preset for actual file size reduction
    # CRF ranges: 0-51 (0=lossless, 23=default, 51=worst quality)
    # HIGHER CRF = LOWER quality = SMALLER file
    crf_map = {
        'fast': 28,      # Low compression: maintains reasonable quality
        'medium': 32,    # Medium compression: balanced quality/size
        'slow': 40       # High compression: aggressive compression, smaller file
    }
    
    # Video bitrate limits based on compression level
    bitrate_map = {
        'fast': '1200k',   # Low compression: higher bitrate
        'medium': '800k',  # Medium compression: balanced
        'slow': '500k'     # High compression: lower bitrate
    }
    
    # Use provided CRF if explicitly set to non-default, otherwise use preset-based CRF
    if crf == 28:  # Default value
        crf = crf_map.get(preset, 28)
    
    ffmpeg_preset = preset_map.get(preset, 'medium')
    video_bitrate = bitrate_map.get(preset, '800k')
    
    args = [
        '-i', input_path,
        '-c:v', 'libx264',
        '-preset', ffmpeg_preset,
        '-crf', str(crf),
        '-b:v', video_bitrate,     # Video bitrate limiting
        '-maxrate', video_bitrate,  # Max bitrate
        '-bufsize', f'{int(video_bitrate[:-1])*2}k',  # Buffer size
        '-c:a', 'aac',
        '-b:a', '96k',   # Reduced audio bitrate
        output_path
    ]
    
    code, stdout, stderr = run_ffmpeg(args, capture_output=True)
    
    if code != 0:
        raise RuntimeError(f'Failed to compress video: {stderr}')
    
    return True


def convert_to_gif(
    input_path: str,
    output_path: str,
    fps: int = 10,
    scale: int = 320
) -> bool:
    """
    Convert video to animated GIF
    
    Args:
        input_path: Input video file
        output_path: Output GIF file
        fps: Frames per second
        scale: Width (height auto-scales)
    
    Returns:
        True if successful
    """
    # First pass: generate palette
    palette_path = output_path.replace('.gif', '_palette.png')
    
    args_palette = [
        '-i', input_path,
        '-vf', f'fps={fps},scale={scale}:-1:flags=lanczos,palettegen',
        palette_path
    ]
    
    code, stdout, stderr = run_ffmpeg(args_palette, capture_output=True)
    
    if code != 0:
        raise RuntimeError(f'Failed to generate GIF palette: {stderr}')
    
    # Second pass: use palette to create GIF
    args_gif = [
        '-i', input_path,
        '-i', palette_path,
        '-filter_complex', f'fps={fps},scale={scale}:-1:flags=lanczos[x];[x][1:v]paletteuse',
        output_path
    ]
    
    code, stdout, stderr = run_ffmpeg(args_gif, capture_output=True)
    
    # Clean up palette
    try:
        os.remove(palette_path)
    except:
        pass
    
    if code != 0:
        raise RuntimeError(f'Failed to create GIF: {stderr}')
    
    return True


def convert_to_webp(
    input_path: str,
    output_path: str,
    quality: int = 80
) -> bool:
    """
    Convert video to WebP animated format
    
    Args:
        input_path: Input video file
        output_path: Output WebP file
        quality: Quality (0-100)
    
    Returns:
        True if successful
    """
    args = [
        '-i', input_path,
        '-q:v', str(quality),
        output_path
    ]
    
    code, stdout, stderr = run_ffmpeg(args, capture_output=True)
    
    if code != 0:
        raise RuntimeError(f'Failed to create WebP: {stderr}')
    
    return True


def get_output_format_and_codec(output_format: str) -> Tuple[str, str, str]:
    """
    Get FFmpeg codec and format settings for given output format
    
    Args:
        output_format: Output file extension (e.g., '.mp4', '.mov')
    
    Returns:
        Tuple of (format, video_codec, audio_codec)
    """
    format_config = {
        '.mp4': ('mp4', 'libx264', 'aac'),
        '.mov': ('mov', 'libx264', 'aac'),
        '.avi': ('avi', 'mpeg4', 'libmp3lame'),
        '.mkv': ('matroska', 'libx264', 'aac'),
        '.webm': ('webm', 'libvpx-vp9', 'libopus'),
        '.flv': ('flv', 'flv1', 'libmp3lame'),
    }
    
    return format_config.get(output_format, ('mp4', 'libx264', 'aac'))
