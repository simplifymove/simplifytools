#!/usr/bin/env python3
"""
MediaDownloadEngine - Handles downloading from various platforms
YouTube, TikTok, Instagram, Twitter, Facebook
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, Any

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.ffmpeg_utils import run_ffmpeg


class MediaDownloadEngine:
    """Handles media downloading from various platforms"""
    
    DOWNLOAD_OPERATIONS = {
        'youtube-to-text': {
            'platform': 'youtube',
            'output_format': '.mp4'
        },
        'youtube-transcript': {
            'platform': 'youtube', 
            'output_format': 'text'
        },
        'instagram-download': {
            'platform': 'instagram',
            'output_format': '.mp4'
        },
        'tiktok-video-download': {
            'platform': 'tiktok',
            'output_format': '.mp4'
        },
        'twitter-download': {
            'platform': 'twitter',
            'output_format': '.mp4'
        },
        'facebook-download': {
            'platform': 'facebook',
            'output_format': '.mp4'
        }
    }
    
    def download_with_ytdlp(self, url: str, output_path: str) -> str:
        """
        Download media using yt-dlp
        
        Args:
            url: URL to download from
            output_path: Output file path
        
        Returns:
            Path to downloaded file
        """
        # Import here to avoid requiring yt-dlp as hard dependency
        try:
            import yt_dlp
        except ImportError:
            raise RuntimeError('yt-dlp not installed. Install with: pip install yt-dlp')
        
        output_dir = str(Path(output_path).parent)
        output_template = str(Path(output_path).stem)
        
        ydl_opts = {
            'format': 'best[ext=mp4]/best',
            'outtmpl': os.path.join(output_dir, output_template),
            'quiet': False,
            'no_warnings': False,
        }
        
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                downloaded_file = ydl.prepare_filename(info)
                return downloaded_file
        except Exception as e:
            raise RuntimeError(f'Download failed: {str(e)}')
    
    def process(self, tool_id: str, url: str, options: Dict[str, Any]) -> Dict[str, str]:
        """
        Process media download
        
        Args:
            tool_id: Tool identifier
            url: URL to download from
            options: Processing options
        
        Returns:
            Dictionary with output_path and outputType
        """
        if tool_id not in self.DOWNLOAD_OPERATIONS:
            raise ValueError(f'Unknown download tool: {tool_id}')
        
        config = self.DOWNLOAD_OPERATIONS[tool_id]
        output_format = config['output_format']
        
        # Generate output path
        base_dir = Path.cwd() / 'tmp' / 'output'
        base_dir.mkdir(parents=True, exist_ok=True)
        
        output_filename = f'download_{Path(url).name[:20]}{output_format}'
        output_path = str(base_dir / output_filename)
        
        # Download using yt-dlp
        final_path = self.download_with_ytdlp(url, output_path)
        
        return {
            'outputPath': final_path,
            'outputType': output_format
        }


def main():
    """Entry point for media download engine"""
    if len(sys.argv) < 3:
        print('Usage: python media_download.py <tool_id> <url> [options_json]', file=sys.stderr)
        sys.exit(1)
    
    tool_id = sys.argv[1]
    url = sys.argv[2]
    options = {}
    
    if len(sys.argv) > 3:
        try:
            options = json.loads(sys.argv[3])
        except json.JSONDecodeError:
            pass
    
    try:
        engine = MediaDownloadEngine()
        result = engine.process(tool_id, url, options)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
