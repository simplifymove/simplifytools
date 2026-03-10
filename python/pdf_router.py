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


class PdfRouter:
    """Routes PDF operations to appropriate engines"""
    
    ENGINES = {
        'core': PdfCoreEngine,
        'convert': PdfConvertEngine,
        'edit': PdfEditEngine,
        'security': PdfSecurityEngine,
        'extract': PdfExtractEngine,
        'ocr_translate': PdfOCRTranslateEngine,
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
                'esign-pdf': ('edit', 'add_signature'),
                
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
            raise Exception(f"PDF processing failed: {str(e)}")


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 4:
        print(json.dumps({'error': 'Invalid arguments'}))
        sys.exit(1)
    
    tool_id = sys.argv[1]
    input_paths = json.loads(sys.argv[2])
    output_path = sys.argv[3]
    options = json.loads(sys.argv[4]) if len(sys.argv) > 4 else {}
    
    try:
        result = PdfRouter.process(tool_id, input_paths, output_path, options)
        print(json.dumps({'success': True, 'output': result}))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)
