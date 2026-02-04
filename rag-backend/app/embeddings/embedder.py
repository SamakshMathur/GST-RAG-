from typing import List
import numpy as np

VECTOR_DIM = 768

def embed_texts(texts: List[str]) -> np.ndarray:
    """
    Deterministic local embeddings.
    This keeps vector DB stable and debuggable.
    Can be replaced later with Antigravity safely.
    """
    vectors = []

    for text in texts:
        np.random.seed(abs(hash(text)) % (2**32))
        vectors.append(np.random.rand(VECTOR_DIM))

    return np.array(vectors, dtype="float32")