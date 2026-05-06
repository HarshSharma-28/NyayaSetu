import fitz
import pytesseract
from PIL import Image
import io
import cv2
import numpy as np
from typing import dict, List

from app.core.exceptions.pdf_exceptions import (
    PDFCorruptedException,
    PDFEncryptedException,
    PDFTextTooShortException,
    OCRFailedException
)

class PDFProcessor:
    """
    Hybrid OCR engine for NyayaSetu:
    1. PyMuPDF native text extraction (fast, accurate for digital PDFs)
    2. Tesseract OCR fallback (for scanned/image PDFs)
    
    Every failure is explicit — no silent fallbacks.
    """

    def extract_text(self, pdf_path_or_bytes: str | bytes) -> dict:
        """
        Extracts text from a PDF using native methods or OCR fallback.
        
        Returns:
        {
          "pages": [{"page": int, "text": str, "method": 'native'|'ocr'}],
          "total_pages": int,
          "full_text": str,
          "ocr_pages_count": int
        }
        """
        try:
            if isinstance(pdf_path_or_bytes, bytes):
                doc = fitz.open(stream=pdf_path_or_bytes, filetype="pdf")
            else:
                doc = fitz.open(pdf_path_or_bytes)
        except Exception as exc:
            raise PDFCorruptedException(
                details={"path": str(pdf_path_or_bytes)[:100], "error": str(exc)}
            )
        
        if doc.is_encrypted:
            raise PDFEncryptedException(
                details={"path": str(pdf_path_or_bytes)[:100]}
            )
        
        pages_data = []
        ocr_count = 0
        
        for i, page in enumerate(doc):
            native_text = page.get_text("text").strip()
            
            if self._is_good_quality(native_text):
                pages_data.append({
                    "page": i + 1,
                    "text": native_text,
                    "method": "native"
                })
            else:
                try:
                    ocr_text = self._run_tesseract(page)
                    pages_data.append({
                        "page": i + 1,
                        "text": ocr_text,
                        "method": "ocr"
                    })
                    ocr_count += 1
                except Exception as exc:
                    raise OCRFailedException(
                        details={"page": i + 1, "error": str(exc)}
                    )
        
        full_text = "\n\n".join(p["text"] for p in pages_data)
        
        if len(full_text.strip()) < 200:
            raise PDFTextTooShortException(
                details={"total_chars": len(full_text)}
            )
        
        return {
            "pages": pages_data,
            "total_pages": len(pages_data),
            "full_text": full_text,
            "ocr_pages_count": ocr_count
        }
    
    def _is_good_quality(self, text: str) -> bool:
        """Heuristic to check if native text extraction was successful."""
        return len(text.strip()) > 100
    
    def _run_tesseract(self, page) -> str:
        """Runs Tesseract OCR on a specific page using OpenCV preprocessing."""
        # Render page to image (DPI 300 for accuracy)
        pix = page.get_pixmap(dpi=300)
        img = Image.open(io.BytesIO(pix.tobytes()))
        
        # Preprocess with OpenCV for better OCR results
        arr = np.array(img.convert('RGB'))
        gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
        
        # Denoising and Otsu Thresholding
        denoised = cv2.fastNlMeansDenoising(gray)
        _, binary = cv2.threshold(
            denoised, 0, 255,
            cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )
        
        clean_img = Image.fromarray(binary)
        
        # Tesseract configuration: single block of text assumed
        return pytesseract.image_to_string(
            clean_img, lang='eng'
        ).strip()
