from pathlib import Path
import os

# Mimic documents.py logic
BASE_DIR = Path("RAG_INFORMATION_DATABASE")
ABS_BASE_DIR = BASE_DIR.resolve()

print(f"Current Working Directory: {os.getcwd()}")
print(f"Resolving 'RAG_INFORMATION_DATABASE' to: {ABS_BASE_DIR}")
print(f"Exists? {BASE_DIR.exists()}")

if BASE_DIR.exists():
    print("Listing subdirectories:")
    for item in BASE_DIR.iterdir():
        print(f" - {item.name} (Dir: {item.is_dir()})")

    # Check Circulars specifically
    circ = BASE_DIR / "Circulars"
    if circ.exists():
        print(f"Circulars count: {len(list(circ.rglob('*')))}")
    else:
        print("Circulars folder NOT found.")
else:
    print("BASE_DIR does not exist. Trying absolute lookup...")
    # Try finding it relative to this script location if we were in app/api
    # But here we are running from root of rag-backend usually
    pass
