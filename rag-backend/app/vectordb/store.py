import faiss
import json
import numpy as np
from pathlib import Path

VECTOR_DIM = 768

def build_vector_store(chunks_path: Path, index_path: Path):
    texts = []
    metadatas = []

    with chunks_path.open() as f:
        for line in f:
            record = json.loads(line)
            texts.append(record["text"])
            metadatas.append(record["metadata"])

    from app.embeddings.embedder import embed_texts
    embeddings = embed_texts(texts).astype("float32")

    index = faiss.IndexFlatL2(VECTOR_DIM)
    index.add(embeddings)

    faiss.write_index(index, str(index_path))

    # Save metadata alongside
    with open(index_path.with_suffix(".meta.json"), "w") as f:
        json.dump(metadatas, f, ensure_ascii=False, indent=2)