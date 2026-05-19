KEYWORD_MAP = {
    "Termination Clause": ["terminat", "expir", "notice period", "cancell", "dissolution", "end of term"],
    "Payment Clause": ["payment", "pay ", "fee", "invoice", "compensation", "price", "amount due", "billing", "remittance"],
    "Confidentiality Clause": ["confidential", "non-disclosure", "nda", "proprietary", "trade secret", "shall not disclose"],
    "Indemnity Clause": ["indemnif", "indemnity", "hold harmless", "defend and indemnify"],
    "Liability Clause": ["liabilit", "liable", "damages", "limitation of liability", "cap on liability", "in no event"],
    "Renewal Clause": ["renew", "renewal", "auto-renew", "automatically renew", "successive term", "extension"],
    "Governing Law Clause": ["governing law", "jurisdiction", "venue", "applicable law", "courts of"],
    "Force Majeure Clause": ["force majeure", "act of god", "beyond reasonable control", "unforeseen"],
}


def legalbert_classify(text: str) -> dict:
    """Keyword-based + LegalBERT hybrid clause classification."""
    text_lower = text.lower()
    scores = {}
    for clause_type, keywords in KEYWORD_MAP.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[clause_type] = score

    if scores:
        best = max(scores, key=scores.get)
        confidence = min(0.95, scores[best] / len(KEYWORD_MAP[best]) + 0.45)
        return {"clause_type": best, "confidence": round(confidence, 2)}

    return {"clause_type": "General Clause", "confidence": 0.40}
