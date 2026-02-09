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

def is_text_meaningful(text):
    """
    Heuristic to check if text is valid English/meaningful.
    Returns True if > 40% of words are alphanumeric and sensible length.
    """
    if not text: return False
    words = text.split()
    if not words: return False
    
    # Check for mojibake or OCR garbage (too many non-ascii or random symbols)
    valid_words = 0
    total_words = len(words)
    
    for w in words:
        # Simple heuristic: Alpha-only and length > 2
        if w.isalpha() and len(w) > 2:
            valid_words += 1
            
    ratio = valid_words / total_words
    return ratio > 0.4  # At least 40% valid English-looking words

def process_pdf(path):
    print(f"Processing PDF: {path}")
    try:
        # 1. Try Standard Text Extraction first (Fastest)
        pages = extract_text_from_pdf(path)
        
        # 2. Analyze Text Quality
        combined_text = " ".join([p["text"] for p in pages]) if pages else ""
        text_quality_pass = is_text_meaningful(combined_text)
        total_text_len = len(combined_text)
        
        # 3. Decision Logic: Force OCR if text is missing OR garbage
        needs_ocr = False
        if total_text_len < 200: # Too short
            print(f"  -> Too short ({total_text_len} chars). Needs OCR.")
            needs_ocr = True
        elif not text_quality_pass: # Garbage / Mojibake
            print(f"  -> Low text quality detected (Garbage text). Needs OCR.")
            needs_ocr = True
            
        if needs_ocr:
            print("  -> Starting OCR (Tesseract High-Res)...")
            try:
                ocr_pages = extract_text_from_scanned_pdf(path)
                ocr_text = " ".join([p["text"] for p in ocr_pages])
                
                # If OCR produced SOMETHING, use it.
                if len(ocr_text) > total_text_len or (len(ocr_text) > 100 and not text_quality_pass):
                     pages = ocr_pages
                     print("  -> OCR successful. Replaced original text.")
                else:
                    print("  -> OCR result was poorer or empty. Falling back to original.")
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