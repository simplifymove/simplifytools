# -*- coding: utf-8 -*-
"""
PDF Tools Router
Routes PDF tool requests to appropriate engines
"""

import json
import os
from typing import Dict, Any
from pathlib import Path

# Import all engines
from engines.pdf_core import PdfCoreEngine
from engines.pdf_convert import PdfConvertEngine
from engines.pdf_edit import PdfEditEngine
from engines.pdf_security import PdfSecurityEngine
from engines.pdf_extract import PdfExtractEngine
from engines.pdf_ocr_translate import PdfOCRTranslateEngine
from engines.pdf_sign import PdfSignEngine


class PdfRouter:
    """Routes PDF operations to appropriate engines"""
    
    ENGINES = {
        'core': PdfCoreEngine,
        'convert': PdfConvertEngine,
        'edit': PdfEditEngine,
        'security': PdfSecurityEngine,
        'extract': PdfExtractEngine,
        'ocr_translate': PdfOCRTranslateEngine,
        'sign': PdfSignEngine,
    }
    
    @staticmethod
    def process(tool_id: str, input_paths: list, output_path: str, options: Dict[str, Any]) -> str:
        """
        Process PDF tool request
        
        Args:
            tool_id: Tool identifier (e.g., 'merge-pdf')
            input_paths: List of input file paths
            output_path: Output file path
            options: Tool-specific options
            
        Returns:
            Output file path
        """
        try:
            # Map tools to engines and operations
            tool_operations = {
                # Core operations
                'merge-pdf': ('core', 'merge'),
                'split-pdf': ('core', 'split'),
                'rotate-pdf': ('core', 'rotate'),
                'rearrange-pdf': ('core', 'rearrange'),
                'crop-pdf': ('core', 'crop'),
                'pdf-page-deletor': ('core', 'delete_pages'),
                'create-pdf': ('core', 'create'),
                
                # Convert operations
                'pdf-to-jpg': ('convert', 'pdf_to_image'),
                'pdf-to-png': ('convert', 'pdf_to_image'),
                'pdf-to-tiff': ('convert', 'pdf_to_image'),
                'jpg-to-pdf': ('convert', 'image_to_pdf'),
                'png-to-pdf': ('convert', 'image_to_pdf'),
                'tiff-to-pdf': ('convert', 'image_to_pdf'),
                'webp-to-pdf': ('convert', 'image_to_pdf'),
                'gif-to-pdf': ('convert', 'image_to_pdf'),
                'heic-to-pdf': ('convert', 'image_to_pdf'),
                'eps-to-pdf': ('convert', 'image_to_pdf'),
                'images-to-pdf': ('convert', 'image_to_pdf'),
                'pdf-to-word': ('convert', 'pdf_to_document'),
                'word-to-pdf': ('convert', 'document_to_pdf'),
                'pdf-to-powerpoint': ('convert', 'pdf_to_document'),
                'powerpoint-to-pdf': ('convert', 'document_to_pdf'),
                'pdf-to-excel': ('convert', 'pdf_to_document'),
                'pdf-to-csv': ('convert', 'pdf_to_document'),
                'pdf-to-text': ('convert', 'pdf_to_text'),
                'pdf-to-epub': ('convert', 'pdf_to_ebook'),
                'pdf-to-mobi': ('convert', 'pdf_to_ebook'),
                'pdf-to-azw3': ('convert', 'pdf_to_ebook'),
                'epub-to-pdf': ('convert', 'ebook_to_pdf'),
                'mobi-to-pdf': ('convert', 'ebook_to_pdf'),
                'azw3-to-pdf': ('convert', 'ebook_to_pdf'),
                'url-to-pdf': ('convert', 'url_to_pdf'),
                'ms-outlook-to-pdf': ('convert', 'outlook_to_pdf'),
                
                # Edit operations
                'edit-pdf': ('edit', 'edit'),
                'add-text': ('edit', 'add_text'),
                'add-watermark': ('edit', 'add_watermark'),
                'add-numbers-to-pdf': ('edit', 'add_page_numbers'),
                'annotate-pdf': ('edit', 'annotate'),
                'esign-pdf': ('sign', 'apply_signatures'),
                
                # Security operations
                'protect-pdf': ('security', 'protect'),
                'unlock-pdf': ('security', 'unlock'),
                'pdf-watermark-remover': ('security', 'remove_watermark'),
                
                # Extract operations
                'extract-text-from-pdf': ('extract', 'extract_text'),
                'extract-images-pdf': ('extract', 'extract_images'),
                'extract-tables-from-pdf': ('extract', 'extract_tables'),
                
                # Phase 5: Document conversion operations
                'pdf-to-docx': ('convert', 'pdf_to_docx'),
                'pdf-to-pptx': ('convert', 'pdf_to_pptx'),
                'pdf-to-xlsx': ('convert', 'pdf_to_xlsx'),
                'pdf-to-html': ('convert', 'pdf_to_html'),
                'pdf-to-rtf': ('convert', 'pdf_to_rtf'),
                
                # Phase 6: Advanced operations
                'pdf-ocr': ('ocr_translate', 'ocr_pdf'),
                'pdf-deskew': ('ocr_translate', 'deskew_pdf'),
                'pdf-enhance-scan': ('ocr_translate', 'enhance_scanned_pdf'),
                
                # OCR/Translate operations
                'pdf-translator': ('ocr_translate', 'translate'),
                'compress-pdf': ('core', 'compress'),
            }
            
            if tool_id not in tool_operations:
                raise ValueError(f"Unknown tool: {tool_id}")
            
            engine_key, operation = tool_operations[tool_id]
            engine_class = PdfRouter.ENGINES[engine_key]
            
            # Create engine instance and execute operation
            engine = engine_class()
            method = getattr(engine, operation, None)
            
            if not method:
                raise ValueError(f"Operation {operation} not found in {engine_key} engine")
            
            # Auto-set format for PDF image conversions
            if operation == 'pdf_to_image':
                if 'pdf-to-jpg' in tool_id:
                    options['format'] = 'jpg'
                elif 'pdf-to-png' in tool_id:
                    options['format'] = 'png'
                elif 'pdf-to-tiff' in tool_id:
                    options['format'] = 'tiff'
            
            # Auto-set format for document conversions
            if operation in ['pdf_to_docx', 'pdf_to_pptx', 'pdf_to_xlsx', 'pdf_to_html', 'pdf_to_rtf']:
                if 'docx' in tool_id:
                    options['format'] = 'docx'
                elif 'pptx' in tool_id:
                    options['format'] = 'pptx'
                elif 'xlsx' in tool_id:
                    options['format'] = 'xlsx'
                elif 'html' in tool_id:
                    options['format'] = 'html'
                elif 'rtf' in tool_id:
                    options['format'] = 'rtf'
            
            # Call the operation
            result = method(input_paths, output_path, options)
            return result
            
        except Exception as e:
            import traceback
            full_traceback = traceback.format_exc()
            error_msg = f"PDF processing failed: {str(e)}\n{full_traceback}"
            
            # Safely print error with encoding fallback
            try:
                print(f"[ERROR] {error_msg}", flush=True)
            except UnicodeEncodeError:
                safe_msg = error_msg.encode('utf-8', errors='replace').decode('utf-8')
                print(f"[ERROR] {safe_msg}", flush=True)
            
            raise Exception(error_msg)


if __name__ == '__main__':
    import sys
    import traceback
    import os
    
    if len(sys.argv) < 4:
        print(json.dumps({'error': 'Invalid arguments'}))
        sys.exit(1)
    
    tool_id = sys.argv[1]
    input_paths = json.loads(sys.argv[2])
    output_path = sys.argv[3]
    
    # Options can be passed as a JSON string (4th arg) or as a file path (4th arg is a file)
    options = {}
    if len(sys.argv) > 4:
        options_arg = sys.argv[4]
        # Check if it's a file path (exists as a file)
        if os.path.isfile(options_arg):
            # Read options from file
            try:
                with open(options_arg, 'r') as f:
                    options = json.load(f)
            except Exception as e:
                print(json.dumps({'error': f'Failed to read options file: {str(e)}'}))
                sys.exit(1)
        else:
            # Parse as JSON string
            try:
                options = json.loads(options_arg)
            except json.JSONDecodeError as e:
                print(json.dumps({'error': f'Invalid options JSON: {str(e)}'}))
                sys.exit(1)
    
    try:
        result = PdfRouter.process(tool_id, input_paths, output_path, options)
        print(json.dumps({'success': True, 'output': result}), flush=True)
    except Exception as e:
        error_msg = str(e)
        full_traceback = traceback.format_exc()
        combined_error = f"{error_msg}\n{full_traceback}"
        
        # Safely print errors with encoding fallback
        try:
            print(combined_error, flush=True)
        except UnicodeEncodeError:
            # Fallback: encode to ASCII with errors replaced
            print(combined_error.encode('utf-8', errors='replace').decode('utf-8'), flush=True)
        
        try:
            print(json.dumps({'error': combined_error}), flush=True)
        except (UnicodeEncodeError, UnicodeDecodeError):
            # Fallback: encode errors safely
            safe_error = combined_error.encode('utf-8', errors='replace').decode('utf-8')
            print(json.dumps({'error': safe_error}), flush=True)
        
        sys.exit(1)
