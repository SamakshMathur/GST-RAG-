"""Deterministic legal evidence resolution after retrieval.

Retrieval answers "what is relevant?". This module answers the next question:
"what kind of authority is this, how directly does it govern the query, and
does the retrieved set contain a conflict that the generator must explain?"

This is deliberately metadata- and text-based. It does not decide the law or
silently discard lower-authority material; it ranks evidence, labels it, and
surfaces possible conflicts for the prompt and downstream verification.
"""
from __future__ import annotations

import re
from collections import defaultdict
from typing import Any, Dict, Iterable, List


_REF_PATTERNS = (
    r"\b(?:section|sec\.)\s*\d+[A-Za-z]?(?:\s*\(\s*[\da-zA-Z]+\s*\))*",
    r"\b(?:rule|rul\.)\s*\d+[A-Za-z]?(?:\s*\(\s*[\da-zA-Z]+\s*\))*",
    r"\b(?:article|art\.)\s*\d+[A-Za-z]?(?:\s*\(\s*[\da-zA-Z]+\s*\))*",
    r"\b(?:schedule|sch\.)\s*(?:[ivxlcdm]+|\d+)",
    r"\b(?:circular|notification)\s+(?:no\.?\s*)?[\w./-]+",
    r"\bcir\s*[-/]?\s*\d+",
    r"\bnotif\s*[-/]?\s*\d+/\d+",
    r"\b(?:order|ruling|appeal|petition|wp|ca|slp)\s*(?:no\.?)?\s*[\w./-]+",
)
_REF_RE = re.compile("|".join(_REF_PATTERNS), re.IGNORECASE)
_CIR_RE = re.compile(r"\b(?:circular\s*(?:no\.?|number)?\s*(\d+)|cir\s*[-/]?\s*(\d+))\b", re.IGNORECASE)
_NOTIF_RE = re.compile(r"\b(?:notification|notif)\s*(?:no\.?|number)?\s*(\d{1,4})\s*/\s*(\d{2,4})\b", re.IGNORECASE)
_SEC_RE = re.compile(r"\b(?:section|sec\.)\s*(\d+[a-z]?)\b", re.IGNORECASE)
_RUL_RE = re.compile(r"\b(?:rule|rul\.)\s*(\d+[a-z]?)\b", re.IGNORECASE)
_LANDMARK_CASES = ("mohit minerals", "safari retreats", "vkc footsteps", "bharti airtel", "union of india")
_CONFLICT_TERMS = re.compile(
    r"\b(?:overruled|reversed|distinguished|superseded|amended|contrary|"
    r"notwithstanding|however|in contrast|not available|ineligible|eligible|"
    r"allowed|disallowed|blocked|permitted)\b",
    re.IGNORECASE,
)


def _path(chunk: Dict[str, Any]) -> str:
    metadata = chunk.get("metadata") or {}
    return str(
        chunk.get("rel_path")
        or metadata.get("rel_path")
        or chunk.get("source")
        or ""
    ).replace("\\", "/").lower()


def _text(chunk: Dict[str, Any]) -> str:
    return str(chunk.get("text") or chunk.get("embed_text") or "")


def _source_profile(path: str) -> tuple[str, str, int]:
    """Return (role, authority label, rank), where lower rank is stronger."""
    if "supreme court" in path:
        return "binding_precedent", "Supreme Court precedent", 1
    if "high court" in path:
        return "persuasive_precedent", "High Court precedent", 3
    if "cgst acts" in path or "igst acts" in path or "/act/" in path or path.startswith("act/"):
        return "primary_legislation", "Act", 2
    if "rules" in path:
        return "delegated_legislation", "Rule", 2
    if "notification" in path:
        return "delegated_authority", "Notification", 4
    if "circular" in path:
        return "departmental_guidance", "CBIC circular", 5
    if "aar" in path or "advance ruling" in path:
        return "persuasive_authority", "Advance ruling", 6
    if "icai" in path or "faq" in path or "brochure" in path:
        return "secondary_material", "Commentary", 7
    return "unclassified", "Unclassified source", 8


def _normalise_ref(value: str) -> str:
    return re.sub(r"\s+", " ", value.lower().replace("sec.", "section").replace("rul.", "rule").replace("art.", "article")).strip()


def _query_refs(query: str) -> set[str]:
    q = query or ""
    refs = set()
    for match in _REF_RE.findall(q):
        norm = _normalise_ref(match)
        if norm not in ("circular", "notification", "section", "rule", "article", "schedule"):
            refs.add(norm)
    for m in _CIR_RE.finditer(q):
        num = m.group(1) or m.group(2)
        refs.add(f"circular_{num}")
    for m in _NOTIF_RE.finditer(q):
        num, yr = m.group(1), m.group(2)
        if len(yr) == 2:
            yr = "20" + yr
        refs.add(f"notif_{num}_{yr}")
    for m in _SEC_RE.finditer(q):
        sec = m.group(1).lower()
        refs.add(f"section_{sec}")
        refs.add(f"sec_{sec}")
        refs.add(f"cgst_sec_{sec}")
    for m in _RUL_RE.finditer(q):
        rul = m.group(1).lower()
        refs.add(f"rule_{rul}")
        refs.add(f"rul_{rul}")
        refs.add(f"cgst_rul_{rul}")

    # Case parties: "X v. Y", "X vs Y"
    for m in re.finditer(r'\b([A-Za-z0-9&._-]+(?:\s+[A-Za-z0-9&._-]+){0,3})\s+(?:v\.|vs\.?|versus)\s+([A-Za-z0-9&._-]+(?:\s+[A-Za-z0-9&._-]+){0,3})\b', q, re.IGNORECASE):
        p1, p2 = _normalise_ref(m.group(1)), _normalise_ref(m.group(2))
        if len(p1) >= 3:
            refs.add(p1)
        if len(p2) >= 3:
            refs.add(p2)

    # "In re [Applicant/Entity]"
    for m in re.finditer(r'\bin\s+re[:\s]+([A-Za-z0-9&._-]+(?:\s+[A-Za-z0-9&._-]+){0,4}?)(?:\s+(?:regarding|on|for|re|matter|ruling|decision|order|dated|against|vs\.?|v\.)|\?|$|,)', q, re.IGNORECASE):
        entity = _normalise_ref(m.group(1))
        if len(entity) >= 3:
            refs.add(entity)

    q_lower = q.lower()
    for case in _LANDMARK_CASES:
        if case in q_lower:
            refs.add(case)

    return refs


def _chunk_refs(chunk: Dict[str, Any]) -> set[str]:
    metadata = chunk.get("metadata") or {}
    values: Iterable[Any] = (
        list(metadata.get("citations") or [])
        + list(metadata.get("provisions") or [])
        + list(metadata.get("provision_keys") or [])
    )
    refs = {_normalise_ref(str(value)) for value in values if value}
    for pk in metadata.get("provision_keys") or []:
        pk_str = str(pk).strip()
        pk_lower = pk_str.lower()
        refs.add(pk_lower)
        if pk_lower.startswith("circular_"):
            refs.add(pk_lower)
        elif pk_lower.startswith("notif_"):
            refs.add(pk_lower)
        elif pk_lower.startswith("cgst_sec_"):
            sec = pk_lower.replace("cgst_sec_", "")
            refs.add(f"section_{sec}")
            refs.add(f"sec_{sec}")
        elif pk_lower.startswith("cgst_rul_"):
            rul = pk_lower.replace("cgst_rul_", "")
            refs.add(f"rule_{rul}")
            refs.add(f"rul_{rul}")

    # Case metadata & filename stem extraction
    for field in ("case_name", "title", "applicant", "order_no", "order_number"):
        val = metadata.get(field)
        if val and isinstance(val, str):
            val_norm = _normalise_ref(val)
            refs.add(val_norm)
            for m in re.finditer(r'\b([a-zA-Z0-9\s]{3,35})\s+(?:v\.|vs\.?|versus)\s+([a-zA-Z0-9\s]{3,35})\b', val_norm):
                refs.add(_normalise_ref(m.group(1)))
                refs.add(_normalise_ref(m.group(2)))

    # Filename stem extraction from rel_path
    rel_path = _path(chunk)
    if rel_path:
        fname = rel_path.split("/")[-1].split("\\")[-1]
        stem = re.sub(r'\.[a-zA-Z0-9]+$', '', fname)
        cleaned_stem = re.sub(r'[-_]+', ' ', stem).strip()
        if len(cleaned_stem) >= 3 and cleaned_stem not in ("act", "rules", "circular", "notification", "index"):
            refs.add(_normalise_ref(cleaned_stem))

    text_content = _text(chunk)
    combined_text = f"{text_content} {rel_path}".lower()

    for match in _REF_RE.findall(text_content):
        norm = _normalise_ref(match)
        if norm not in ("circular", "notification", "section", "rule", "article", "schedule"):
            refs.add(norm)

    for m in _CIR_RE.finditer(combined_text):
        num = m.group(1) or m.group(2)
        refs.add(f"circular_{num}")
    for m in _NOTIF_RE.finditer(combined_text):
        num, yr = m.group(1), m.group(2)
        if len(yr) == 2:
            yr = "20" + yr
        refs.add(f"notif_{num}_{yr}")
    for m in _SEC_RE.finditer(text_content):
        sec = m.group(1).lower()
        refs.add(f"section_{sec}")
        refs.add(f"sec_{sec}")
        refs.add(f"cgst_sec_{sec}")
    for m in _RUL_RE.finditer(text_content):
        rul = m.group(1).lower()
        refs.add(f"rule_{rul}")
        refs.add(f"rul_{rul}")
        refs.add(f"cgst_rul_{rul}")

    for case in _LANDMARK_CASES:
        if case in combined_text:
            refs.add(case)

    return refs


def resolve_evidence(chunks: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
    """Annotate and order retrieved chunks for legally explicit generation.

    Authority is a bounded tie-breaker, not a replacement for semantic
    relevance. Directly requested provisions receive the strongest additional
    signal. Possible conflicts are grouped by shared legal reference and
    surfaced in metadata so the answer can distinguish current law from a
    departmental or historical position.
    """
    if not chunks:
        return []

    requested_refs = _query_refs(query)
    prepared: List[Dict[str, Any]] = []
    by_ref: dict[str, list[Dict[str, Any]]] = defaultdict(list)

    for position, original in enumerate(chunks):
        chunk = original.copy()
        path = _path(chunk)
        role, authority, authority_rank = _source_profile(path)
        refs = _chunk_refs(chunk)
        exact_refs = sorted(requested_refs & refs)
        text = _text(chunk)
        conflict_terms = sorted({m.lower() for m in _CONFLICT_TERMS.findall(text)})

        # Keep the authority influence bounded so a highly relevant lower-tier
        # source is not blindly displaced by a vaguely related primary source.
        authority_bonus = max(0.0, (8 - authority_rank) * 0.025)

        # Intent-Aware Precedence (Generic across all legal authority classes):
        # When the user's query explicitly names or references an authority (whether Act
        # Section, Rule, Notification, Circular, AAR, Supreme Court, High Court, etc.)
        # and this candidate matches that requested authority (exact_refs is non-empty),
        # it receives the query-intent boost.
        # Unrelated authorities that were not explicitly cited do not receive this boost,
        # ensuring that an explicitly requested Authority X is not displaced by an unrelated
        # Authority Y merely because Y has a higher generic hierarchy rank or broader taxonomy score.
        # For general queries with no explicit references, exact_refs is empty, so the
        # universal statutory and case-law authority hierarchy remains completely intact.
        if exact_refs:
            exact_bonus = 0.50 + min(0.20, len(exact_refs) * 0.10)
        else:
            exact_bonus = 0.0

        base_score = float(
            chunk.get("_final_legal_score", chunk.get("_rerank_score", chunk.get("_debug_score", 0.0)))
        )
        chunk["_evidence_role"] = role
        chunk["_evidence_authority"] = authority
        chunk["_evidence_authority_rank"] = authority_rank
        chunk["_evidence_exact_refs"] = exact_refs
        chunk["_evidence_conflict_terms"] = conflict_terms
        chunk["_evidence_resolution_score"] = round(
            base_score + authority_bonus + exact_bonus, 6
        )
        chunk["_evidence_original_rank"] = position + 1
        prepared.append(chunk)
        for ref in refs:
            by_ref[ref].append(chunk)

    conflict_refs = set()
    for ref, related in by_ref.items():
        roles = {item["_evidence_role"] for item in related}
        has_conflict_language = any(item["_evidence_conflict_terms"] for item in related)
        has_primary_and_guidance = (
            "primary_legislation" in roles
            and "departmental_guidance" in roles
        )
        if len(roles) > 1 and (has_conflict_language or has_primary_and_guidance):
            conflict_refs.add(ref)

    for chunk in prepared:
        refs = set(_chunk_refs(chunk))
        flagged = sorted(refs & conflict_refs)
        chunk["_evidence_conflict_refs"] = flagged
        chunk["_evidence_requires_resolution"] = bool(flagged)
        if flagged:
            chunk["_evidence_resolution_note"] = (
                "Potentially conflicting authorities share: " + ", ".join(flagged[:4])
            )
        else:
            chunk["_evidence_resolution_note"] = "No cross-authority conflict detected in retrieved evidence."

    prepared.sort(
        key=lambda item: (
            item["_evidence_resolution_score"],
            -item["_evidence_original_rank"],
        ),
        reverse=True,
    )
    return prepared


def build_resolution_summary(chunks: List[Dict[str, Any]]) -> str:
    """Create a compact instruction block for the answer generator."""
    if not chunks:
        return ""
    roles = []
    seen_roles = set()
    conflict_refs = []
    for chunk in chunks:
        role = chunk.get("_evidence_authority", "Unclassified source")
        if role not in seen_roles:
            roles.append(role)
            seen_roles.add(role)
        for ref in chunk.get("_evidence_conflict_refs", []):
            if ref not in conflict_refs:
                conflict_refs.append(ref)

    lines = [
        "LEGAL EVIDENCE RESOLUTION:",
        "Use evidence according to its labelled authority and explain disagreement instead of blending it.",
        "Binding precedent controls where applicable; Acts and Rules state the governing text; notifications and circulars show delegated or departmental position; AARs and commentary are persuasive only.",
        "Retrieved authority types: " + ", ".join(roles) + ".",
    ]
    if conflict_refs:
        lines.append(
            "Potential conflicts requiring explicit treatment: " + ", ".join(conflict_refs[:8]) + "."
        )
    return "\n".join(lines)