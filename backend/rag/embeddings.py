import numpy as np

_model = None


def get_embedding_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _model


def generate_embeddings(chunks: list) -> np.ndarray:
    return get_embedding_model().encode(chunks, show_progress_bar=False, convert_to_numpy=True).astype("float32")


def generate_single_embedding(text: str) -> np.ndarray:
    return get_embedding_model().encode([text], convert_to_numpy=True)[0].astype("float32")
