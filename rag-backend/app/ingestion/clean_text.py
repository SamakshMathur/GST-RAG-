import re

def clean_text(text: str) -> str:
    text = text.replace("\x0c", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    # common OCR junk
    text = re.sub(r"[^\x00-\x7F]+", "", text)

    return text.strip()