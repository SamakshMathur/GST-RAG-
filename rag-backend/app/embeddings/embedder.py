from typing import List, Union
import numpy as np
import os
from openai import OpenAI
from sentence_transformers import SentenceTransformer
from app.config import (
    OPENAI_API_KEY, 
    EMBEDDING_PROVIDER, 
    EMBEDDING_MODEL, 
    VECTOR_DIM
)

# Global clients
openai_client = None
local_model = None

def get_openai_client():
    global openai_client
    if openai_client is None:
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
    return openai_client

def get_local_model():
    global local_model
    if local_model is None:
        print("Loading Local Embedding Model (all-MiniLM-L6-v2)...")
        local_model = SentenceTransformer('all-MiniLM-L6-v2')
        print("Model loaded.")
    return local_model

def embed_texts(texts: List[str]) -> np.ndarray:
    """
    Generate embeddings using the configured provider (OpenAI or Local).
    """
    try:
        if EMBEDDING_PROVIDER == "openai":
            client = get_openai_client()
            # OpenAI text-embedding-3-large
            response = client.embeddings.create(
                input=texts,
                model=EMBEDDING_MODEL,
                dimensions=VECTOR_DIM 
            )
            # Extract embeddings
            embeddings = [data.embedding for data in response.data]
            return np.array(embeddings, dtype='float32')
            
        else:
            # Fallback to Local
            model = get_local_model()
            embeddings = model.encode(texts)
            return np.array(embeddings, dtype='float32')

    except Exception as e:
        print(f"Embedding Error ({EMBEDDING_PROVIDER}): {e}")
        # Fallback to local if OpenAI fails? Or raise?
        # For now, let's fallback to local just in case, but dimension mismatch will occur.
        # So better to just raise or return empty.
        # Actually given the dimension difference (3072 vs 384), fallback is dangerous without re-indexing.
        # We will assume if configured for OpenAI, we must use OpenAI.
        raise e