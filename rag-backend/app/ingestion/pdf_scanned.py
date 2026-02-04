import pytesseract
from pdf2image import convert_from_path

def extract_text_from_scanned_pdf(path):
    images = convert_from_path(path, dpi=300)
    pages = []

    for idx, image in enumerate(images):
        # OCR with better page segmentation for legal text
        text = pytesseract.image_to_string(
            image,
            lang="eng",
            config="--psm 6 --oem 3"
        )

        pages.append({
            "text": text.strip() or "[OCR_EMPTY_PAGE]",
            "metadata": {
                "source": str(path),
                "page": idx + 1,
                "type": "pdf_scanned_ocr"
            }
        })

    return pages