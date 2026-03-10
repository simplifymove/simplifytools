#!/usr/bin/env python3
"""
Media Router - Routes tool requests to appropriate engine
Central entry point for all media processing
"""

import sys
import json
import os
from pathlib import Path
from typing import Dict, Any

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))

from engines.media_convert import MediaConvertEngine
from engines.media_edit import MediaEditEngine


class MediaRouter:
    """Routes media processing requests to appropriate engines"""
    
    def __init__(self):
        self.convert_engine = MediaConvertEngine()
        self.edit_engine = MediaEditEngine()
    
    def route_to_engine(self, engine: str, tool_id: str, input_path: str, options: Dict[str, Any]) -> Dict[str, str]:
        """
        Route request to appropriate engine
        
        Args:
            engine: Engine name (convert, edit, download, transcribe, summarize)
            tool_id: Tool identifier
            input_path: Input file path or URL
            options: Processing options
        
        Returns:
            Dictionary with output_path and outputType
        """
        if engine == 'convert':
            return self.convert_engine.process(tool_id, input_path, options)
        
        elif engine == 'edit':
            return self.edit_engine.process(tool_id, input_path, options)
        
        elif engine == 'download':
            # Placeholder for download engine
            raise NotImplementedError('Download engine not yet implemented')
        
        elif engine == 'transcribe':
            # Placeholder for transcription engine
            raise NotImplementedError('Transcription engine not yet implemented')
        
        elif engine == 'summarize':
            # Placeholder for summarization engine
            raise NotImplementedError('Summarization engine not yet implemented')
        
        else:
            raise ValueError(f'Unknown engine: {engine}')
    
    def process(self, engine: str, tool_id: str, input_path: str, options: Dict[str, Any]) -> Dict[str, str]:
        """
        Main processing method
        
        Args:
            engine: Engine name
            tool_id: Tool identifier
            input_path: Input file path or URL
            options: Processing options
        
        Returns:
            Dictionary with output_path and outputType
        """
        # Validate input
        if not input_path:
            raise ValueError('Input path is required')
        
        # For file inputs, validate file exists
        if not input_path.startswith('http'):  # Not a URL
            if not os.path.exists(input_path):
                raise FileNotFoundError(f'Input file not found: {input_path}')
        
        # Route to engine
        return self.route_to_engine(engine, tool_id, input_path, options)


def main():
    """Entry point - receives arguments from Node.js API"""
    if len(sys.argv) < 4:
        print(
            json.dumps({'error': 'Usage: python media_router.py <engine> <tool_id> <input_path> [options_json]'}),
            file=sys.stderr
        )
        sys.exit(1)
    
    engine = sys.argv[1]
    tool_id = sys.argv[2]
    input_path = sys.argv[3]
    options = {}
    
    # Parse options if provided
    if len(sys.argv) > 4:
        try:
            options = json.loads(sys.argv[4])
        except json.JSONDecodeError as e:
            print(json.dumps({'error': f'Invalid JSON options: {str(e)}'}), file=sys.stderr)
            sys.exit(1)
    
    try:
        router = MediaRouter()
        result = router.process(engine, tool_id, input_path, options)
        print(json.dumps(result))
    except Exception as e:
        error_result = {
            'error': str(e),
            'type': type(e).__name__
        }
        print(json.dumps(error_result), file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
