import pytesseract
from pdf2image import convert_from_path

def extract_text_from_scanned_pdf(path):
    # Increase DPI to 400 for better small text recognition
    images = convert_from_path(path, dpi=400)
    pages = []

    for idx, image in enumerate(images):
        # OCR with better page segmentation for legal text
        # PSM 3 = Fully automatic page segmentation, but no OSD. (Default)
        # PSM 1 = Automatic page segmentation with OSD. 
        # Using PSM 3 as it is robust for mixed columns/images.
        text = pytesseract.image_to_string(
            image,
            lang="eng",
            config="--psm 3 --oem 3"
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