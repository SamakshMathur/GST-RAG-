import json
from pathlib import Path
from app.chunking.chunker import chunk_text

INPUT = Path("data/extracted/documents.jsonl")
OUTPUT = Path("data/chunks/chunks.jsonl")
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

def split_into_paragraphs(text: str):
    return [p.strip() for p in text.split("\n") if p.strip()]

with INPUT.open() as f, OUTPUT.open("w") as out:
    for line in f:
        record = json.loads(line)

        paragraphs = split_into_paragraphs(record["text"])
        chunks = chunk_text(paragraphs)

        for idx, chunk in enumerate(chunks):
            out.write(json.dumps({
                "text": chunk,
                "metadata": {
                    **record["metadata"],
                    "chunk_id": idx
                }
            }, ensure_ascii=False) + "\n")