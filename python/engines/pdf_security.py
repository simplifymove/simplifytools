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
        1. Detect watermark areas (by keyword, size, position)
        2. Draw white rectangles over them using page.draw_rect()
        3. Keep all original content intact - only cover watermark areas
        4. Fallback: if no watermark detected, return original PDF
        
        This approach avoids font rendering inconsistencies between Windows and Linux
        by not re-extracting and re-inserting text.
        """
        try:
            pdf_path = input_paths[0]
            print(f"[PDF] Watermark removal started")
            print(f"[PDF] Input: {pdf_path}")
            
            doc = fitz.open(pdf_path)
            watermark_rects_found = []
            
            # Step 1: Detect watermark areas on all pages
            print(f"[PDF] Step 1: Detecting watermarks...")
            watermark_keywords = ["SAMPLE", "CONFIDENTIAL", "DRAFT", "WATERMARK", "INTERNAL", "PRIVATE", "COPY", "DUPLICATE"]
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_rect = page.rect
                page_center = page_rect.tl + (page_rect.br - page_rect.tl) / 2
                
                # Debug: log text length on this page
                text_content = page.get_text("text")
                print(f"[PDF] text length: {len(text_content)}")
                
                text_dict = page.get_text("dict")
                page_watermarks = []
                
                for block in text_dict.get("blocks", []):
                    if block.get("type") != 0:  # Only text blocks
                        continue
                    
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            span_text = span.get("text", "").strip()
                            if not span_text:
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
                            
                            if is_watermark:
                                # Expand bbox slightly to ensure complete coverage
                                expanded_bbox = bbox.get_area() + 2
                                page_watermarks.append({
                                    'rect': expanded_bbox,
                                    'text': span_text[:40],
                                    'reason': "keyword" if is_keyword_watermark else "size+position"
                                })
                                
                                reason = "keyword" if is_keyword_watermark else "size+position"
                                print(f"[PDF] Watermark detected on page {page_num}: '{span_text[:40]}' ({reason})")
                
                watermark_rects_found.extend([(page_num, w) for w in page_watermarks])
            
            # Step 2: If no watermarks detected, return original PDF
            if not watermark_rects_found:
                print(f"[PDF] No watermarks detected - returning original PDF")
                doc.close()
                shutil.copy(pdf_path, output_path)
                print(f"[PDF] Output saved (unchanged): {output_path}")
                return output_path
            
            # Step 3: Cover watermark areas with white rectangles
            print(f"[PDF] Step 2: Covering {len(watermark_rects_found)} watermark area(s)...")
            for page_num, watermark_info in watermark_rects_found:
                page = doc[page_num]
                rect = watermark_info['rect']
                
                try:
                    # Draw white rectangle with overlay to cover the watermark
                    # color=(1,1,1) is white, fill=(1,1,1) is white fill, overlay=True ensures it's on top
                    page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1), width=0, overlay=True)
                    print(f"[PDF] Covered watermark on page {page_num}: {watermark_info['text']}")
                except Exception as e:
                    print(f"[PDF] WARN: Could not cover watermark on page {page_num}: {e}")
            
            # Step 4: Save the cleaned PDF
            print(f"[PDF] Step 3: Saving cleaned PDF...")
            doc.save(output_path, garbage=4, deflate=True)
            doc.close()
            
            print(f"[PDF] Output saved to: {output_path}")
            print(f"[PDF] Watermark removal complete!")
            
            return output_path
            
        except Exception as e:
            print(f"[PDF] ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Failed to remove watermark: {str(e)}")
