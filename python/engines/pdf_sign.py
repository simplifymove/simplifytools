# -*- coding: utf-8 -*-
"""
PDF Signature Engine
Handles e-signature functionality: applying signature images to PDFs
Uses PyPDF2 for image overlay (industry standard approach)
"""

from typing import Dict, Any, List
from pathlib import Path
import fitz  # PyMuPDF for basic PDF operations
import json
import base64
import io
from PIL import Image
import sys
import traceback


class PdfSignEngine:
    """PDF signature operations - applies signature images via PyMuPDF image overlay"""
    
    @staticmethod
    def apply_signatures(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Apply signature images to PDF using image overlay (industry standard)"""
        try:
            print("[PDF_SIGN] Starting signature application (image overlay mode)")
            print(f"[PDF_SIGN] Options keys: {list(options.keys())}")
            print(f"[PDF_SIGN] Options: {str(options)[:200]}")
            
            pdf_path = input_paths[0]
            signatures_json = options.get('signatures', '[]')
            
            print(f"[PDF_SIGN] PDF path: {pdf_path}")
            print(f"[PDF_SIGN] Output path: {output_path}")
            print(f"[PDF_SIGN] signatures_json type: {type(signatures_json)}")
            print(f"[PDF_SIGN] signatures_json length: {len(str(signatures_json))}")
            print(f"[PDF_SIGN] signatures_json first 100 chars: {str(signatures_json)[:100]}")
            
            # Parse signatures
            try:
                # Handle both string and already-parsed list
                if isinstance(signatures_json, list):
                    signatures = signatures_json
                    print(f"[PDF_SIGN] signatures_json is already a list")
                else:
                    signatures = json.loads(str(signatures_json))
                    
                print(f"[PDF_SIGN] Parsed {len(signatures)} signatures successfully")
                for idx, sig in enumerate(signatures):
                    print(f"[PDF_SIGN] Signature {idx}: type={sig.get('type')}, page={sig.get('page')}, imageData length={len(sig.get('imageData', ''))}")
            except json.JSONDecodeError as e:
                print(f"[PDF_SIGN] JSON parse error: {str(e)}", file=sys.stderr)
                raise Exception(f"Invalid signatures JSON: {str(e)}")
            except Exception as e:
                print(f"[PDF_SIGN] Error parsing signatures: {str(e)}", file=sys.stderr)
                raise
            
            if not signatures:
                print("[PDF_SIGN] WARNING: No signatures provided!")
                raise Exception("No signatures provided")
            
            # Open PDF
            print(f"[PDF_SIGN] Opening PDF: {pdf_path}")
            doc = fitz.open(pdf_path)
            print(f"[PDF_SIGN] PDF opened successfully, total pages: {len(doc)}")
            
            # Log page dimensions
            for i in range(min(3, len(doc))):
                page = doc[i]
                rect = page.rect
                print(f"[PDF_SIGN] Page {i+1} dimensions: {rect.width}x{rect.height}")
            
            signatures_applied = 0
            
            # Apply each signature (image overlay)
            for sig_idx, sig in enumerate(signatures):
                print(f"[PDF_SIGN] Processing signature {sig_idx + 1}/{len(signatures)}")
                
                try:
                    sig_type = sig.get('type')
                    page_param = sig.get('page')  
                    x = float(sig.get('x', 0))
                    y = float(sig.get('y', 0))
                    width = float(sig.get('width', 150))
                    height = float(sig.get('height', 75))
                    image_data_b64 = sig.get('imageData', '')
                    
                    print(f"[PDF_SIGN] Signature type: {sig_type}")
                    print(f"[PDF_SIGN] Page param: {page_param}, Position: ({x}, {y}), Size: {width}x{height}")
                    print(f"[PDF_SIGN] Image data length: {len(image_data_b64)} chars")
                    print(f"[PDF_SIGN] Image data prefix: {image_data_b64[:50] if image_data_b64 else 'EMPTY'}")
                    
                    if sig_type != 'image':
                        print(f"[PDF_SIGN] WARNING: Unsupported signature type: {sig_type}")
                        continue
                    
                    if not image_data_b64:
                        print(f"[PDF_SIGN] WARNING: Image data is empty!")
                        continue
                    
                    # Determine which pages to apply signature to
                    if page_param == 0 or page_param is None:
                        pages_to_sign = list(range(len(doc)))
                        print(f"[PDF_SIGN] Applying signature to all {len(doc)} pages")
                    else:
                        # page_param is 1-indexed (from frontend), convert to 0-indexed
                        page_num = page_param - 1 if page_param > 0 else 0
                        if page_num < 0 or page_num >= len(doc):
                            print(f"[PDF_SIGN] WARNING: Invalid page {page_param}, skipping")
                            continue
                        pages_to_sign = [page_num]
                        print(f"[PDF_SIGN] Applying signature to page {page_param} (0-indexed: {page_num})")
                    
                    # Overlay signature image on each selected page
                    for page_idx in pages_to_sign:
                        page = doc[page_idx]
                        print(f"[PDF_SIGN] Overlaying on page {page_idx + 1}")
                        try:
                            PdfSignEngine._overlay_signature_image(page, image_data_b64, x, y, width, height)
                            signatures_applied += 1
                            print(f"[PDF_SIGN] Successfully applied signature {signatures_applied} to page {page_idx + 1}")
                        except Exception as page_error:
                            print(f"[PDF_SIGN] ERROR overlaying signature on page {page_idx}: {str(page_error)}", file=sys.stderr)
                            print(f"[PDF_SIGN] {traceback.format_exc()}", file=sys.stderr)
                
                except Exception as sig_error:
                    print(f"[PDF_SIGN] ERROR processing signature {sig_idx + 1}: {str(sig_error)}", file=sys.stderr)
                    print(f"[PDF_SIGN] {traceback.format_exc()}", file=sys.stderr)
            
            print(f"[PDF_SIGN] Total signatures applied: {signatures_applied}")
            
            # Save PDF
            print(f"[PDF_SIGN] Saving signed PDF to: {output_path}")
            doc.save(output_path)
            doc.close()
            print(f"[PDF_SIGN] PDF saved and closed")
            
            # Verify file exists
            if Path(output_path).exists():
                file_size = Path(output_path).stat().st_size
                print(f"[PDF_SIGN] Signed PDF saved successfully, size: {file_size} bytes")
                if signatures_applied == 0:
                    print(f"[PDF_SIGN] WARNING: No signatures were actually applied! Check logs above.")
                return output_path
            else:
                raise Exception("Failed to save signed PDF")
                
        except Exception as e:
            error_msg = f"Failed to apply signatures: {str(e)}"
            print(f"[PDF_SIGN] ERROR: {error_msg}", file=sys.stderr)
            print(f"[PDF_SIGN] {traceback.format_exc()}", file=sys.stderr)
            raise Exception(error_msg)
    
    @staticmethod
    def _overlay_signature_image(page, image_data_b64: str, x: float, y: float, width: float, height: float):
        """Overlay a signature image on a PDF page"""
        try:
            print(f"[PDF_SIGN] [_overlay_signature_image] Starting image overlay at ({x}, {y}), size: {width}x{height}")
            
            # Decode base64 image
            try:
                print(f"[PDF_SIGN] [_overlay_signature_image] Base64 input length: {len(image_data_b64)}")
                print(f"[PDF_SIGN] [_overlay_signature_image] Base64 prefix (first 100 chars): {image_data_b64[:100]}")
                image_bytes = base64.b64decode(image_data_b64)
                print(f"[PDF_SIGN] [_overlay_signature_image] SUCCESS: Decoded {len(image_bytes)} bytes from base64")
                print(f"[PDF_SIGN] [_overlay_signature_image] Decoded bytes prefix: {str(image_bytes[:20])}")
            except Exception as decode_err:
                print(f"[PDF_SIGN] [_overlay_signature_image] FAILED to decode base64: {str(decode_err)}", file=sys.stderr)
                print(f"[PDF_SIGN] [_overlay_signature_image] Base64 length was: {len(image_data_b64)}", file=sys.stderr)
                print(f"[PDF_SIGN] [_overlay_signature_image] Base64 first 100 chars: {image_data_b64[:100]}", file=sys.stderr)
                raise Exception(f"Failed to decode signature image: {str(decode_err)}")
            
            # Load image with PIL to validate it
            try:
                img = Image.open(io.BytesIO(image_bytes))
                print(f"[PDF_SIGN] [_overlay_signature_image] PIL Image loaded successfully: format={img.format}, size={img.size}, mode={img.mode}")
            except Exception as img_err:
                print(f"[PDF_SIGN] [_overlay_signature_image] WARNING: Failed to load image with PIL: {str(img_err)}", file=sys.stderr)
                print(f"[PDF_SIGN] [_overlay_signature_image] Continuing anyway - image may still work with PyMuPDF")
            
            # Create rectangle for image placement
            rect = fitz.Rect(float(x), float(y), float(x + width), float(y + height))
            print(f"[PDF_SIGN] [_overlay_signature_image] Created rect for placement: {rect}")
            
            # Insert image onto page
            try:
                print(f"[PDF_SIGN] [_overlay_signature_image] Calling page.insert_image() with {len(image_bytes)} bytes")
                result = page.insert_image(rect, stream=image_bytes, keep_proportion=True)
                print(f"[PDF_SIGN] [_overlay_signature_image] SUCCESS: Image inserted, xref={result}")
            except Exception as insert_err:
                print(f"[PDF_SIGN] [_overlay_signature_image] FAILED to insert image: {str(insert_err)}", file=sys.stderr)
                print(f"[PDF_SIGN] [_overlay_signature_image] Rect: {rect}, Image size: {len(image_bytes)} bytes", file=sys.stderr)
                print(f"[PDF_SIGN] [_overlay_signature_image] Traceback: {traceback.format_exc()}", file=sys.stderr)
                raise Exception(f"Failed to insert signature image onto page: {str(insert_err)}")
            
            print(f"[PDF_SIGN] [_overlay_signature_image] Signature image overlaid successfully!")
            
        except Exception as e:
            print(f"[PDF_SIGN] [_overlay_signature_image] CRITICAL ERROR: {str(e)}", file=sys.stderr)
            print(f"[PDF_SIGN] {traceback.format_exc()}", file=sys.stderr)
            raise Exception(f"Failed to overlay signature image: {str(e)}")
