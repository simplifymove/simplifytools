#!/usr/bin/env python3
"""
MediaConvertEngine - Handles all media format conversions
Converts between video and audio formats using FFmpeg
"""

import os
import sys
from pathlib import Path
from typing import Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.ffmpeg_utils import (
    run_ffmpeg,
    extract_audio,
    convert_audio_format,
    get_output_format_and_codec
)


class MediaConvertEngine:
    """Handles media format conversions"""
    
    # Conversion mapping
    CONVERSIONS = {
        # MP4 conversions
        'mp4-to-mp3': {
            'input_format': '.mp4',
            'output_format': '.mp3',
            'handler': 'audio_extraction'
        },
        'mp4-to-wav': {
            'input_format': '.mp4',
            'output_format': '.wav',
            'handler': 'audio_extraction'
        },
        'mp4-to-avi': {
            'input_format': '.mp4',
            'output_format': '.avi',
            'handler': 'video_conversion'
        },
        'mp4-to-mov': {
            'input_format': '.mp4',
            'output_format': '.mov',
            'handler': 'video_conversion'
        },
        'mp4-to-ogg': {
            'input_format': '.mp4',
            'output_format': '.ogg',
            'handler': 'audio_extraction'
        },
        
        # MOV conversions
        'mov-to-mp4': {
            'input_format': '.mov',
            'output_format': '.mp4',
            'handler': 'video_conversion'
        },
        'mov-to-mp3': {
            'input_format': '.mov',
            'output_format': '.mp3',
            'handler': 'audio_extraction'
        },
        'mov-to-avi': {
            'input_format': '.mov',
            'output_format': '.avi',
            'handler': 'video_conversion'
        },
        'mov-to-gif': {
            'input_format': '.mov',
            'output_format': '.gif',
            'handler': 'video_conversion'
        },
        
        # AVI conversions
        'avi-to-mp4': {
            'input_format': '.avi',
            'output_format': '.mp4',
            'handler': 'video_conversion'
        },
        'avi-to-mp3': {
            'input_format': '.avi',
            'output_format': '.mp3',
            'handler': 'audio_extraction'
        },
        'avi-to-mov': {
            'input_format': '.avi',
            'output_format': '.mov',
            'handler': 'video_conversion'
        },
        'avi-to-mkv': {
            'input_format': '.avi',
            'output_format': '.mkv',
            'handler': 'video_conversion'
        },
        'avi-to-gif': {
            'input_format': '.avi',
            'output_format': '.gif',
            'handler': 'video_conversion'
        },
        
        # MKV conversions
        'mkv-to-mp4': {
            'input_format': '.mkv',
            'output_format': '.mp4',
            'handler': 'video_conversion'
        },
        'mkv-to-mp3': {
            'input_format': '.mkv',
            'output_format': '.mp3',
            'handler': 'audio_extraction'
        },
        'mkv-to-avi': {
            'input_format': '.mkv',
            'output_format': '.avi',
            'handler': 'video_conversion'
        },
        'mkv-to-mov': {
            'input_format': '.mkv',
            'output_format': '.mov',
            'handler': 'video_conversion'
        },
        'mkv-to-gif': {
            'input_format': '.mkv',
            'output_format': '.gif',
            'handler': 'video_conversion'
        },
        
        # WebM conversions
        'webm-to-mp4': {
            'input_format': '.webm',
            'output_format': '.mp4',
            'handler': 'video_conversion'
        },
        'webm-to-mp3': {
            'input_format': '.webm',
            'output_format': '.mp3',
            'handler': 'audio_extraction'
        },
        'webm-to-mov': {
            'input_format': '.webm',
            'output_format': '.mov',
            'handler': 'video_conversion'
        },
        
        # AAC conversions
        'aac-to-mp3': {
            'input_format': '.aac',
            'output_format': '.mp3',
            'handler': 'audio_conversion'
        },
        'aac-to-wav': {
            'input_format': '.aac',
            'output_format': '.wav',
            'handler': 'audio_conversion'
        },
        'aac-to-flac': {
            'input_format': '.aac',
            'output_format': '.flac',
            'handler': 'audio_conversion'
        },
        'aac-to-m4r': {
            'input_format': '.aac',
            'output_format': '.m4r',
            'handler': 'audio_conversion'
        },
        'aac-to-mp4': {
            'input_format': '.aac',
            'output_format': '.mp4',
            'handler': 'audio_to_container'
        },
        
        # OGG conversions
        'ogg-to-wav': {
            'input_format': '.ogg',
            'output_format': '.wav',
            'handler': 'audio_conversion'
        },
        'ogg-to-mp3': {
            'input_format': '.ogg',
            'output_format': '.mp3',
            'handler': 'audio_conversion'
        },
        
        # M4A conversions
        'm4a-to-mp3': {
            'input_format': '.m4a',
            'output_format': '.mp3',
            'handler': 'audio_conversion'
        },
        'm4a-to-wav': {
            'input_format': '.m4a',
            'output_format': '.wav',
            'handler': 'audio_conversion'
        },
        'm4a-to-mp4': {
            'input_format': '.m4a',
            'output_format': '.mp4',
            'handler': 'audio_to_container'
        },
        
        # GIF conversions
        'gif-to-mov': {
            'input_format': '.gif',
            'output_format': '.mov',
            'handler': 'video_conversion'
        },
        'gif-to-webp': {
            'input_format': '.gif',
            'output_format': '.webp',
            'handler': 'video_conversion'
        },
    }
    
    @staticmethod
    def audio_extraction(input_path: str, output_path: str, options: Dict[str, Any]) -> str:
        """Extract audio from video"""
        quality = options.get('audioQuality')
        extract_audio(input_path, output_path, quality=quality)
        return output_path
    
    @staticmethod
    def audio_conversion(input_path: str, output_path: str, options: Dict[str, Any]) -> str:
        """Convert between audio formats"""
        quality = options.get('quality')
        sample_rate = options.get('sampleRate')
        output_format = Path(output_path).suffix
        
        convert_audio_format(
            input_path,
            output_path,
            output_format,
            quality=quality,
            sample_rate=sample_rate
        )
        return output_path
    
    @staticmethod
    def video_conversion(input_path: str, output_path: str, options: Dict[str, Any]) -> str:
        """Convert between video formats"""
        output_format = Path(output_path).suffix
        fmt, v_codec, a_codec = get_output_format_and_codec(output_format)
        
        # Use stream copy for quick conversion
        args = [
            '-i', input_path,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-c:a', 'aac',
            output_path
        ]
        
        code, stdout, stderr = run_ffmpeg(args)
        if code != 0:
            raise RuntimeError(f'Conversion failed: {stderr}')
        
        return output_path
    
    @staticmethod
    def audio_to_container(input_path: str, output_path: str, options: Dict[str, Any]) -> str:
        """Convert audio to video container (creates video file with just audio)"""
        args = [
            '-i', input_path,
            '-c:a', 'aac',
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-s', '1x1',  # 1x1 pixel video
            '-t', '0.1',  # Very short duration (just to create valid file)
            output_path
        ]
        
        code, stdout, stderr = run_ffmpeg(args)
        if code != 0:
            raise RuntimeError(f'Container conversion failed: {stderr}')
        
        return output_path
    
    def process(self, tool_id: str, input_path: str, options: Dict[str, Any]) -> Dict[str, str]:
        """
        Process media conversion
        
        Args:
            tool_id: Tool identifier
            input_path: Input file path
            options: Processing options
        
        Returns:
            Dictionary with output_path and outputType
        """
        if tool_id not in self.CONVERSIONS:
            raise ValueError(f'Unknown conversion tool: {tool_id}')
        
        config = self.CONVERSIONS[tool_id]
        handler_name = config['handler']
        output_format = config['output_format']
        
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
    """Entry point for media conversion engine"""
    if len(sys.argv) < 4:
        print('Usage: python media_convert.py <tool_id> <input_path> <options_json>', file=sys.stderr)
        sys.exit(1)
    
    tool_id = sys.argv[1]
    input_path = sys.argv[2]
    options = {}
    
    if len(sys.argv) > 3:
        import json
        try:
            options = json.loads(sys.argv[3])
        except json.JSONDecodeError:
            pass
    
    try:
        engine = MediaConvertEngine()
        result = engine.process(tool_id, input_path, options)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
