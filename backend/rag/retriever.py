import faiss
import numpy as np
from rag.embeddings import generate_embeddings, generate_single_embedding


def build_faiss_index(chunks: list) -> tuple:
    if not chunks:
        return None, None
    embeddings = generate_embeddings(chunks)
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)
    return index, embeddings


def search_chunks(index, chunks: list, query: str, k: int = 5) -> list:
    if index is None or not chunks:
        return []
    query_emb = generate_single_embedding(query).reshape(1, -1)
    _, indices = index.search(query_emb, min(k, len(chunks)))
    return [chunks[i] for i in indices[0] if 0 <= i < len(chunks)]
