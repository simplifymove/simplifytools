#!/usr/bin/env python3
"""
TranscriptionEngine - Handles audio and video transcription
Uses faster-whisper or Whisper for speech-to-text
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, Any

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.ffmpeg_utils import extract_audio, run_ffmpeg


class TranscriptionEngine:
    """Handles audio and video transcription to text"""
    
    TRANSCRIPTION_TOOLS = {
        'audio-to-text': {
            'input_type': 'audio',
            'output_format': 'text'
        },
        'video-to-text': {
            'input_type': 'video',
            'output_format': 'text'
        },
        'youtube-to-text': {
            'input_type': 'url',
            'output_format': 'text'
        },
        'youtube-transcript': {
            'input_type': 'url',
            'output_format': 'text'
        },
        'transcribe-podcast': {
            'input_type': 'audio',
            'output_format': 'text'
        }
    }
    
    def extract_audio_for_transcription(self, input_path: str, audio_path: str) -> str:
        """
        Extract audio from video for transcription
        
        Args:
            input_path: Video file path
            audio_path: Output audio path
        
        Returns:
            Path to extracted audio
        """
        # Normalize audio: 16kHz mono WAV
        args = [
            '-i', input_path,
            '-acodec', 'pcm_s16le',
            '-ar', '16000',
            '-ac', '1',
            audio_path
        ]
        
        code, stdout, stderr = run_ffmpeg(args)
        if code != 0:
            raise RuntimeError(f'Failed to extract audio: {stderr}')
        
        return audio_path
    
    def transcribe_audio(self, audio_path: str, language: str = 'en', output_format: str = 'text') -> str:
        """
        Transcribe audio using faster-whisper or Whisper
        
        Args:
            audio_path: Path to audio file
            language: Language code (en, es, fr, etc.)
            output_format: Output format (text, srt, vtt, json)
        
        Returns:
            Transcription text or path to formatted file
        """
        try:
            from faster_whisper import WhisperModel
        except ImportError:
            try:
                import whisper
                return self._transcribe_with_whisper(audio_path, language, output_format)
            except ImportError:
                raise RuntimeError('Whisper not installed. Install with: pip install openai-whisper or faster-whisper')
        
        try:
            # Use faster-whisper for better performance
            model = WhisperModel('base', device='cpu', compute_type='int8')
            segments, info = model.transcribe(audio_path, language=language if language != 'auto' else None)
            
            text_parts = []
            segments_list = []
            
            for i, segment in enumerate(segments):
                text_parts.append(segment.text)
                segments_list.append({
                    'index': i,
                    'start': segment.start,
                    'end': segment.end,
                    'text': segment.text
                })
            
            full_text = '\n'.join(text_parts)
            
            # Format output based on requested format
            if output_format == 'srt':
                return self._format_as_srt(segments_list)
            elif output_format == 'vtt':
                return self._format_as_vtt(segments_list)
            elif output_format == 'json':
                return json.dumps(segments_list, indent=2)
            else:  # text
                return full_text
        
        except Exception as e:
            raise RuntimeError(f'Transcription failed: {str(e)}')
    
    def _transcribe_with_whisper(self, audio_path: str, language: str, output_format: str) -> str:
        """Fallback to standard Whisper"""
        import whisper
        
        model = whisper.load_model('base')
        result = model.transcribe(audio_path, language=language if language != 'auto' else None)
        
        segments_list = []
        for i, segment in enumerate(result['segments']):
            segments_list.append({
                'index': i,
                'start': segment['start'],
                'end': segment['end'],
                'text': segment['text']
            })
        
        if output_format == 'srt':
            return self._format_as_srt(segments_list)
        elif output_format == 'vtt':
            return self._format_as_vtt(segments_list)
        elif output_format == 'json':
            return json.dumps(segments_list, indent=2)
        else:
            return result['text']
    
    @staticmethod
    def _format_as_srt(segments: list) -> str:
        """Format transcription as SRT subtitle file"""
        lines = []
        for segment in segments:
            lines.append(str(segment['index'] + 1))
            start = TranscriptionEngine._seconds_to_srt_time(segment['start'])
            end = TranscriptionEngine._seconds_to_srt_time(segment['end'])
            lines.append(f'{start} --> {end}')
            lines.append(segment['text'])
            lines.append('')
        return '\n'.join(lines)
    
    @staticmethod
    def _format_as_vtt(segments: list) -> str:
        """Format transcription as VTT subtitle file"""
        lines = ['WEBVTT', '']
        for segment in segments:
            start = TranscriptionEngine._seconds_to_vtt_time(segment['start'])
            end = TranscriptionEngine._seconds_to_vtt_time(segment['end'])
            lines.append(f'{start} --> {end}')
            lines.append(segment['text'])
            lines.append('')
        return '\n'.join(lines)
    
    @staticmethod
    def _seconds_to_srt_time(seconds: float) -> str:
        """Convert seconds to SRT time format (HH:MM:SS,mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f'{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}'
    
    @staticmethod
    def _seconds_to_vtt_time(seconds: float) -> str:
        """Convert seconds to VTT time format (HH:MM:SS.mmm)"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)
        return f'{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}'
    
    def process(self, tool_id: str, input_path: str, options: Dict[str, Any]) -> Dict[str, str]:
        """
        Process transcription
        
        Args:
            tool_id: Tool identifier
            input_path: Input file path or URL
            options: Processing options
        
        Returns:
            Dictionary with output content and type
        """
        if tool_id not in self.TRANSCRIPTION_TOOLS:
            raise ValueError(f'Unknown transcription tool: {tool_id}')
        
        config = self.TRANSCRIPTION_TOOLS[tool_id]
        language = options.get('language', 'en')
        output_format = options.get('outputFormat', 'text')
        
        # Get audio to transcribe
        if config['input_type'] == 'video':
            # Extract audio from video
            audio_path = str(Path(input_path).parent / f'audio_{Path(input_path).stem}.wav')
            self.extract_audio_for_transcription(input_path, audio_path)
            transcription = self.transcribe_audio(audio_path, language, output_format)
            # Clean up temp audio
            try:
                os.remove(audio_path)
            except:
                pass
        
        elif config['input_type'] == 'url':
            # Download and transcribe (would need yt-dlp)
            raise NotImplementedError('YouTube transcription requires download engine integration')
        
        else:  # audio
            transcription = self.transcribe_audio(input_path, language, output_format)
        
        # Generate output file for formatted outputs
        if output_format in ['srt', 'vtt', 'json']:
            base_dir = Path(input_path).parent if not input_path.startswith('http') else Path.cwd() / 'tmp' / 'output'
            base_dir.mkdir(parents=True, exist_ok=True)
            
            ext_map = {'srt': '.srt', 'vtt': '.vtt', 'json': '.json'}
            output_filename = f'transcript_{Path(input_path).stem}{ext_map[output_format]}'
            output_path = str(base_dir / output_filename)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(transcription)
            
            return {
                'outputPath': output_path,
                'outputType': ext_map[output_format]
            }
        else:
            # Return as plain text
            return {
                'outputPath': '',
                'outputType': 'text',
                'content': transcription
            }


def main():
    """Entry point for transcription engine"""
    if len(sys.argv) < 3:
        print('Usage: python transcription.py <tool_id> <input_path> [options_json]', file=sys.stderr)
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
        engine = TranscriptionEngine()
        result = engine.process(tool_id, input_path, options)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
