import faiss
import json
import numpy as np
from pathlib import Path
import os
from app.retrieval.source_priority import source_priority
from rank_bm25 import BM25Okapi
from flashrank import Ranker
from app.config import RERANKING_MODEL
import re

# all-MiniLM-L6-v2 dimension
VECTOR_DIM = 384

# Lazy load mainly for production app startup time, 
# but for retriever class it's usually initialized at startup.
_model = None

def get_model():
    global _model
    if _model is None:
        print("Loading Embedding Model (SentenceTransformer)...")
        from sentence_transformers import SentenceTransformer
        # We assume lightweight model
        _model = SentenceTransformer('all-MiniLM-L6-v2') 
    return _model

def embed_query(text: str) -> np.ndarray:
    model = get_model()
    embedding = model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
    return np.array(embedding, dtype="float32")

def tokenize_text(text: str):
    """Simple tokenizer for BM25."""
    return [word.lower() for word in re.findall(r'\b\w+\b', text)]

class Retriever:
    def __init__(self, index_path: Path, chunks_path: Path):
        self.index_path = index_path
        self.chunks_path = chunks_path
        
        if not index_path.exists():
            print(f"Index not found at {index_path}. Search will fail.")
            self.index = None
            self.metadata = []
            self.chunks = []
            self.bm25 = None
            return

        # Load FAISS index
        print("Loading FAISS Index...")
        self.index = faiss.read_index(str(index_path))

        # Load metadata
        print("Loading Metadata...")
        with open(index_path.with_suffix(".meta.json"), "r", encoding="utf-8") as f:
            self.metadata = json.load(f)

        # Load chunks for text retrieval
        print("Loading Chunks & Building BM25 Index...")
        self.chunks = []
        tokenized_corpus = []
        with open(chunks_path, "r", encoding="utf-8") as f:
            for line in f:
                chunk = json.loads(line)
                self.chunks.append(chunk)
                # Tokenize for BM25
                tokenized_corpus.append(tokenize_text(chunk.get("text", "")))
        
        # Initialize BM25
        self.bm25 = BM25Okapi(tokenized_corpus)
        print("BM25 Index Built Successfully.")

        # Pre-load model to avoid lag on first query
        # get_model() # Lazy load on first request instead
        # Initialize FlashRank (Accuracy Engine)
        print(f"Loading Reranker ({RERANKING_MODEL})...")
        self.ranker = Ranker(model_name=RERANKING_MODEL, cache_dir=".flashrank_cache")
        print("Reranker Loaded.")

    def search(self, query: str, top_k: int = 5, allowed_sources=None):
        if not self.index or not self.bm25:
            return []

        # --- 1. Vector Search (Semantic) ---
        query_vector = embed_query(query).reshape(1, -1)
        # Fetch more candidates for reranking (top_k * 4)
        D, indices = self.index.search(query_vector, top_k * 4)
        
        vector_results = {} # {idx: score}
        for i, idx in enumerate(indices[0]):
            if idx >= 0 and idx < len(self.chunks):
                # Normalize FAISS distance (lower is better) to score (higher is better)
                # Simple inversion or just rank
                vector_results[idx] = i # Storing RANK (0 is best)

        # --- 2. Keyword Search (BM25) ---
        tokenized_query = tokenize_text(query)
        # Get top candidates (top_k * 4)
        bm25_scores = self.bm25.get_scores(tokenized_query)
        # Get indices of top scores
        bm25_top_n = np.argsort(bm25_scores)[::-1][:top_k * 4]
        
        keyword_results = {} # {idx: score}
        for i, idx in enumerate(bm25_top_n):
            keyword_results[idx] = i # Storing RANK

        # --- 3. Reciprocal Rank Fusion (RRF) ---
        # Formula: score = 1 / (k + rank)
        combined_scores = {}
        RRF_K = 60
        
        all_candidates = set(vector_results.keys()) | set(keyword_results.keys())
        
        for idx in all_candidates:
            vector_rank = vector_results.get(idx, float('inf'))
            keyword_rank = keyword_results.get(idx, float('inf'))
            
            rrf_score = 0
            if vector_rank != float('inf'):
                rrf_score += 1 / (RRF_K + vector_rank)
            if keyword_rank != float('inf'):
                rrf_score += 1 / (RRF_K + keyword_rank)
            
            combined_scores[idx] = rrf_score

        # Sort by RRF score (Descending)
        sorted_candidates = sorted(combined_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Take Top K
        final_indices = [idx for idx, score in sorted_candidates[:top_k]]

        # --- 4. Fetch & Format Results ---
        results = []
        for idx in final_indices:
            
            # Defensive safety check
            if idx >= len(self.metadata) or idx >= len(self.chunks):
                continue

            meta = self.metadata[idx]
            text = self.chunks[idx]["text"]
            source = meta.get("source", "")

            # Apply routing filter
            if allowed_sources:
                if not any(src in source for src in allowed_sources):
                    continue

            results.append({
                "text": text,
                **meta,
                "_debug_score": combined_scores[idx] # For debugging
            })

        # --- 5. Semantic Reranking (FlashRank) ---
        # Rerank the RRF results to ensure highest precision
        rerank_request = [
            {"id": idx, "text": res["text"], "meta": res} for idx, res in enumerate(results)
        ]
        
        if rerank_request:
            try:
                # FlashRank 0.2.x uses .rank(query, docs)
                # We wrap this in try-except to be safe against library version differences
                reranked_results = self.ranker.rank(query=query, docs=rerank_request)
                
                # Map back to our format
                final_results = []
                for r in reranked_results:
                    original_res = r["meta"]
                    original_res["_rerank_score"] = r["score"]
                    final_results.append(original_res)
                
                results = final_results[:top_k] # Strict top_k after reranking
            except Exception as e:
                print(f"FlashRank Reranking Failed: {e}. Returning original results.")
                results = results[:top_k] # Fallback to top_k from RRF

        # --- 6. Authority Sort (Final Polish) ---
        # Prioritize Acts/Notifications slightly if accuracy scores are close
        results.sort(
            key=lambda x: source_priority(x.get("source", ""))
        )

        return results
