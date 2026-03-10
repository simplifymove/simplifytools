#!/usr/bin/env python3
"""
MediaEditEngine - Handles media editing operations
Trim, resize, compress, mute video, convert to GIF, etc.
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.ffmpeg_utils import (
    trim_media,
    resize_video,
    mute_video,
    compress_video,
    extract_audio,
    convert_to_gif,
    convert_to_webp,
    run_ffmpeg
)


class MediaEditEngine:
    """Handles media editing operations"""
    
    EDIT_OPERATIONS = {
        # Trim operations
        'trim-video': {
            'handler': 'trim_video_op'
        },
        
        # Resize operations
        'resize-video': {
            'handler': 'resize_video_op'
        },
        
        # Mute operations
        'mute-video': {
            'handler': 'mute_video_op'
        },
        
        # Extract audio
        'extract-audio-from-video': {
            'handler': 'extract_audio_op'
        },
        
        # Compress operations
        'compress-video': {
            'handler': 'compress_video_op'
        },
        'compress-mov': {
            'handler': 'compress_video_op'
        },
        'compress-avi': {
            'handler': 'compress_video_op'
        },
        'compress-mkv': {
            'handler': 'compress_video_op'
        },
        
        # Format conversions
        'video-to-gif': {
            'handler': 'video_to_gif_op'
        },
        'video-to-webp': {
            'handler': 'video_to_webp_op'
        },
        'mp4-to-webm': {
            'handler': 'video_transcode_op'
        },
        
        # Additional format conversions
        'mgv-to-gif': {
            'handler': 'video_to_gif_op'
        },
        'avi-to-gif': {
            'handler': 'video_to_gif_op'
        },
        'mov-to-gif': {
            'handler': 'video_to_gif_op'
        },
        'mp4-to-gif': {
            'handler': 'video_to_gif_op'
        },
        'mkv-to-gif': {
            'handler': 'video_to_gif_op'
        },
        
        # Add subtitles
        'add-subtitles': {
            'handler': 'add_subtitles_op'
        }
    }
    
    @staticmethod
    def trim_video_op(input_path: str, output_path: str, options: Dict[str, Any]) -> str:
        """Trim video by time range"""
        start_time = options.get('startTime', '00:00')
        end_time = options.get('endTime', '00:10')
        
        trim_media(input_path, output_path, start_time, end_time)
        return output_path
    
    @staticmethod
    def resize_video_op(input_path: str, output_path: str, options: Dict[str, Any]) -> str:
        """Resize video"""
        width = int(options.get('width', 1920))
        height = int(options.get('height', 1080))
        keep_aspect = options.get('keepAspect', True)
        
        resize_video(input_path, output_path, width, height, keep_aspect)
        return output_path
    
    @staticmethod
    def mute_video_op(input_path: str, output_path: str, options: Dict[str, Any]) -> str:
        """Remove audio from video"""
        mute_video(input_path, output_path)
        return output_path
    
    @staticmethod
    def extract_audio_op(input_path: str, output_path: str, options: Dict[str, Any]) -> str:
        """Extract audio from video"""
        output_format = options.get('outputFormat', 'mp3')
        quality = options.get('audioQuality')
        
        # Ensure correct extension
        output_ext = f'.{output_format}' if not output_format.startswith('.') else output_format
        output_path = str(Path(output_path).with_suffix(output_ext))
        
        extract_audio(input_path, output_path, audio_format=output_format, quality=quality)
        return output_path
    
    @staticmethod
    def compress_video_op(input_path: str, output_path: str, options: Dict[str, Any]) -> str:
        """Compress video"""
        preset = options.get('preset', 'medium')
        crf = int(options.get('crf', 28))
        
        compress_video(input_path, output_path, preset=preset, crf=crf)
        return output_path
    
    @staticmethod
    def video_to_gif_op(input_path: str, output_path: str, options: Dict[str, Any]) -> str:
        """Convert video to GIF"""
        fps = int(options.get('fps', 10))
        scale = int(options.get('scale', 320))
        
        output_path = str(Path(output_path).with_suffix('.gif'))
        convert_to_gif(input_path, output_path, fps=fps, scale=scale)
        return output_path
    
    @staticmethod
    def video_to_webp_op(input_path: str, output_path: str, options: Dict[str, Any]) -> str:
        """Convert video to WebP"""
        quality = int(options.get('quality', 80))
        
        output_path = str(Path(output_path).with_suffix('.webp'))
        convert_to_webp(input_path, output_path, quality=quality)
        return output_path
    
    @staticmethod
    def video_transcode_op(input_path: str, output_path: str, options: Dict[str, Any]) -> str:
        """Transcode video to different format"""
        output_format = Path(output_path).suffix
        quality = options.get('quality', 'medium')
        
        preset_map = {'low': 'superfast', 'medium': 'medium', 'high': 'slow'}
        preset = preset_map.get(quality, 'medium')
        
        args = [
            '-i', input_path,
            '-c:v', 'libvpx-vp9',
            '-preset', preset,
            '-c:a', 'libopus',
            output_path
        ]
        
        code, stdout, stderr = run_ffmpeg(args)
        if code != 0:
            raise RuntimeError(f'Transcoding failed: {stderr}')
        
        return output_path
    
    @staticmethod
    def add_subtitles_op(input_path: str, output_path: str, options: Dict[str, Any]) -> str:
        """Add subtitles to video (basic implementation)"""
        subtitle_mode = options.get('subtitleMode', 'soft')
        
        # This is a placeholder - in production would need subtitle file
        # For now, just copy the video
        args = ['-i', input_path, '-c', 'copy', output_path]
        code, stdout, stderr = run_ffmpeg(args)
        
        if code != 0:
            raise RuntimeError(f'Failed to add subtitles: {stderr}')
        
        return output_path
    
    def process(self, tool_id: str, input_path: str, options: Dict[str, Any]) -> Dict[str, str]:
        """
        Process media editing operation
        
        Args:
            tool_id: Tool identifier
            input_path: Input file path
            options: Processing options
        
        Returns:
            Dictionary with output_path and outputType
        """
        if tool_id not in self.EDIT_OPERATIONS:
            raise ValueError(f'Unknown edit operation: {tool_id}')
        
        config = self.EDIT_OPERATIONS[tool_id]
        handler_name = config['handler']
        
        # Determine output format
        if tool_id in ['video-to-gif', 'mgv-to-gif', 'avi-to-gif', 'mov-to-gif', 'mp4-to-gif', 'mkv-to-gif']:
            output_format = '.gif'
        elif tool_id == 'video-to-webp':
            output_format = '.webp'
        elif tool_id == 'mp4-to-webm':
            output_format = '.webm'
        elif tool_id == 'extract-audio-from-video':
            output_format = f'.{options.get("outputFormat", "mp3")}'
        else:
            # Keep same format
            output_format = Path(input_path).suffix
        
        # Generate output path
        base_dir = Path(input_path).parent
        output_filename = f'output_{Path(input_path).stem}{output_format}'
        output_path = str(base_dir / output_filename)
        
        # Get handler method
        handler = getattr(self, handler_name)
        result_path = handler(input_path, output_path, options)
        
        return {
            'outputPath': result_path,
            'outputType': output_format
        }


def main():
    """Entry point for media edit engine"""
    if len(sys.argv) < 4:
        print('Usage: python media_edit.py <tool_id> <input_path> <options_json>', file=sys.stderr)
        sys.exit(1)
    
    tool_id = sys.argv[1]
    input_path = sys.argv[2]
    options = {}
    
    if len(sys.argv) > 3:
        try:
            options = json.loads(sys.argv[3])
        except json.JSONDecodeError:
            pass
    
    try:
        engine = MediaEditEngine()
        result = engine.process(tool_id, input_path, options)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
