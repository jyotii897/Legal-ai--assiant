def chunk_text(text: str, chunk_size: int = 600, overlap: int = 100) -> list:
    """Split text into overlapping chunks (500-700 chars, 100 overlap per PRD)."""
    if not text or not text.strip():
        return []
    text = text.strip()
    chunks, start = [], 0
    while start < len(text):
        end = start + chunk_size
        if end < len(text):
            boundary = text.rfind('. ', start, end)
            if boundary != -1 and boundary > start + chunk_size // 2:
                end = boundary + 1
        chunk = text[start:end].strip()
        if len(chunk) > 30:
            chunks.append(chunk)
        start = end - overlap
        if start >= len(text):
            break
    return chunks
