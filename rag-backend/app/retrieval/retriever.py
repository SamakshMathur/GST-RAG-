import faiss
import json
import numpy as np
from pathlib import Path
from app.retrieval.source_priority import source_priority


VECTOR_DIM = 768


def embed_query(text: str) -> np.ndarray:
    np.random.seed(abs(hash(text)) % (2**32))
    return np.random.rand(VECTOR_DIM).astype("float32")


class Retriever:
    def __init__(self, index_path: Path, chunks_path: Path):
        # Load FAISS index
        self.index = faiss.read_index(str(index_path))

        # Load metadata
        with open(index_path.with_suffix(".meta.json"), "r") as f:
            self.metadata = json.load(f)

        # Load chunks
        self.chunks = []
        with open(chunks_path, "r") as f:
            for line in f:
                self.chunks.append(json.loads(line))

    def search(self, query: str, top_k: int = 5, allowed_sources=None):
        # Embed query
        query_vector = embed_query(query).reshape(1, -1)

        # Fetch extra candidates for safe filtering + ranking
        _, indices = self.index.search(query_vector, top_k * 3)

        results = []

        for idx in indices[0]:
            # Defensive safety check
            if idx >= len(self.metadata) or idx >= len(self.chunks):
                continue

            meta = self.metadata[idx]
            chunk = self.chunks[idx]

            source = meta.get("source", "")

            # Apply routing filter
            if allowed_sources:
                if not any(src in source for src in allowed_sources):
                    continue

            results.append({
                "text": chunk["text"],
                **meta
            })

        # 🔑 Authority-aware re-ranking (lower = stronger)
        results.sort(
            key=lambda x: source_priority(x.get("source", ""))
        )

        # 🔑 Cut AFTER ranking
        return results[:top_k]
