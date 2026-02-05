import json
from pathlib import Path
from app.chunking.chunker import chunk_text
from app.config import CHUNKS_PATH

# Input is the Output of Ingestion
INPUT = Path(CHUNKS_PATH).parent / "documents.jsonl"
OUTPUT = Path(CHUNKS_PATH)

OUTPUT.parent.mkdir(parents=True, exist_ok=True)

def split_into_paragraphs(text: str):
    return [p.strip() for p in text.split("\n") if p.strip()]

def run():
    print(f"Reading from: {INPUT}")
    if not INPUT.exists():
        print("Input file not found. Run ingestion first.")
        return

    count = 0
    with INPUT.open(encoding="utf-8") as f, OUTPUT.open("w", encoding="utf-8") as out:
        for line in f:
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue

            paragraphs = split_into_paragraphs(record["text"])
            chunks = chunk_text(paragraphs)

            for idx, chunk in enumerate(chunks):
                out.write(json.dumps({
                    "text": chunk,
                    "source": record["metadata"]["source"], # Flattening metadata for easier access
                    "page": record["metadata"].get("page"),
                    "type": record["metadata"].get("type"),
                    "chunk_id": idx
                }, ensure_ascii=False) + "\n")
            count += 1
            
    print(f"Chunking complete. Processed {count} documents.")
    print(f"Output saved to: {OUTPUT}")

if __name__ == "__main__":
    run()