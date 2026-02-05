import sys
import os
from pathlib import Path
import json

# Add parent directory to path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ingestion.pdf_text import extract_text_from_pdf
from app.ingestion.pdf_scanned import extract_text_from_scanned_pdf
from app.ingestion.docx_reader import extract_text_from_docx
from app.ingestion.excel_reader import extract_text_from_excel
from app.ingestion.clean_text import clean_text
from app.config import DATA_DIR, CHUNKS_PATH

# Config
INPUT_DIR = Path(DATA_DIR)
OUTPUT_FILE = Path(CHUNKS_PATH) # We'll store processed docs here temporarily or directly chunk

# Ensure output directory exists
OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

# Temporary storage for raw documents before chunking
DOCS_OUTPUT = OUTPUT_FILE.parent / "documents.jsonl"

def write_record(record):
    """Write a single record to the output JSONL file."""
    if not record.get("text") or not record["text"].strip():
        return
        
    record["text"] = clean_text(record["text"])
    
    with DOCS_OUTPUT.open("a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")

def process_pdf(path):
    print(f"Processing PDF: {path}")
    try:
        # 1. Try Standard Text Extraction first
        pages = extract_text_from_pdf(path)
        
        # 2. Check if valid text was extracted
        total_text_len = sum(len(p["text"].strip()) for p in pages)
        avg_text_len = total_text_len / len(pages) if pages else 0
        
        # If very little text, assume scanned and try OCR
        if avg_text_len < 50: 
            print(f"  -> Low text content ({avg_text_len} chars/page). Attempting OCR...")
            try:
                ocr_pages = extract_text_from_scanned_pdf(path)
                if sum(len(p["text"].strip()) for p in ocr_pages) > total_text_len:
                     pages = ocr_pages
                     print("  -> OCR successful.")
                else:
                    print("  -> OCR did not yield better results. Keeping original.")
            except Exception as e:
                print(f"  -> OCR failed: {e}")
        
        for p in pages:
            write_record(p)
            
    except Exception as e:
        print(f"Error reading PDF {path}: {e}")

def run():
    print(f"Starting ingestion from: {INPUT_DIR.absolute()}")
    
    # Clear existing file
    if DOCS_OUTPUT.exists():
        DOCS_OUTPUT.unlink()

    count = 0
    # Recursive walk
    for root, _, files in os.walk(INPUT_DIR):
        for file in files:
            file_path = Path(root) / file
            
            # Skip hidden files
            if file.startswith("."):
                continue
                
            ext = file_path.suffix.lower()
            
            if ext == ".pdf":
                process_pdf(file_path)
                count += 1
            elif ext == ".docx":
                try:
                    pages = extract_text_from_docx(file_path)
                    for p in pages: write_record(p)
                    count += 1
                except Exception as e:
                    print(f"Error reading DOCX {file_path}: {e}")
            elif ext in [".xlsx", ".xls"]:
                try:
                    pages = extract_text_from_excel(file_path)
                    for p in pages: write_record(p)
                    count += 1
                except Exception as e:
                    print(f"Error reading EXCEL {file_path}: {e}")
            
            if count % 10 == 0:
                print(f"Processed {count} files...")

    print(f"Ingestion complete. Processed {count} files.")
    print(f"Output saved to: {DOCS_OUTPUT}")

if __name__ == "__main__":
    run()