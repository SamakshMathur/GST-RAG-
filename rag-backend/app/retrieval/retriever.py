import faiss
import json
import numpy as np
from pathlib import Path
import os
from app.retrieval.source_priority import source_priority
from sentence_transformers import SentenceTransformer

# all-MiniLM-L6-v2 dimension
VECTOR_DIM = 384

# Lazy load mainly for production app startup time, 
# but for retriever class it's usually initialized at startup.
_model = None

def get_model():
    global _model
    if _model is None:
        # We assume lightweight model
        _model = SentenceTransformer('all-MiniLM-L6-v2') 
    return _model

def embed_query(text: str) -> np.ndarray:
    model = get_model()
    embedding = model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
    return np.array(embedding, dtype="float32")


class Retriever:
    def __init__(self, index_path: Path, chunks_path: Path):
        self.index_path = index_path
        self.chunks_path = chunks_path
        
        if not index_path.exists():
            print(f"Index not found at {index_path}. Search will fail.")
            self.index = None
            self.metadata = []
            self.chunks = []
            return

        # Load FAISS index
        self.index = faiss.read_index(str(index_path))

        # Load metadata
        with open(index_path.with_suffix(".meta.json"), "r", encoding="utf-8") as f:
            self.metadata = json.load(f)

        # Load chunks for text retrieval
        self.chunks = []
        with open(chunks_path, "r", encoding="utf-8") as f:
            for line in f:
                self.chunks.append(json.loads(line))
        
        # Pre-load model to avoid lag on first query
        get_model()

    def search(self, query: str, top_k: int = 5, allowed_sources=None):
        if not self.index:
            return []

        # Embed query
        query_vector = embed_query(query).reshape(1, -1)

        # Fetch extra candidates for safe filtering + ranking
        D, indices = self.index.search(query_vector, top_k * 5)

        results = []

        for idx in indices[0]:
            if idx < 0: continue
            
            # Defensive safety check
            if idx >= len(self.metadata):
                continue

            meta = self.metadata[idx]
            # If chunks line up 1:1 with metadata/index
            text = self.chunks[idx]["text"] if idx < len(self.chunks) else ""

            source = meta.get("source", "")

            # Apply routing filter
            if allowed_sources:
                if not any(src in source for src in allowed_sources):
                    continue

            results.append({
                "text": text,
                **meta
            })

        # 🔑 Authority-aware re-ranking (lower = stronger)
        results.sort(
            key=lambda x: source_priority(x.get("source", ""))
        )

        return results[:top_k]
