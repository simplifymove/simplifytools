#!/usr/bin/env python3
"""
Social Media Video Downloader
Supports: YouTube, TikTok, Instagram, Facebook, Twitter, Vimeo, etc.
Uses: yt-dlp library
"""

import sys
import json
import subprocess
from pathlib import Path
import tempfile
import os

def download_video(url: str, output_dir: str = None) -> dict:
    """Download video from provided URL using yt-dlp"""
    
    if not output_dir:
        output_dir = tempfile.gettempdir()
    
    try:
        # Create output template
        output_template = os.path.join(output_dir, "%(title)s.%(ext)s")
        
        # yt-dlp command
        cmd = [
            'yt-dlp',
            url,
            '-o', output_template,
            '-f', 'best[ext=mp4]/best',  # Prefer MP4
            '--quiet',
            '--no-warnings'
        ]
        
        # Run yt-dlp
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode != 0:
            return {
                'success': False,
                'error': result.stderr or 'Failed to download video'
            }
        
        # Find the downloaded file
        files = os.listdir(output_dir)
        files_with_time = [
            (f, os.path.getmtime(os.path.join(output_dir, f)))
            for f in files
            if os.path.isfile(os.path.join(output_dir, f))
        ]
        
        if not files_with_time:
            return {
                'success': False,
                'error': 'No file was downloaded'
            }
        
        # Get most recently modified file
        latest_file = max(files_with_time, key=lambda x: x[1])[0]
        file_path = os.path.join(output_dir, latest_file)
        file_size = os.path.getsize(file_path)
        
        return {
            'success': True,
            'file_path': file_path,
            'file_name': latest_file,
            'file_size': file_size,
            'file_type': 'video/mp4'
        }
        
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'error': 'Download took too long (timeout after 5 minutes)'
        }
    except FileNotFoundError:
        return {
            'success': False,
            'error': 'yt-dlp is not installed. Run: pip install yt-dlp'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'URL required'
        }))
        sys.exit(1)
    
    url = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None
    
    result = download_video(url, output_dir)
    print(json.dumps(result))
