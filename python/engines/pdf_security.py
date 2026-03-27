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
        """Remove watermarks by: 1) Extract text, 2) Paint watermark area, 3) Re-render text"""
        try:
            pdf_path = input_paths[0]
            print(f"[OK] Watermark removal started (text extraction + white-out method)")
            print(f"  Input: {pdf_path}")
            
            # Step 1: Open PDF and extract text with positions
            print(f"[OK] Step 1: Extracting text and positions...")
            doc = fitz.open(pdf_path)
            text_data = {}  # Store text for each page
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                text_dict = page.get_text("dict")
                text_data[page_num] = text_dict
                print(f"[OK] Extracted text from page {page_num}")
            
            # Step 2: Convert to image to detect watermark
            print(f"[OK] Step 2: Rendering pages to detect watermark...")
            watermark_areas = {}  # Store detected watermark rectangles per page
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Render page to image with high DPI to see watermark clearly
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)  # 2x zoom
                img_array = pix.samples
                
                # Simple watermark detection: find very light gray areas (typical watermark color)
                # Watermarks are usually RGB around (200-240, 200-240, 200-240) for light gray
                height = pix.height
                width = pix.width
                n = pix.n  # number of components (3 for RGB)
                
                # Analyze pixels to find watermark region
                watermark_pixels = []
                for y in range(height):
                    for x in range(width):
                        idx = (y * width + x) * n
                        if idx + 2 < len(img_array):
                            r = img_array[idx]
                            g = img_array[idx + 1]
                            b = img_array[idx + 2]
                            
                            # Light gray color = watermark
                            avg_color = (r + g + b) // 3
                            if avg_color > 180 and avg_color < 240:  # Light but not white
                                # Check if it's grayish (R≈G≈B)
                                if abs(r - g) < 20 and abs(g - b) < 20 and abs(r - b) < 20:
                                    watermark_pixels.append((x, y))
                
                # Find bounding box of watermark pixels
                if watermark_pixels:
                    xs = [p[0] for p in watermark_pixels]
                    ys = [p[1] for p in watermark_pixels]
                    min_x, max_x = min(xs), max(xs)
                    min_y, max_y = min(ys), max(ys)
                    
                    # Convert from image coordinates (2x zoom) back to PDF coordinates
                    min_x /= 2
                    max_x /= 2
                    min_y /= 2
                    max_y /= 2
                    
                    watermark_areas[page_num] = {
                        'rect': (min_x, min_y, max_x, max_y),
                        'pixel_count': len(watermark_pixels)
                    }
                    print(f"[OK] Detected watermark on page {page_num}: {len(watermark_pixels)} pixels")
            
            # Step 3: Paint over watermark areas
            print(f"[OK] Step 3: Painting white over watermark areas...")
            for page_num in watermark_areas:
                page = doc[page_num]
                rect = watermark_areas[page_num]['rect']
                
                # Paint white rectangle over watermark
                try:
                    page.draw_rect(rect, color=None, fill=(1, 1, 1), width=0)
                    print(f"[OK] Painted white over watermark on page {page_num}")
                except Exception as e:
                    print(f"[WARN] Could not paint on page {page_num}: {e}")
            
            # Step 4: Re-render text where watermark was (to restore covered text)
            print(f"[OK] Step 4: Restoring text from underlying content...")
            for page_num in text_data:
                page = doc[page_num]
                text_dict = text_data[page_num]
                
                # Check if this page has a watermark
                has_watermark = page_num in watermark_areas
                
                if has_watermark:
                    # Restore legitimate text that was in watermark area
                    # But filter out actual watermark text
                    watermark_keywords = ['watermark', 'confidential', 'draft', 'internal', 'private', 'sample', 'copy', 'duplicate']
                    
                    watermark_rect = watermark_areas[page_num]['rect']
                    wx0, wy0, wx1, wy1 = watermark_rect
                    
                    for block in text_dict.get("blocks", []):
                        if block.get("type") == 0:  # Text block
                            try:
                                bbox = block.get("bbox")
                                if bbox:
                                    bx0, by0, bx1, by1 = bbox
                                    
                                    # Check if text overlaps with watermark area
                                    overlaps = not (bx1 < wx0 or bx0 > wx1 or by1 < wy0 or by0 > wy1)
                                    
                                    if overlaps:
                                        for line in block.get("lines", []):
                                            for span in line.get("spans", []):
                                                text = span.get("text", "").strip()
                                                if not text:
                                                    continue
                                                
                                                # CRITICAL: Skip if this looks like watermark text
                                                text_lower = text.lower()
                                                is_watermark = any(keyword in text_lower for keyword in watermark_keywords)
                                                
                                                if is_watermark:
                                                    print(f"[SKIP] Skipping watermark text: '{text[:40]}'")
                                                    continue
                                                
                                                # Restore legitimate content
                                                try:
                                                    font_name = span.get("font", "helv")
                                                    font_size = span.get("size", 12)
                                                    color_val = span.get("color", 0)
                                                    color = (0, 0, 0) if isinstance(color_val, int) else color_val
                                                    
                                                    bbox_line = line.get("bbox", bbox)
                                                    x, y = bbox_line[0], bbox_line[1]
                                                    
                                                    page.insert_text(
                                                        point=(x, y),
                                                        text=text,
                                                        fontname=font_name,
                                                        fontsize=font_size,
                                                        color=color
                                                    )
                                                    print(f"[OK] Restored text: '{text[:40]}'")
                                                except Exception as e:
                                                    pass
                            except Exception as text_err:
                                pass
            
            # Step 5: Save the cleaned PDF
            print(f"[OK] Step 5: Saving cleaned PDF...")
            doc.save(output_path, garbage=4, deflate=True)
            doc.close()
            print(f"[OK] PDF saved successfully")
            
            print(f"[OK] Output saved to: {output_path}")
            print(f"[OK] Watermark removal complete!")
            
            return output_path
            
        except Exception as e:
            print(f"ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Failed to remove watermark: {str(e)}")
