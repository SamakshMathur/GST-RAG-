"""Phone number normalization shared across auth and admin-promotion matching.

Numbers reach the backend in whatever shape the caller typed them ('+91 98765
43210', '9876543210', '919876543210', ...). Anything that compares two phone
numbers for equality needs them in one consistent shape first, or an
otherwise-correct match (e.g. an admin-promotion queued for a number) silently
never fires.
"""


def normalize_phone(phone: str) -> str:
    """Normalise to bare E.164 digits (no leading '+'): strips whitespace,
    dashes and a leading '+', and assumes a bare 10-digit number is Indian
    (prepends '91'). Returns '' for falsy input."""
    if not phone:
        return ""
    number = phone.strip().lstrip("+").replace(" ", "").replace("-", "")
    if len(number) == 10 and number.isdigit():
        number = "91" + number
    return number
