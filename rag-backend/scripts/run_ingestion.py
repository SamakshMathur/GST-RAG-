from pathlib import Path
import json

from app.ingestion.pdf_text import extract_text_from_pdf
from app.ingestion.pdf_scanned import extract_text_from_scanned_pdf
from app.ingestion.docx_reader import extract_text_from_docx
from app.ingestion.excel_reader import extract_text_from_excel
from app.ingestion.clean_text import clean_text

RAW = Path("data/raw")
OUT = Path("data/extracted/documents.jsonl")

OUT.parent.mkdir(parents=True, exist_ok=True)

def write(records):
    with OUT.open("a", encoding="utf-8") as f:
        for r in records:
            r["text"] = clean_text(r["text"])
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

def run():
    for p in (RAW / "pdf").glob("*.pdf"):
        write(extract_text_from_pdf(p))

    for p in (RAW / "scanned_pdf").glob("*.pdf"):
        write(extract_text_from_scanned_pdf(p))

    for p in (RAW / "docx").glob("*.docx"):
        write(extract_text_from_docx(p))

    for p in (RAW / "excel").glob("*.xlsx"):
        write(extract_text_from_excel(p))

if __name__ == "__main__":
    run()