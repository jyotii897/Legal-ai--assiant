import os
from utils.ocr import extract_text


def load_document_from_path(file_path: str) -> str:
    """Extract text from a file path (PDF, DOCX, TXT)."""
    return extract_text(file_path)
