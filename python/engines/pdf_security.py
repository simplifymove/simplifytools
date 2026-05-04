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
        Remove watermarks by:
        1. Extract all text spans and identify watermarks (by keyword, size, position)
        2. Paint white over watermark areas
        3. Re-paste only non-watermark text
        """
        try:
            pdf_path = input_paths[0]
            print(f"[OK] Watermark removal started")
            print(f"  Input: {pdf_path}")
            
            doc = fitz.open(pdf_path)
            
            # Step 1: Extract and identify watermark spans on all pages
            print(f"[OK] Step 1: Extracting text and identifying watermarks...")
            watermark_keywords = ["SAMPLE", "CONFIDENTIAL", "DRAFT", "WATERMARK", "INTERNAL", "PRIVATE", "COPY", "DUPLICATE"]
            all_page_data = {}  # Store all page data for later use
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_rect = page.rect
                page_center = page_rect.tl + (page_rect.br - page_rect.tl) / 2
                
                text_dict = page.get_text("dict")
                watermark_spans = set()  # Indices of watermark spans
                span_data = []  # Store all spans with their properties
                span_idx = 0
                
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
                            
                            # Check: Is this large text (>40pt is suspicious)?
                            is_large_text = font_size > 40
                            
                            # Check: Is this centered on the page?
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
                                reason = "keyword" if is_keyword_watermark else "size+position"
                                print(f"[OK] Watermark detected on page {page_num}: '{span_text[:40]}' ({reason})")
                            
                            span_idx += 1
                
                all_page_data[page_num] = {
                    'text_dict': text_dict,
                    'watermark_spans': watermark_spans,
                    'span_data': span_data
                }
            
            # Step 2: Paint entire page white, then re-paste only non-watermark text
            print(f"[OK] Step 2: Painting entire pages white and re-pasting non-watermark text...")
            text_restored = 0
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_data = all_page_data[page_num]
                
                # Paint entire page white
                page_rect = page.rect
                try:
                    page.draw_rect(page_rect, color=None, fill=(1, 1, 1), width=0)
                    print(f"[OK] Painted page {page_num} white")
                except Exception as e:
                    print(f"[WARN] Could not paint page {page_num}: {e}")
                
                # Re-paste only non-watermark text
                for span_info in page_data['span_data']:
                    if not span_info['is_watermark']:
                        try:
                            # Handle color value
                            color_val = span_info['color']
                            if isinstance(color_val, int):
                                color = (0, 0, 0)
                            elif isinstance(color_val, (list, tuple)):
                                color = tuple(color_val[:3]) if len(color_val) >= 3 else (0, 0, 0)
                            else:
                                color = (0, 0, 0)
                            
                            bbox = span_info['bbox']
                            page.insert_text(
                                point=(bbox.x0, bbox.y0),
                                text=span_info['text'],
                                fontname=span_info['font'],
                                fontsize=span_info['size'],
                                color=color
                            )
                            text_restored += 1
                        except Exception as e:
                            pass
            
            print(f"[OK] Restored {text_restored} non-watermark text spans")
            
            # Step 4: Save the cleaned PDF
            print(f"[OK] Step 4: Saving cleaned PDF...")
            doc.save(output_path, garbage=4, deflate=True)
            doc.close()
            
            print(f"[OK] Output saved to: {output_path}")
            print(f"[OK] Watermark removal complete!")
            
            return output_path
            
        except Exception as e:
            print(f"ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Failed to remove watermark: {str(e)}")
