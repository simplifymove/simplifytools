"""
PDF OCR & Translate Engine
Handles OCR for scanned PDFs and PDF translation
"""

from typing import Dict, Any, List
import fitz  # PyMuPDF
from PIL import Image
import numpy as np
import tempfile
import os
import time


class PdfOCRTranslateEngine:
    """PDF OCR and translation operations"""
    
    @staticmethod
    def ocr_pdf(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Extract text from scanned PDF using OCR (creates searchable PDF)"""
        try:
            import pytesseract
            
            pdf_path = input_paths[0]
            language = options.get('language', 'eng')  # OCR language
            page_range = options.get('pageRange', 'all')
            output_format = options.get('outputFormat', 'pdf')  # pdf, txt
            
            doc = fitz.open(pdf_path)
            
            pages_to_ocr = []
            if page_range == 'all':
                pages_to_ocr = list(range(len(doc)))
            else:
                for part in page_range.split(','):
                    if '-' in part:
                        start, end = map(int, part.split('-'))
                        pages_to_ocr.extend(range(start-1, end))
                    else:
                        pages_to_ocr.append(int(part)-1)
            
            ocr_content = []
            new_doc = None
            
            if output_format == 'pdf':
                new_doc = fitz.open()
            
            for page_num in pages_to_ocr:
                page = doc[page_num]
                
                # Convert page to image
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)  # 2x zoom for better OCR
                
                # Save image temporarily
                temp_dir = tempfile.gettempdir()
                temp_img = os.path.join(temp_dir, f'ocr_{page_num}_{int(time.time() * 1000)}.png')
                pix.save_png(temp_img)
                
                # Run OCR
                img = Image.open(temp_img)
                ocr_text = pytesseract.image_to_string(img, lang=language)
                ocr_content.append(ocr_text)
                
                if output_format == 'pdf':
                    # Create new page with extracted text
                    new_page = new_doc.new_page(width=page.rect.width, height=page.rect.height)
                    # Insert original page as image background
                    new_page.insert_image(page.rect, pixmap=pix)
                    # Add OCR text as overlay (optional - for searchability)
                    new_page.insert_text((50, 50), ocr_text[:500], fontsize=8, color=(1, 1, 1), 
                                       text_matrix=fitz.Matrix(0.1, 0.1))  # Transparent text
                
                # Clean up temp file
                try:
                    os.remove(temp_img)
                except:
                    pass
            
            doc.close()
            
            if output_format == 'pdf':
                new_doc.save(output_path)
                new_doc.close()
            else:  # txt
                with open(output_path, 'w', encoding='utf-8') as f:
                    for idx, text in enumerate(ocr_content):
                        f.write(f"--- Page {idx + 1} ---\n{text}\n\n")
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to OCR PDF: {str(e)}")
    
    @staticmethod
    def deskew_pdf(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Deskew (straighten) scanned PDF pages"""
        try:
            import cv2
            from skimage import io as sk_io
            from skimage.transform import rotate
            
            pdf_path = input_paths[0]
            page_range = options.get('pageRange', 'all')
            
            doc = fitz.open(pdf_path)
            pages_to_deskew = []
            
            if page_range == 'all':
                pages_to_deskew = list(range(len(doc)))
            else:
                for part in page_range.split(','):
                    if '-' in part:
                        start, end = map(int, part.split('-'))
                        pages_to_deskew.extend(range(start-1, end))
                    else:
                        pages_to_deskew.append(int(part)-1)
            
            output_doc = fitz.open()
            temp_dir = tempfile.gettempdir()
            
            for page_num in pages_to_deskew:
                page = doc[page_num]
                
                # Convert page to image
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                
                # Save and load with OpenCV
                temp_img = os.path.join(temp_dir, f'deskew_{page_num}_{int(time.time() * 1000)}.png')
                try:
                    pix.save(temp_img)
                except AttributeError:
                    pix.save_png(temp_img)
                
                # Read image
                img = cv2.imread(temp_img)
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                
                # Detect lines using Hough transform
                edges = cv2.Canny(gray, 50, 150, apertureSize=3)
                lines = cv2.HoughLines(edges, 1, np.pi / 180, 100)
                
                if lines is not None:
                    # Calculate average angle
                    angles = []
                    for line in lines:
                        rho, theta = line[0]
                        angle = np.degrees(theta) - 90
                        if abs(angle) < 45:  # Only consider near-vertical lines
                            angles.append(angle)
                    
                    if angles:
                        avg_angle = np.median(angles)
                    else:
                        avg_angle = 0
                else:
                    avg_angle = 0
                
                # Rotate image to deskew
                h, w = img.shape[:2]
                rotation_matrix = cv2.getRotationMatrix2D((w / 2, h / 2), avg_angle, 1.0)
                deskewed = cv2.warpAffine(img, rotation_matrix, (w, h), 
                                        borderMode=cv2.BORDER_REPLICATE)
                
                # Save deskewed image
                temp_deskew = os.path.join(temp_dir, f'deskewed_{page_num}_{int(time.time() * 1000)}.png')
                cv2.imwrite(temp_deskew, deskewed)
                
                # Convert back to PDF
                deskew_pix = fitz.Pixmap(temp_deskew)
                
                new_page = output_doc.new_page(width=page.rect.width, height=page.rect.height)
                new_page.insert_image(page.rect, pixmap=deskew_pix)
                
                # Clean up
                try:
                    os.remove(temp_img)
                    os.remove(temp_deskew)
                except:
                    pass
            
            doc.close()
            output_doc.save(output_path)
            output_doc.close()
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to deskew PDF: {str(e)}")
    
    @staticmethod
    def enhance_scanned_pdf(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Enhance quality of scanned PDF (improve contrast, sharpen, denoise)"""
        try:
            import cv2
            from PIL import ImageEnhance, ImageFilter
            
            pdf_path = input_paths[0]
            page_range = options.get('pageRange', 'all')
            enhancement_level = options.get('level', 'medium')  # low, medium, high
            
            doc = fitz.open(pdf_path)
            pages_to_enhance = []
            
            if page_range == 'all':
                pages_to_enhance = list(range(len(doc)))
            else:
                for part in page_range.split(','):
                    if '-' in part:
                        start, end = map(int, part.split('-'))
                        pages_to_enhance.extend(range(start-1, end))
                    else:
                        pages_to_enhance.append(int(part)-1)
            
            output_doc = fitz.open()
            temp_dir = tempfile.gettempdir()
            
            # Adjustment factors based on level
            enhancement_factors = {
                'low': {'contrast': 1.3, 'sharpness': 1.2, 'brightness': 1.1},
                'medium': {'contrast': 1.5, 'sharpness': 1.5, 'brightness': 1.2},
                'high': {'contrast': 2.0, 'sharpness': 2.0, 'brightness': 1.3}
            }
            factors = enhancement_factors.get(enhancement_level, enhancement_factors['medium'])
            
            for page_num in pages_to_enhance:
                page = doc[page_num]
                
                # Convert page to image
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                
                # Save and process
                temp_img = os.path.join(temp_dir, f'enhance_{page_num}_{int(time.time() * 1000)}.png')
                try:
                    pix.save(temp_img)
                except AttributeError:
                    pix.save_png(temp_img)
                
                # Load PIL image
                img = Image.open(temp_img)
                
                # Apply enhancements
                # 1. Contrast
                contrast_enhancer = ImageEnhance.Contrast(img)
                img = contrast_enhancer.enhance(factors['contrast'])
                
                # 2. Sharpness
                sharpness_enhancer = ImageEnhance.Sharpness(img)
                img = sharpness_enhancer.enhance(factors['sharpness'])
                
                # 3. Brightness
                brightness_enhancer = ImageEnhance.Brightness(img)
                img = brightness_enhancer.enhance(factors['brightness'])
                
                # 4. Optional: Denoise with OpenCV
                img_cv = cv2.imread(temp_img)
                denoised = cv2.fastNlMeansDenoising(img_cv, h=10, templateWindowSize=7, searchWindowSize=21)
                
                # Save enhanced image
                temp_enhanced = os.path.join(temp_dir, f'enhanced_{page_num}_{int(time.time() * 1000)}.png')
                cv2.imwrite(temp_enhanced, denoised)
                
                # Convert back to PDF
                enhanced_pix = fitz.Pixmap(temp_enhanced)
                new_page = output_doc.new_page(width=page.rect.width, height=page.rect.height)
                new_page.insert_image(page.rect, pixmap=enhanced_pix)
                
                # Clean up
                try:
                    os.remove(temp_img)
                    os.remove(temp_enhanced)
                except:
                    pass
            
            doc.close()
            output_doc.save(output_path)
            output_doc.close()
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to enhance scanned PDF: {str(e)}")
    
    @staticmethod
    def translate(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Translate PDF content to target language"""
        try:
            pdf_path = input_paths[0]
            target_language = options.get('targetLanguage', 'es')  # Spanish by default
            output_mode = options.get('outputMode', 'text')  # text, pdf
            page_range = options.get('pageRange', 'all')
            
            # First extract text
            doc = fitz.open(pdf_path)
            
            pages_to_translate = []
            if page_range == 'all':
                pages_to_translate = list(range(len(doc)))
            else:
                for part in page_range.split(','):
                    if '-' in part:
                        start, end = map(int, part.split('-'))
                        pages_to_translate.extend(range(start-1, end))
                    else:
                        pages_to_translate.append(int(part)-1)
            
            translated_content = []
            
            for page_num in pages_to_translate:
                page = doc[page_num]
                text = page.get_text()
                
                # Try to translate using available translation service
                try:
                    translated_text = PdfOCRTranslateEngine._translate_text(
                        text, target_language
                    )
                except:
                    translated_text = text  # Fallback to original
                
                translated_content.append(f"--- Page {page_num+1} ---\n{translated_text}\n\n")
            
            doc.close()
            
            if output_mode == 'text':
                # Save as text file
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.writelines(translated_content)
            else:
                # Create new PDF with translated text
                new_doc = fitz.open()
                for content in translated_content:
                    page = new_doc.new_page()
                    page.insert_text((50, 50), content, fontsize=10)
                new_doc.save(output_path)
                new_doc.close()
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to translate PDF: {str(e)}")
    
    @staticmethod
    def _translate_text(text: str, target_language: str) -> str:
        """Helper to translate text using available service"""
        try:
            # Try using textblob (simple and lightweight)
            from textblob import TextBlob
            blob = TextBlob(text[:1000])  # Limit length for stability
            return str(blob.translate(to=target_language))
        except:
            pass
        
        try:
            # Try using libre translate API
            import requests
            response = requests.post(
                'https://api.mymemory.translated.net/get',
                params={
                    'q': text[:500],
                    'langpair': f'en|{target_language}'
                },
                timeout=5
            )
            if response.status_code == 200:
                return response.json()['responseData']['translatedText']
        except:
            pass
        
        try:
            # Try using transformers/HuggingFace (if available)
            from transformers import pipeline
            translator = pipeline(
                "translation",
                model=f"Helsinki-NLP/opus-mt-en-{target_language}"
            )
            result = translator(text[:512])
            return result[0]['translation_text']
        except:
            pass
        
        # Fallback: return original text
        return text
