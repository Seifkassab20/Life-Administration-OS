import re
import logging
from typing import List, Tuple, Dict, Any
from pathlib import Path
import fitz  # PyMuPDF
from PIL import Image
import io

logger = logging.getLogger("life_admin.ocr")

# Arabic character normalizations
ARABIC_ALEF_REGEX = re.compile(r"[إأآٱ]")
ARABIC_TAA_MARBUTA_REGEX = re.compile(r"ة")
ARABIC_YAA_REGEX = re.compile(r"ى")
ARABIC_TATWEEL_REGEX = re.compile(r"ـ")
ARABIC_DIACRITICS_REGEX = re.compile(r"[\u064B-\u065F\u0670]")

# Eastern Arabic numerals mapping
EASTERN_ARABIC_DIGITS = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9"
}

def normalize_arabic_text(text: str) -> str:
    """
    Normalizes Arabic text:
    - Normalizes variants of Alef to bare Alef (ا)
    - Normalizes Taa Marbuta to Haa
    - Normalizes Yaa to Alif Maqsura
    - Strips diacritics and tatweel
    - Converts Eastern Arabic digits (١٢٣) to ASCII digits (123)
    """
    if not text:
        return ""

    # Replace Eastern Arabic digits
    for eastern, western in EASTERN_ARABIC_DIGITS.items():
        text = text.replace(eastern, western)

    # Normalize characters
    text = ARABIC_ALEF_REGEX.sub("ا", text)
    text = ARABIC_TAA_MARBUTA_REGEX.sub("ه", text)
    text = ARABIC_YAA_REGEX.sub("ي", text)
    text = ARABIC_TATWEEL_REGEX.sub("", text)
    text = ARABIC_DIACRITICS_REGEX.sub("", text)

    # Normalize extra whitespaces
    text = re.sub(r"\s+", " ", text).strip()
    return text

class OCRService:
    def __init__(self):
        self._paddle_ocr = None
        self._paddle_initialized = False

    def _get_paddle_ocr(self):
        if not self._paddle_initialized:
            try:
                from paddleocr import PaddleOCR
                # Initialize PaddleOCR with Arabic and English support
                self._paddle_ocr = PaddleOCR(use_angle_cls=True, lang='ar', show_log=False)
                logger.info("PaddleOCR engine loaded successfully.")
            except Exception as e:
                logger.info(f"PaddleOCR not initialized or optional: {e}. PyMuPDF fallback active.")
                self._paddle_ocr = None
            self._paddle_initialized = True
        return self._paddle_ocr

    def extract_text_from_pdf(self, pdf_bytes: bytes) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Extracts text from PDF pages using PyMuPDF.
        Returns: (combined_raw_text, list_of_page_dicts)
        """
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages_content = []
        full_text_parts = []

        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text").strip()
            
            # If digital text is sparse, attempt OCR if engine is available
            if len(text) < 30:
                paddle = self._get_paddle_ocr()
                if paddle:
                    pix = page.get_pixmap(dpi=150)
                    img_bytes = pix.tobytes("png")
                    ocr_res = paddle.ocr(img_bytes, cls=True)
                    ocr_lines = []
                    if ocr_res and ocr_res[0]:
                        for line in ocr_res[0]:
                            ocr_lines.append(line[1][0])
                    ocr_text = "\n".join(ocr_lines)
                    if len(ocr_text) > len(text):
                        text = ocr_text

            pages_content.append({
                "page_number": page_num + 1,
                "text": text
            })
            if text:
                full_text_parts.append(text)

        raw_text = "\n\n".join(full_text_parts)
        return raw_text, pages_content

    def extract_text_from_image(self, image_bytes: bytes) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Extracts text from an image (JPEG, PNG).
        """
        paddle = self._get_paddle_ocr()
        if paddle:
            try:
                ocr_res = paddle.ocr(image_bytes, cls=True)
                lines = []
                if ocr_res and ocr_res[0]:
                    for line in ocr_res[0]:
                        lines.append(line[1][0])
                raw_text = "\n".join(lines)
                return raw_text, [{"page_number": 1, "text": raw_text}]
            except Exception as e:
                logger.warning(f"PaddleOCR image extraction error: {e}")

        # Fallback using PIL / PyMuPDF
        try:
            doc = fitz.open(stream=image_bytes, filetype="png")
            text = doc[0].get_text("text") if len(doc) > 0 else ""
            if text:
                return text, [{"page_number": 1, "text": text}]
        except Exception:
            pass

        return "", [{"page_number": 1, "text": ""}]

    def process_document(self, file_bytes: bytes, mime_type: str) -> Tuple[str, str, List[Dict[str, Any]]]:
        """
        Runs OCR and returns: (raw_ocr_text, normalized_text, pages_data)
        """
        if "pdf" in mime_type.lower():
            raw_text, pages = self.extract_text_from_pdf(file_bytes)
        else:
            raw_text, pages = self.extract_text_from_image(file_bytes)

        normalized_text = normalize_arabic_text(raw_text)
        return raw_text, normalized_text, pages

ocr_service = OCRService()
