"""
PDF Edit Engine
Handles adding content: text, watermarks, page numbers, annotations, signatures
"""

from typing import Dict, Any, List
import fitz  # PyMuPDF
from PIL import Image, ImageDraw, ImageFont
from io import BytesIO


class PdfEditEngine:
    """PDF editing operations"""
    
    @staticmethod
    def add_text(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Add text to PDF"""
        try:
            pdf_path = input_paths[0]
            text = options.get('text', '')
            # Frontend sends 1-indexed page numbers, PyMuPDF uses 0-indexed
            page_num = int(options.get('pageNumber', 1)) - 1
            x = float(options.get('x', 50))
            y = float(options.get('y', 50))
            font_size = float(options.get('fontSize', 12))
            
            # Parse color from string format "R,G,B" or use default
            color_str = options.get('color', '0,0,0')
            try:
                if isinstance(color_str, str):
                    color_parts = [int(c.strip()) for c in color_str.split(',') if c.strip()]
                    if len(color_parts) == 3:
                        color = tuple(c/255.0 for c in color_parts)
                    else:
                        color = (0, 0, 0)
                else:
                    color = (0, 0, 0)
            except:
                color = (0, 0, 0)
            
            doc = fitz.open(pdf_path)
            page = doc[page_num]
            
            # Add text
            page.insert_text(
                (x, y),
                text,
                fontsize=font_size,
                color=color
            )
            
            doc.save(output_path)
            doc.close()
            return output_path
        except Exception as e:
            raise Exception(f"Failed to add text: {str(e)}")
    
    @staticmethod
    def add_watermark(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Add watermark to PDF with rotation and size support"""
        try:
            from PIL import Image, ImageDraw, ImageFont
            import tempfile
            import os
            
            pdf_path = input_paths[0]
            watermark_text = options.get('text', 'WATERMARK')
            opacity = float(options.get('opacity', 0.3))
            rotation = float(options.get('rotation', -45))  # Default -45 degrees
            font_size = int(options.get('fontSize', 300))  # Default 300pt
            pages = options.get('pageRange', 'all')
            
            doc = fitz.open(pdf_path)
            
            if pages == 'all':
                pages_list = list(range(len(doc)))
            else:
                pages_list = []
                for part in pages.split(','):
                    if '-' in part:
                        start, end = map(int, part.split('-'))
                        pages_list.extend(range(start-1, end))
                    else:
                        pages_list.append(int(part)-1)
            
            for page_num in pages_list:
                page = doc[page_num]
                rect = page.rect
                
                # Create large canvas for high-quality rendering with padding
                canvas_size = font_size * 5
                # Add padding to prevent edge clipping after rotation
                padded_size = int(canvas_size * 1.5)
                watermark_img = Image.new('RGBA', (padded_size, padded_size), (255, 255, 255, 0))
                draw = ImageDraw.Draw(watermark_img)
                
                # Use DARK gray (100,100,100) - opacity will be applied separately for transparency
                text_color = (100, 100, 100, 255)
                
                # Try to load a proper font, fallback to default
                try:
                    # Try to use Windows system font
                    font_paths = [
                        'C:\\Windows\\Fonts\\arial.ttf',
                        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
                        '/System/Library/Fonts/Arial.ttf'
                    ]
                    font = None
                    for font_path in font_paths:
                        if os.path.exists(font_path):
                            font = ImageFont.truetype(font_path, font_size)
                            break
                    if font is None:
                        font = ImageFont.load_default()
                except:
                    font = ImageFont.load_default()
                
                # Get text bounding box
                bbox = draw.textbbox((0, 0), watermark_text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                
                # Center text on canvas (with padding offset)
                offset = int(padded_size / 4)
                text_x = offset + (canvas_size - text_width) / 2
                text_y = offset + (canvas_size - text_height) / 2
                
                # Draw the text with full opacity initially
                draw.text((text_x, text_y), watermark_text, fill=text_color, font=font)
                
                # Now apply opacity by reducing alpha channel
                import numpy as np
                watermark_array = np.array(watermark_img)
                
                # Apply opacity to alpha channel
                if len(watermark_array.shape) == 3 and watermark_array.shape[2] == 4:  # RGBA
                    # Get the alpha channel
                    alpha_channel = watermark_array[:, :, 3].astype(float)
                    # Apply opacity factor - this controls transparency
                    # opacity=0.5 means alpha will be 50% of original (50% transparent)
                    alpha_channel = (alpha_channel * opacity).astype(np.uint8)
                    watermark_array[:, :, 3] = alpha_channel
                    watermark_img = Image.fromarray(watermark_array, 'RGBA')
                
                # Rotate the watermark image for better quality
                watermark_rotated = watermark_img.rotate(rotation, expand=True, resample=Image.Resampling.BICUBIC)
                
                # Save to temporary file and insert into PDF
                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp:
                    temp_path = tmp.name
                    watermark_rotated.save(temp_path, 'PNG')
                
                try:
                    # Calculate position: center of page
                    # Don't scale too much to prevent clipping
                    target_width = rect.width * 0.55  # Slightly smaller to prevent edge clipping
                    scale_factor = target_width / watermark_rotated.width
                    
                    scaled_width = watermark_rotated.width * scale_factor
                    scaled_height = watermark_rotated.height * scale_factor
                    
                    pix_rect = fitz.Rect(
                        (rect.width - scaled_width) / 2,
                        (rect.height - scaled_height) / 2,
                        (rect.width + scaled_width) / 2,
                        (rect.height + scaled_height) / 2
                    )
                    
                    # Insert the watermark image from file
                    page.insert_image(pix_rect, filename=temp_path)
                finally:
                    # Clean up temporary file
                    try:
                        os.remove(temp_path)
                    except:
                        pass
            
            doc.save(output_path)
            doc.close()
            return output_path
        except Exception as e:
            raise Exception(f"Failed to add watermark: {str(e)}")
    
    @staticmethod
    def add_page_numbers(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Add page numbers to PDF"""
        try:
            pdf_path = input_paths[0]
            position = options.get('position', 'bottom-right')  # bottom-right, bottom-center, etc.
            font_size = float(options.get('fontSize', 12))
            pages = options.get('pageRange', 'all')
            start_num = int(options.get('startNumber', 1))
            
            doc = fitz.open(pdf_path)
            
            if pages == 'all':
                pages_list = list(range(len(doc)))
            else:
                pages_list = []
                for part in pages.split(','):
                    if '-' in part:
                        start, end = map(int, part.split('-'))
                        pages_list.extend(range(start-1, end))
                    else:
                        pages_list.append(int(part)-1)
            
            # Position mappings
            pos_map = {
                'bottom-right': lambda w, h: (w - 50, h - 20),
                'bottom-center': lambda w, h: (w/2 - 10, h - 20),
                'bottom-left': lambda w, h: (20, h - 20),
                'top-right': lambda w, h: (w - 50, 20),
                'top-center': lambda w, h: (w/2 - 10, 20),
                'top-left': lambda w, h: (20, 20),
            }
            
            page_num_counter = start_num
            for page_idx in pages_list:
                page = doc[page_idx]
                width = page.rect.width
                height = page.rect.height
                
                pos_func = pos_map.get(position, pos_map['bottom-right'])
                x, y = pos_func(width, height)
                
                page.insert_text(
                    (x, y),
                    str(page_num_counter),
                    fontsize=font_size,
                    color=(0, 0, 0)
                )
                page_num_counter += 1
            
            doc.save(output_path)
            doc.close()
            return output_path
        except Exception as e:
            raise Exception(f"Failed to add page numbers: {str(e)}")
    
    @staticmethod
    def annotate(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Add annotations to PDF from annotation objects"""
        try:
            pdf_path = input_paths[0]
            annotations = options.get('annotations', [])
            
            doc = fitz.open(pdf_path)
            
            # Process each annotation
            for ann in annotations:
                # Frontend sends 1-indexed page numbers, PyMuPDF uses 0-indexed
                page_num = ann.get('page', 1) - 1
                if page_num < 0 or page_num >= len(doc):
                    continue
                    
                page = doc[page_num]
                ann_type = ann.get('type', 'highlight')
                color = ann.get('color', '#FFFF00')
                opacity = ann.get('opacity', 0.5)
                
                # Convert hex color to RGB tuple
                color_hex = color.lstrip('#')
                try:
                    color_rgb = tuple(int(color_hex[i:i+2], 16) / 255.0 for i in (0, 2, 4))
                except:
                    color_rgb = (1.0, 1.0, 0.0)  # Default yellow
                
                if ann_type == 'highlight':
                    if all(k in ann for k in ['x', 'y', 'width', 'height']):
                        rect = fitz.Rect(
                            ann['x'],
                            ann['y'],
                            ann['x'] + ann['width'],
                            ann['y'] + ann['height']
                        )
                        annot = page.add_highlight_annot(rect)
                        if annot:
                            # For highlights, set both stroke and fill colors
                            annot.set_colors({"stroke": color_rgb, "fill": color_rgb})
                            # Also set the transparency
                            annot.set_opacity(opacity)
                
                elif ann_type == 'underline':
                    if all(k in ann for k in ['x', 'y', 'width', 'height']):
                        rect = fitz.Rect(
                            ann['x'],
                            ann['y'],
                            ann['x'] + ann['width'],
                            ann['y'] + ann['height']
                        )
                        annot = page.add_underline_annot(rect)
                        if annot:
                            annot.set_colors({"stroke": color_rgb})
                            annot.set_opacity(opacity)
                
                elif ann_type == 'strikethrough':
                    if all(k in ann for k in ['x', 'y', 'width', 'height']):
                        rect = fitz.Rect(
                            ann['x'],
                            ann['y'],
                            ann['x'] + ann['width'],
                            ann['y'] + ann['height']
                        )
                        # Strikethrough uses line annotation
                        line_points = [
                            fitz.Point(ann['x'], ann['y'] + ann['height'] / 2),
                            fitz.Point(ann['x'] + ann['width'], ann['y'] + ann['height'] / 2)
                        ]
                        # add_polyline_annot expects points directly, not wrapped in another list
                        annot = page.add_polyline_annot(line_points)
                        if annot:
                            annot.set_colors({"stroke": color_rgb})
                            annot.set_border({"width": 2})
                            annot.set_opacity(opacity)
                
                elif ann_type == 'freehand' and 'points' in ann:
                    # Convert points to polyline
                    points = ann.get('points', [])
                    if len(points) > 1:
                        fitz_points = [fitz.Point(p['x'], p['y']) for p in points]
                        # add_polyline_annot expects points directly, not wrapped in another list
                        annot = page.add_polyline_annot(fitz_points)
                        if annot:
                            annot.set_colors({"stroke": color_rgb})
                            annot.set_border({"width": 2})
                            annot.set_opacity(opacity)
                
                elif ann_type == 'text':
                    if all(k in ann for k in ['x', 'y', 'text']):
                        # Add as a visible text annotation (comment)
                        text = ann.get('text', '')
                        annot = page.add_text_annot(
                            fitz.Point(ann['x'], ann['y']),
                            text
                        )
                        if annot:
                            annot.set_colors({"stroke": color_rgb})
                            annot.set_opacity(opacity)
                
                elif ann_type == 'comment':
                    if all(k in ann for k in ['x', 'y', 'text']):
                        # Add as a popup comment
                        text = ann.get('text', '')
                        annot = page.add_text_annot(
                            fitz.Point(ann['x'], ann['y']),
                            text,
                            icon='Comment'
                        )
                        if annot:
                            annot.set_colors({"stroke": color_rgb})
                            annot.set_opacity(opacity)
            
            # Save the annotated PDF
            doc.save(output_path)
            doc.close()
            return output_path
        except Exception as e:
            import traceback
            raise Exception(f"Failed to annotate PDF: {str(e)}\n{traceback.format_exc()}")
    
    @staticmethod
    def add_signature(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Add signature to PDF"""
        try:
            pdf_path = input_paths[0]
            # Frontend sends 1-indexed page numbers, PyMuPDF uses 0-indexed
            page_num = int(options.get('pageNumber', 1)) - 1
            x = float(options.get('x', 50))
            y = float(options.get('y', 50))
            signature_text = options.get('signatureText', 'Signed')
            signature_image = options.get('signatureImage', None)  # base64 or path
            
            doc = fitz.open(pdf_path)
            page = doc[page_num]
            
            if signature_image:
                # Insert signature image
                try:
                    if signature_image.startswith('data:'):
                        # Base64 encoded
                        import base64
                        header, data = signature_image.split(',')
                        img_data = base64.b64decode(data)
                        img = Image.open(BytesIO(img_data))
                        img_path = '/tmp/signature.png'
                        img.save(img_path)
                        page.insert_image((x, y, x+100, y+50), filename=img_path)
                    else:
                        # File path
                        page.insert_image((x, y, x+100, y+50), filename=signature_image)
                except:
                    # Fallback to text
                    page.insert_text((x, y), signature_text, fontsize=12)
            else:
                # Insert signature text
                page.insert_text((x, y), signature_text, fontsize=12)
            
            doc.save(output_path)
            doc.close()
            return output_path
        except Exception as e:
            raise Exception(f"Failed to add signature: {str(e)}")
    
    @staticmethod
    def edit(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """General PDF editing (simple operations)"""
        try:
            pdf_path = input_paths[0]
            # This is a catch-all for miscellaneous edits
            # Could include: text covering, redacting, etc.
            
            doc = fitz.open(pdf_path)
            
            # For now, just copy it
            doc.save(output_path)
            doc.close()
            return output_path
        except Exception as e:
            raise Exception(f"Failed to edit PDF: {str(e)}")
