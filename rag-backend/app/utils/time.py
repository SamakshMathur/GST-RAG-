"""
Shared time utilities.

Use ``utc_now()`` everywhere instead of ``datetime.utcnow()`` (deprecated,
naive) or ad-hoc ``datetime.now(timezone.utc)`` calls scattered across the
codebase.  Having one canonical call site means timezone handling is correct
and consistent — naive-vs-aware timestamp bugs have already been fixed twice
in this project; a shared helper prevents a third.
"""
from datetime import datetime, timezone
from typing import Any, Optional


def utc_now() -> datetime:
    """Return the current UTC time as a timezone-aware datetime object."""
    return datetime.now(timezone.utc)


def utc_now_iso() -> str:
    """Return the current UTC time as an ISO-8601 string (with +00:00 suffix)."""
    return utc_now().isoformat()


def normalize_to_utc(value: Any) -> Optional[datetime]:
    """
    Normalize various datetime/timestamp representations to a timezone-aware UTC datetime.

    Handles:
    - None or empty/invalid values -> None
    - datetime (naive -> assumed UTC; aware -> converted to UTC)
    - str (ISO-8601 strings, with or without Z/offset)
    - int/float (epoch seconds or milliseconds)
    """
    if value is None:
        return None

    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc)

    if isinstance(value, (int, float)):
        try:
            ts = value / 1000.0 if value > 1e11 else float(value)
            return datetime.fromtimestamp(ts, tz=timezone.utc)
        except Exception:
            return None

    if isinstance(value, str):
        val = value.strip()
        if not val:
            return None
        try:
            if val.endswith("Z") or val.endswith("z"):
                val = val[:-1] + "+00:00"
            dt = datetime.fromisoformat(val)
            if dt.tzinfo is None:
                return dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        except Exception:
            return None

    return None
