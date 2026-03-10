#!/usr/bin/env python3
"""
SummarizationEngine - Handles podcast and audio summarization
Transcribes then summarizes using LLM
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, Any, List

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from transcription import TranscriptionEngine


class SummarizationEngine:
    """Handles audio and video summarization"""
    
    SUMMARIZATION_TOOLS = {
        'summarize-podcast': {
            'input_type': 'audio',
            'output_format': 'summary'
        }
    }
    
    def __init__(self):
        self.transcription_engine = TranscriptionEngine()
    
    def chunk_text(self, text: str, chunk_size: int = 500) -> List[str]:
        """
        Split text into chunks for summarization
        
        Args:
            text: Full text to chunk
            chunk_size: Approximate size of each chunk (in words)
        
        Returns:
            List of text chunks
        """
        words = text.split()
        chunks = []
        current_chunk = []
        current_size = 0
        
        for word in words:
            current_chunk.append(word)
            current_size += 1
            
            if current_size >= chunk_size:
                chunks.append(' '.join(current_chunk))
                current_chunk = []
                current_size = 0
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    def summarize_text(self, text: str, style: str = 'mixed') -> Dict[str, str]:
        """
        Summarize text using LLM
        
        Args:
            text: Text to summarize
            style: Summary style (mixed, detailed, bullets)
        
        Returns:
            Dictionary with summary, bullets, key_points, action_items
        """
        try:
            import anthropic
            client = anthropic.Anthropic()
        except ImportError:
            try:
                import openai
                return self._summarize_with_openai(text, style)
            except ImportError:
                # Fallback to simple regex-based summarization
                return self._simple_summarize(text, style)
        
        try:
            if style == 'detailed':
                prompt = f"""Provide a detailed summary of the following text. Include all major points and important details.

Text:
{text}

Return as JSON with: summary, key_points (array), topics (array)"""
            
            elif style == 'bullets':
                prompt = f"""Summarize the following text as bullet points. Be concise.

Text:
{text}

Return as JSON with: bullet_points (array of strings)"""
            
            else:  # mixed
                prompt = f"""Summarize the following podcast/audio transcript. Provide:
1. A short 2-3 sentence summary
2. Key points as bullet list
3. Action items mentioned
4. Main topics discussed

Text:
{text}

Return as JSON with: summary, bullet_points (array), action_items (array), topics (array)"""
            
            message = client.messages.create(
                model='claude-3-5-sonnet-20241022',
                max_tokens=1024,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            response_text = message.content[0].text
            
            # Try to parse as JSON
            try:
                # Find JSON in response
                start = response_text.find('{')
                end = response_text.rfind('}') + 1
                if start >= 0 and end > start:
                    json_str = response_text[start:end]
                    return json.loads(json_str)
            except:
                pass
            
            # Fallback to plain text
            return {'summary': response_text}
        
        except Exception as e:
            # Fallback to simple summarization
            return self._simple_summarize(text, style)
    
    def _summarize_with_openai(self, text: str, style: str) -> Dict[str, str]:
        """Summarize using OpenAI API"""
        import openai
        
        if style == 'detailed':
            prompt = f"Provide a detailed summary of this text:\n\n{text}"
        elif style == 'bullets':
            prompt = f"Summarize this text as bullet points:\n\n{text}"
        else:
            prompt = f"Summarize this podcast transcript including summary, key points, action items, and topics:\n\n{text}"
        
        response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=[{'role': 'user', 'content': prompt}],
            max_tokens=1024
        )
        
        return {'summary': response.choices[0].message.content}
    
    @staticmethod
    def _simple_summarize(text: str, style: str) -> Dict[str, str]:
        """Simple regex-based summarization as fallback"""
        sentences = text.split('. ')
        
        # Take first few sentences as summary
        summary_length = min(3, len(sentences))
        summary = '. '.join(sentences[:summary_length])
        
        result = {
            'summary': summary,
            'bullet_points': [s.strip() for s in sentences[:5]],
            'topics': ['Podcast', 'Audio'],
            'action_items': []
        }
        
        return result
    
    def process(self, tool_id: str, input_path: str, options: Dict[str, Any]) -> Dict[str, str]:
        """
        Process podcast summarization
        
        Args:
            tool_id: Tool identifier
            input_path: Input audio file path
            options: Processing options
        
        Returns:
            Dictionary with summary content
        """
        if tool_id not in self.SUMMARIZATION_TOOLS:
            raise ValueError(f'Unknown summarization tool: {tool_id}')
        
        summary_type = options.get('summaryType', 'mixed')
        
        # First, transcribe the audio
        try:
            transcript = self.transcription_engine.transcribe_audio(
                input_path,
                language='en',
                output_format='text'
            )
        except Exception as e:
            raise RuntimeError(f'Failed to transcribe audio: {str(e)}')
        
        # Chunk if too long
        if len(transcript.split()) > 2000:
            chunks = self.chunk_text(transcript, chunk_size=500)
            # Summarize first chunk as representative
            to_summarize = chunks[0]
            for chunk in chunks[1:3]:  # Use first 3 chunks
                to_summarize += '\n' + chunk
        else:
            to_summarize = transcript
        
        # Summarize
        summary_result = self.summarize_text(to_summarize, style=summary_type)
        
        # Format output
        output_lines = []
        
        if 'summary' in summary_result:
            output_lines.append('SUMMARY')
            output_lines.append('=' * 50)
            output_lines.append(summary_result['summary'])
            output_lines.append('')
        
        if 'bullet_points' in summary_result:
            output_lines.append('KEY POINTS')
            output_lines.append('=' * 50)
            for point in summary_result['bullet_points']:
                output_lines.append(f'• {point}')
            output_lines.append('')
        
        if 'action_items' in summary_result:
            output_lines.append('ACTION ITEMS')
            output_lines.append('=' * 50)
            for item in summary_result['action_items']:
                output_lines.append(f'→ {item}')
            output_lines.append('')
        
        if 'topics' in summary_result:
            output_lines.append('TOPICS COVERED')
            output_lines.append('=' * 50)
            output_lines.append(', '.join(summary_result['topics']))
        
        full_output = '\n'.join(output_lines)
        
        # Save to file
        base_dir = Path(input_path).parent
        output_filename = f'summary_{Path(input_path).stem}.txt'
        output_path = str(base_dir / output_filename)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(full_output)
        
        return {
            'outputPath': output_path,
            'outputType': '.txt',
            'content': full_output
        }


def main():
    """Entry point for summarization engine"""
    if len(sys.argv) < 3:
        print('Usage: python summarization.py <tool_id> <input_path> [options_json]', file=sys.stderr)
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
        engine = SummarizationEngine()
        result = engine.process(tool_id, input_path, options)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
