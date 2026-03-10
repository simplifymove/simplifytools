"""
PDF Security Engine
Handles protection: password protection, unlocking, watermark removal
"""

from typing import Dict, Any, List
import PyPDF2
import fitz  # PyMuPDF


class PdfSecurityEngine:
    """PDF security operations"""
    
    @staticmethod
    def protect(input_paths: List[str], output_path: str, options: Dict[str, Any]) -> str:
        """Add password protection to PDF"""
        try:
            pdf_path = input_paths[0]
            user_password = options.get('userPassword', '')
            owner_password = options.get('ownerPassword', '')
            permissions = options.get('permissions', 0)  # -1 for full permissions
            
            if not user_password and not owner_password:
                raise ValueError("At least one password must be provided")
            
            doc = fitz.open(pdf_path)
            
            # Set PDF encryption
            if user_password or owner_password:
                doc.set_encryption(user_password, owner_password, permissions=-1)
            
            doc.save(output_path)
            doc.close()
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
        """Attempt to remove watermarks from PDF (heuristic approach)"""
        try:
            pdf_path = input_paths[0]
            remove_method = options.get('method', 'overlay')  # overlay, text, heuristic
            
            doc = fitz.open(pdf_path)
            
            # This is a heuristic approach - works for overlay watermarks
            # More complex watermarks may require manual editing
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Get all objects on the page
                annots = page.annots()
                if annots:
                    for annot in annots:
                        # Remove annotations (some watermarks appear as annotations)
                        page.delete_annot(annot)
                
                # Try to remove text marked as watermark
                # This is limited - real watermarks in page content are harder to remove
                text = page.get_text()
                if 'watermark' in text.lower() or 'draft' in text.lower():
                    # Note: Deep content removal requires graphics editing
                    pass
            
            doc.save(output_path)
            doc.close()
            
            return output_path
        except Exception as e:
            raise Exception(f"Failed to remove watermark: {str(e)}")
