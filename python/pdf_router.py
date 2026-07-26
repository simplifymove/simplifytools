# -*- coding: utf-8 -*-
"""
PDF Tools Router
Routes PDF tool requests to appropriate engines
"""

import json
import os
import sys
from typing import Dict, Any
from pathlib import Path

# CRITICAL: Fix import order to use venv packages instead of broken system packages
# This must be done BEFORE any other imports to prevent 'frontend' ModuleNotFoundError
venv_packages = [
    '/var/www/simplifytools/.venv/lib/python3.12/site-packages',
    '/var/www/simplifytools/.venv/lib/python3.12/dist-packages',
    '/var/www/simplifytools/.venv/local/lib/python3.12/site-packages',
]

# Insert venv paths at the BEGINNING of sys.path
for venv_path in venv_packages:
    if os.path.exists(venv_path):
        sys.path.insert(0, venv_path)

# CRITICAL: Remove broken system paths from sys.path BEFORE they shadow venv packages
broken_system_paths = [
    '/usr/local/lib/python3.12/dist-packages',
    '/usr/lib/python3.12/dist-packages',
    '/usr/local/lib/python3/dist-packages',
    '/usr/lib/python3/dist-packages',
]

for broken_path in broken_system_paths:
    while broken_path in sys.path:
        sys.path.remove(broken_path)

print(f'[PDF Router] sys.path corrected. Venv packages loaded first.', file=sys.stderr)

# Add the python directory to the path so we can import engines
python_dir = os.path.dirname(os.path.abspath(__file__))
if python_dir not in sys.path:
    sys.path.insert(0, python_dir)

# Ensure system site-packages are accessible (for VPS deployment)
# This is crucial when running from subprocess that may not inherit PYTHONPATH
def _ensure_site_packages():
    """Aggressively ensure site-packages are in sys.path"""
    added_paths = []
    
    # Try site.getsitepackages() first
    try:
        import site
        for site_dir in site.getsitepackages():
            if site_dir not in sys.path:
                sys.path.insert(0, site_dir)
                added_paths.append(site_dir)
    except (AttributeError, TypeError):
        pass
    
    # Try sysconfig
    try:
        import sysconfig
        for scheme in ['posix_prefix', 'posix_venv', 'venv']:
            for path_name in ['purelib', 'platlib']:
                try:
                    sp = sysconfig.get_path(path_name, scheme)
                    if sp and os.path.exists(sp) and sp not in sys.path:
                        sys.path.insert(0, sp)
                        added_paths.append(sp)
                except:
                    pass
    except Exception:
        pass
    
    # Try common system locations on Linux/VPS
    common_paths = [
        # Python 3.12
        '/usr/local/lib/python3.12/site-packages',
        '/usr/lib/python3.12/site-packages',
        # Python 3.11
        '/usr/local/lib/python3.11/site-packages',
        '/usr/lib/python3.11/site-packages',
        # Python 3.10
        '/usr/local/lib/python3.10/site-packages',
        '/usr/lib/python3.10/site-packages',
        # Generic dist-packages (Debian/Ubuntu)
        '/usr/lib/python3/dist-packages',
        '/usr/local/lib/python3/dist-packages',
        # Site packages in common prefix locations
        '/opt/python/site-packages',
    ]
    
    for path in common_paths:
        if os.path.exists(path) and path not in sys.path:
            # Keep the virtual environment ahead of Ubuntu system packages.
            # Adding system paths at index 0 caused cffi/_cffi_backend mismatches.
            sys.path.append(path)
            added_paths.append(path)
    
    return added_paths

# Run the site-packages discovery
added_paths = _ensure_site_packages()
if added_paths:
    print(f'[PDF Router] Added {len(added_paths)} additional paths to sys.path', file=sys.stderr)

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
                'pdf-page-deleter': ('core', 'delete_pages'),
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
                'pdf-to-powerpoint': ('convert', 'pdf_to_pptx'),
                'powerpoint-to-pdf': ('convert', 'document_to_pdf'),
                'pdf-to-excel': ('convert', 'pdf_to_xlsx'),
                'pdf-to-csv': ('extract', 'extract_tables'),
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
            
            # Log before calling operation
            print(f"[PDF_ROUTER] Calling {engine_key}.{operation}", flush=True)
            print(f"[PDF_ROUTER] Input paths: {input_paths}", flush=True)
            print(f"[PDF_ROUTER] Output path: {output_path}", flush=True)
            print(f"[PDF_ROUTER] Options: {options}", flush=True)
            
            # Call the operation
            result = method(input_paths, output_path, options)
            
            print(f"[PDF_ROUTER] Operation completed. Result: {result}", flush=True)
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
    import logging
    
    # Set up logging to capture detailed errors
    log_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tmp', 'pdf_debug.log')
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler(sys.stdout)
        ]
    )
    logger = logging.getLogger('PdfRouter')
    
    # Wrap everything in try-except to catch any initialization errors
    try:
        logger.info(f"PDF Router started with {len(sys.argv)} arguments")
        logger.info(f"Arguments: {sys.argv}")
        logger.info(f"Working directory: {os.getcwd()}")
        
        if len(sys.argv) < 4:
            error_msg = f'Invalid arguments: expected at least 4 args, got {len(sys.argv)}. Args: {sys.argv}'
            logger.error(error_msg)
            print(json.dumps({'success': False, 'error': error_msg}), flush=True)
            sys.exit(1)
        
        tool_id = sys.argv[1]
        logger.info(f"Tool ID: {tool_id}")
        
        # Parse input paths
        try:
            input_paths = json.loads(sys.argv[2])
            logger.info(f"Input paths: {input_paths}")
        except json.JSONDecodeError as e:
            error_msg = f'Failed to parse input paths JSON: {str(e)}'
            logger.error(error_msg)
            print(json.dumps({'success': False, 'error': error_msg}), flush=True)
            sys.exit(1)
        
        output_path = sys.argv[3]
        logger.info(f"Output path: {output_path}")
        
        # Options can be passed as a JSON string (4th arg) or as a file path (4th arg is a file)
        options = {}
        if len(sys.argv) > 4:
            options_arg = sys.argv[4]
            # Check if it's a file path (exists as a file)
            if os.path.isfile(options_arg):
                # Read options from file
                try:
                    logger.info(f"Reading options from file: {options_arg}")
                    with open(options_arg, 'r') as f:
                        options = json.load(f)
                    logger.info(f"Options loaded from file")
                except Exception as e:
                    error_msg = f'Failed to read options file: {str(e)}'
                    logger.error(error_msg)
                    print(json.dumps({'success': False, 'error': error_msg}), flush=True)
                    sys.exit(1)
            else:
                # Parse as JSON string
                try:
                    logger.info("Parsing options as JSON string")
                    options = json.loads(options_arg)
                    logger.info(f"Options parsed from JSON")
                except json.JSONDecodeError as e:
                    error_msg = f'Invalid options JSON: {str(e)}'
                    logger.error(error_msg)
                    print(json.dumps({'success': False, 'error': error_msg}), flush=True)
                    sys.exit(1)
        
        logger.info(f"Starting PDF routing for tool: {tool_id}")
        
        # Add extra logging for annotate-pdf to debug coordinate issues
        if tool_id == 'annotate-pdf':
            annotations = options.get('annotations', [])
            logger.info(f"[ANNOTATE] Processing {len(annotations)} annotations")
            for idx, ann in enumerate(annotations):
                logger.info(f"[ANNOTATE] Annotation {idx}: type={ann.get('type')}, page={ann.get('page')}, x={ann.get('x')}, y={ann.get('y')}, width={ann.get('width')}, height={ann.get('height')}, color={ann.get('color')}")
        
        result = PdfRouter.process(tool_id, input_paths, output_path, options)
        logger.info(f"PDF processing completed successfully")
        print(json.dumps({'success': True, 'output': result}), flush=True)
    except Exception as e:
        error_msg = str(e)
        full_traceback = traceback.format_exc()
        combined_error = f"{error_msg}\n{full_traceback}"
        
        logger.error(f"Exception occurred: {combined_error}")
        
        # ALWAYS print the error as JSON as the last output
        # This is what the API expects to parse
        try:
            # Try to output JSON error
            json_error = json.dumps({'success': False, 'error': combined_error})
            print(json_error, flush=True)
        except (TypeError, UnicodeEncodeError) as json_err:
            # If JSON encoding fails, try with error replacement
            try:
                safe_error = combined_error.encode('utf-8', errors='replace').decode('utf-8')
                json_error = json.dumps({'success': False, 'error': safe_error})
                print(json_error, flush=True)
            except Exception:
                # Last resort: print raw error
                print(f"ERROR: {combined_error}", flush=True)
        
        logger.error(f"Exit code: 1")
        sys.exit(1)
