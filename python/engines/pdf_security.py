"""
PDF Security Engine
Handles protection: password protection, unlocking, watermark removal
"""

from typing import Dict, Any, List
import PyPDF2
import fitz  # PyMuPDF
import pikepdf
import tempfile
import os
import shutil
import sys
import platform
import PIL

# Debug: Print environment information at module load
print(f"[ENV] Python: {sys.version}")
print(f"[ENV] Platform: {platform.platform()}")
print(f"[ENV] PyMuPDF version: {fitz.version}")
print(f"[ENV] PyPDF2 version: {PyPDF2.__version__}")
print(f"[ENV] pikepdf version: {pikepdf.__version__}")
print(f"[ENV] Pillow version: {PIL.__version__}")
try:
    import numpy
    print(f"[ENV] NumPy version: {numpy.__version__}")
except ImportError:
    print("[ENV] NumPy: not installed")


class PdfSecurityEngine:
    """PDF security operations"""
    
    @staticmethod
    def protect(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Add password protection to PDF"""
        try:
            pdf_path = input_paths[0]
            user_password = options.get('userPassword', '')
            owner_password = options.get('ownerPassword', '')
            
            if not user_password and not owner_password:
                raise ValueError("At least one password must be provided")
            
            # Use PyPDF2 for encryption support
            pdf = PyPDF2.PdfReader(pdf_path)
            writer = PyPDF2.PdfWriter()
            
            # Copy all pages
            for page in pdf.pages:
                writer.add_page(page)
            
            # Add encryption
            writer.encrypt(
                user_password=user_password if user_password else None,
                owner_password=owner_password if owner_password else None,
                permissions_flag=-1  # Allow all permissions
            )
            
            # Save encrypted PDF
            with open(output_path, 'wb') as f:
                writer.write(f)
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to protect PDF: {str(e)}")
    
    @staticmethod
    def unlock(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Unlock password-protected PDF"""
        try:
            pdf_path = input_paths[0]
            password = options.get('password', '')
            
            pdf = PyPDF2.PdfReader(pdf_path)
            
            if pdf.is_encrypted:
                if not pdf.decrypt(password):
                    raise ValueError("Incorrect password or failed to decrypt")
            
            writer = PyPDF2.PdfWriter()
            for page in pdf.pages:
                writer.add_page(page)
            
            with open(output_path, 'wb') as f:
                writer.write(f)
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to unlock PDF: {str(e)}")
    
    @staticmethod
    def remove_watermark(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """
        Remove watermarks using configurable methods:
        
        Method: "text_rebuild" (DEFAULT)
        - Extracts all text spans and identifies watermarks
        - Paints over watermark areas, then rebuilds page with non-watermark content
        - Most accurate for table/document PDFs without hiding real content
        - May have minor font rendering differences between platforms
        
        Method: "rectangle_overlay"
        - Detects watermark by keyword/size/position
        - Covers watermark area with white rectangle overlay
        - ⚠️ WARNING: May hide real content behind watermark if overlapping
        - Use only if text_rebuild fails or for large isolated watermarks
        
        Usage: options={'method': 'text_rebuild'} or {'method': 'rectangle_overlay'}
        """
        try:
            pdf_path = input_paths[0]
            method = options.get('method', 'text_rebuild')  # Default to text_rebuild
            if method == 'all':
                method = 'text_rebuild'
            
            print(f"[PDF] ========== WATERMARK REMOVAL START ==========")
            print(f"[PDF] Input: {pdf_path}")
            print(f"[PDF] Method: {method}")
            print(f"[PDF] Platform: {platform.platform()}")
            print(f"[PDF] PyMuPDF: {fitz.version}")
            
            # Verify file exists and get info
            if not os.path.exists(pdf_path):
                raise FileNotFoundError(f"Input PDF not found: {pdf_path}")
            
            file_size = os.path.getsize(pdf_path)
            print(f"[PDF] File size: {file_size} bytes")
            
            # Route to appropriate method
            if method == 'rectangle_overlay':
                print(f"[PDF] ⚠️  WARNING: Using rectangle_overlay method")
                print(f"[PDF] ⚠️  This may hide real content behind watermark!")
                return PdfSecurityEngine._remove_watermark_rectangle_overlay(pdf_path, output_path, file_size)
            elif method == 'text_rebuild':
                return PdfSecurityEngine._remove_watermark_text_rebuild(pdf_path, output_path, file_size)
            else:
                raise ValueError(f"Unknown watermark removal method: {method}")
                
        except Exception as e:
            print(f"[PDF] ========== ERROR ==========")
            print(f"[PDF] {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Failed to remove watermark: {str(e)}")
    
    @staticmethod
    def _remove_watermark_text_rebuild(pdf_path: str, output_path: str, file_size: int) -> str:
        """
        Text rebuild method: Extract non-watermark text, rebuild page
        Default method - preserves document structure without hiding content
        """
        try:
            doc = fitz.open(pdf_path)
            print(f"[PDF] Opened PDF: {len(doc)} pages, Metadata: {doc.metadata}")
            
            # Step 1: Extract and identify watermark spans on all pages
            print(f"[PDF] ========== STEP 1: DETECTING WATERMARKS ==========")
            watermark_keywords = ["SAMPLE", "CONFIDENTIAL", "DRAFT", "WATERMARK", "INTERNAL", "PRIVATE", "COPY", "DUPLICATE"]
            all_page_data = {}  # Store all page data for later use
            total_watermarks = 0
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_rect = page.rect
                page_center = page_rect.tl + (page_rect.br - page_rect.tl) / 2
                
                text_dict = page.get_text("dict")
                watermark_spans = set()  # Indices of watermark spans
                span_data = []  # Store all spans with their properties
                span_idx = 0
                
                text_content = page.get_text("text")
                print(f"[PDF] Page {page_num}: size={page_rect.width}x{page_rect.height}, text_length={len(text_content)}, rotation={page.rotation}")
                
                for block in text_dict.get("blocks", []):
                    if block.get("type") != 0:  # Only text blocks
                        continue
                    
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            span_text = span.get("text", "").strip()
                            if not span_text:
                                span_idx += 1
                                continue
                            
                            # Watermark detection: keyword, size, or position
                            text_upper = span_text.upper()
                            font_size = span.get("size", 12)
                            bbox = fitz.Rect(span.get("bbox", [0, 0, 0, 0]))
                            
                            # Check: Is this watermark text?
                            is_keyword_watermark = any(keyword in text_upper for keyword in watermark_keywords)
                            is_large_text = font_size > 40
                            is_centered = (
                                bbox.x0 < page_center.x < bbox.x1 or
                                bbox.y0 < page_center.y < bbox.y1
                            )
                            
                            is_watermark = is_keyword_watermark or (is_large_text and is_centered)
                            
                            # Store span data
                            span_data.append({
                                'idx': span_idx,
                                'text': span_text,
                                'bbox': bbox,
                                'font': span.get("font", "helv"),
                                'size': font_size,
                                'color': span.get("color", 0),
                                'is_watermark': is_watermark
                            })
                            
                            if is_watermark:
                                watermark_spans.add(span_idx)
                                total_watermarks += 1
                                reason = "keyword" if is_keyword_watermark else "size+position"
                                print(f"[PDF]   Page {page_num}: WATERMARK DETECTED ({reason})")
                                print(f"[PDF]     Text: '{span_text[:60]}'")
                                print(f"[PDF]     Size: {font_size}pt")
                            
                            span_idx += 1
                
                all_page_data[page_num] = {
                    'text_dict': text_dict,
                    'watermark_spans': watermark_spans,
                    'span_data': span_data
                }
            
            # Check if any watermarks found
            if total_watermarks == 0:
                print(f"[PDF] ========== NO WATERMARKS DETECTED ==========")
                print(f"[PDF] Returning original PDF unchanged (fallback)")
                doc.close()
                shutil.copy(pdf_path, output_path)
                output_size = os.path.getsize(output_path)
                print(f"[PDF] Output saved (unchanged): {output_path} ({output_size} bytes)")
                return output_path
            
            # Step 2: Paint watermarks and re-paste non-watermark text
            print(f"[PDF] ========== STEP 2: REBUILDING PAGES ==========")
            print(f"[PDF] Total watermarks to remove: {total_watermarks}")
            
            text_restored = 0
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_data = all_page_data[page_num]
                watermarks_on_page = 0
                
                # Remove watermark spans by painting over them (white)
                for span_info in page_data['span_data']:
                    if span_info['is_watermark']:
                        bbox = span_info['bbox']
                        try:
                            # Draw white rectangle over watermark area
                            page.draw_rect(bbox, color=(1, 1, 1), fill=(1, 1, 1), width=0)
                            watermarks_on_page += 1
                        except Exception as e:
                            print(f"[PDF]   WARN: Could not paint watermark on page {page_num}: {e}")
                
                # Re-paste only non-watermark text
                text_on_page = 0
                for span_info in page_data['span_data']:
                    if not span_info['is_watermark']:
                        try:
                            # Handle color value
                            color_val = span_info['color']
                            if isinstance(color_val, int):
                                color = (0, 0, 0)
                            elif isinstance(color_val, (list, tuple)):
                                color = tuple(float(c) for c in color_val[:3]) if len(color_val) >= 3 else (0, 0, 0)
                            else:
                                color = (0, 0, 0)
                            
                            bbox = span_info['bbox']
                            # Use insert_text to place text at exact coordinates
                            page.insert_text(
                                point=(bbox.x0, bbox.y0 + span_info['size']),  # y0 + size for baseline
                                text=span_info['text'],
                                fontname=span_info['font'],
                                fontsize=span_info['size'],
                                color=color
                            )
                            text_on_page += 1
                            text_restored += 1
                        except Exception as e:
                            print(f"[PDF]   WARN: Could not re-paste text on page {page_num}: {e}")
                
                print(f"[PDF] Page {page_num}: Covered {watermarks_on_page} watermark(s), Restored {text_on_page} text span(s)")
            
            print(f"[PDF] Total text spans restored: {text_restored}")
            
            # Step 3: Save the cleaned PDF
            print(f"[PDF] ========== STEP 3: SAVING PDF ==========")
            doc.save(output_path, garbage=4, deflate=True)
            doc.close()
            
            # Verify output file
            if os.path.exists(output_path):
                output_size = os.path.getsize(output_path)
                print(f"[PDF] Output saved: {output_path}")
                print(f"[PDF] Output size: {output_size} bytes (input was {file_size} bytes)")
                size_diff = output_size - file_size
                print(f"[PDF] Size difference: {size_diff:+d} bytes ({abs(size_diff/file_size)*100:.1f}%)")
            else:
                raise Exception(f"Output file was not created: {output_path}")
            
            print(f"[PDF] ========== WATERMARK REMOVAL COMPLETE (text_rebuild) ==========")
            
            return output_path
            
        except Exception as e:
            print(f"[PDF] ERROR in text_rebuild: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    @staticmethod
    def _remove_watermark_rectangle_overlay(pdf_path: str, output_path: str, file_size: int) -> str:
        """
        Rectangle overlay method: Cover watermark with white rectangle
        ⚠️ WARNING: May hide real content behind watermark if overlapping
        """
        try:
            doc = fitz.open(pdf_path)
            print(f"[PDF] Opened PDF: {len(doc)} pages, Metadata: {doc.metadata}")
            
            # Step 1: Detect watermark areas on all pages
            print(f"[PDF] ========== STEP 1: DETECTING WATERMARKS ==========")
            watermark_keywords = ["SAMPLE", "CONFIDENTIAL", "DRAFT", "WATERMARK", "INTERNAL", "PRIVATE", "COPY", "DUPLICATE"]
            watermark_rects_found = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_rect = page.rect
                page_center = page_rect.tl + (page_rect.br - page_rect.tl) / 2
                
                text_content = page.get_text("text")
                print(f"[PDF] Page {page_num}: size={page_rect.width}x{page_rect.height}, text_length={len(text_content)}, rotation={page.rotation}")
                
                text_dict = page.get_text("dict")
                page_watermarks = []
                
                for block in text_dict.get("blocks", []):
                    if block.get("type") != 0:
                        continue
                    
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            span_text = span.get("text", "").strip()
                            if not span_text:
                                continue
                            
                            text_upper = span_text.upper()
                            font_size = span.get("size", 12)
                            bbox = fitz.Rect(span.get("bbox", [0, 0, 0, 0]))
                            
                            is_keyword_watermark = any(keyword in text_upper for keyword in watermark_keywords)
                            is_large_text = font_size > 40
                            is_centered = (
                                bbox.x0 < page_center.x < bbox.x1 or
                                bbox.y0 < page_center.y < bbox.y1
                            )
                            
                            is_watermark = is_keyword_watermark or (is_large_text and is_centered)
                            
                            if is_watermark:
                                expanded_bbox = bbox + 2
                                page_watermarks.append({
                                    'rect': expanded_bbox,
                                    'text': span_text[:40],
                                    'reason': "keyword" if is_keyword_watermark else "size+position"
                                })
                                
                                reason = "keyword" if is_keyword_watermark else "size+position"
                                print(f"[PDF]   Page {page_num}: WATERMARK DETECTED ({reason})")
                                print(f"[PDF]     Text: '{span_text[:60]}'")
                
                watermark_rects_found.extend([(page_num, w) for w in page_watermarks])
            
            # Step 2: If no watermarks detected, return original PDF
            if not watermark_rects_found:
                print(f"[PDF] ========== NO WATERMARKS DETECTED ==========")
                print(f"[PDF] Returning original PDF unchanged (fallback)")
                doc.close()
                shutil.copy(pdf_path, output_path)
                output_size = os.path.getsize(output_path)
                print(f"[PDF] Output saved (unchanged): {output_path} ({output_size} bytes)")
                return output_path
            
            # Step 3: Cover watermark areas with white rectangles
            print(f"[PDF] ========== STEP 2: COVERING WATERMARKS ==========")
            print(f"[PDF] Total watermark areas to cover: {len(watermark_rects_found)}")
            
            covering_errors = 0
            for page_num, watermark_info in watermark_rects_found:
                page = doc[page_num]
                rect = watermark_info['rect']
                
                try:
                    page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1), width=0, overlay=True)
                    print(f"[PDF]   Page {page_num}: Covered '{watermark_info['text']}'")
                except Exception as e:
                    covering_errors += 1
                    print(f"[PDF]   ERROR on page {page_num}: {e}")
            
            print(f"[PDF] Watermarks covered: {len(watermark_rects_found) - covering_errors}/{len(watermark_rects_found)}")
            
            # Step 4: Save the cleaned PDF
            print(f"[PDF] ========== STEP 3: SAVING PDF ==========")
            doc.save(output_path, garbage=4, deflate=True)
            doc.close()
            
            # Verify output file
            if os.path.exists(output_path):
                output_size = os.path.getsize(output_path)
                print(f"[PDF] Output saved: {output_path}")
                print(f"[PDF] Output size: {output_size} bytes (input was {file_size} bytes)")
                size_diff = output_size - file_size
                print(f"[PDF] Size difference: {size_diff:+d} bytes ({abs(size_diff/file_size)*100:.1f}%)")
            else:
                raise Exception(f"Output file was not created: {output_path}")
            
            print(f"[PDF] ========== WATERMARK REMOVAL COMPLETE (rectangle_overlay) ==========")
            
            return output_path
            
        except Exception as e:
            print(f"[PDF] ERROR in rectangle_overlay: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
