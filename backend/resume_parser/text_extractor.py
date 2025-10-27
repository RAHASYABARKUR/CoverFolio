# text_extract.py
import pdfplumber, io
from typing import Optional
import re

def extract_text_from_pdf_better(pdf_path: str) -> str:
    text_chunks = []

    # --- Try pdfplumber with tighter tolerances to reduce "jammed" tokens
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                # tune tolerances to split words properly
                page_text = page.extract_text(x_tolerance=1.0, y_tolerance=2.0) or ""
                text_chunks.append(page_text)
        text = "\n".join(text_chunks).strip()
        if _looks_like_real_text(text):
            return text
    except Exception:
        pass

    # --- Fallback: PyMuPDF (fitz)
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(pdf_path)
        text = "\n".join(page.get_text("text") for page in doc)
        if _looks_like_real_text(text):
            return text
    except Exception:
        pass

    # --- Fallback: OCR images with Tesseract
    try:
        from pdf2image import convert_from_path
        import pytesseract
        images = convert_from_path(pdf_path, dpi=300)
        pages_text = []
        for im in images:
            pages_text.append(pytesseract.image_to_string(im))
        text = "\n".join(pages_text)
        return text
    except Exception:
        return ""

def _looks_like_real_text(t: str) -> bool:
    # heuristic: enough alphabetic and whitespace
    return bool(t) and (len(re.findall(r"[A-Za-z]", t)) > 100)
