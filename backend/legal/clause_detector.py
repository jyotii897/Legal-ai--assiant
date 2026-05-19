from legal.legalbert import legalbert_classify


def detect_all_clauses(chunks: list) -> list:
    """Detect and classify all legal clauses from document chunks."""
    seen_types = {}
    for i, chunk in enumerate(chunks):
        if len(chunk.strip()) < 40:
            continue
        result = legalbert_classify(chunk)
        ctype = result["clause_type"]
        conf = result["confidence"]
        if ctype not in seen_types or conf > seen_types[ctype]["confidence"]:
            seen_types[ctype] = {
                "text": chunk,
                "clause_type": ctype,
                "confidence": conf,
                "chunk_index": i,
            }

    clauses = list(seen_types.values())
    clauses.sort(key=lambda x: x["confidence"], reverse=True)
    return clauses
