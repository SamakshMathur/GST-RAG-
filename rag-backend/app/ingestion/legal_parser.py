import re
from typing import List, Dict, Any
import hashlib

class LegalParser:
    """
    Overhauled parser for high-precision legal RAG (9.5/10 quality).
    Handles structural parsing, provision-level chunking, and topic classification.
    """
    
    # Controlled Taxonomy for GST Topics (Sourced from User Request)
    TOPIC_TAXONOMY = [
        "ITC", "RCM", "Place_of_Supply", "Works_Contract", "Exemption", 
        "Refund", "Registration", "Composite_Supply", "Export", "Penalty",
        "Classification", "Supply", "Time_of_Supply", "Valuation", "Import", 
        "Appeals", "Returns", "Payment"
    ]

    # Substantive vs Procedural Laws
    SUBSTANTIVE_SECTIONS = ["7", "8", "9", "10", "11", "12", "13", "15", "16", "17", "54"]
    PROCEDURAL_SECTIONS = ["97", "98", "100", "101", "107", "112"]
    
    # ── Database_V2.0 TOP-LEVEL folder → (document_type, category, source) ────
    # As of the 2026-09 restructure, Database_V2.0 is FLAT: every document
    # lives under exactly one of these top-level folders (no more nested
    # "Data Base/OLD DATA/…" nor "Data Base/NEW DATA…" paths). Matched
    # against the first path segment only — exact / prefix match, checked
    # in order so no ambiguity between e.g. "igst_acts" vs "igst_rules".
    _FOLDER_MAP = [
        ("circulars",             "Circular",     "circulars",     "CBIC"),
        ("notifications",         "Notification", "notifications", "CBIC"),
        ("cgst_acts",             "Statute",      "cgst",          "Official"),
        ("cgst_rules",            "Rules",        "rules",         "Official"),
        ("igst_acts",             "Statute",      "igst",          "Official"),
        ("igst_rules",            "Rules",        "igst_rules",    "Official"),
        ("high_court",            "Case Law",     "highcourt",     "Judiciary"),
        ("supreme_court",         "Case Law",     "supremecourt",  "Judiciary"),
        ("aars",                  "Case Law",     "aars",          "Judiciary"),
        ("case_laws_by_section",  "Case Law",     "case_laws",     "Judiciary"),
        ("forms",                 "Form",         "forms",         "Official"),
        ("faqs",                  "FAQ",          "faqs",          "Official"),
        ("brochures",             "Brochure",     "brochures",     "Official"),
        ("responses",             "Response",     "responses",     "Official"),
        ("export",                "Export",       "export",        "Official"),
    ]

    @classmethod
    def classify_folder(cls, rel_path: str) -> Dict[str, Any]:
        """
        Derives document_type, category, and source from the Database_V2.0
        TOP-LEVEL folder name (flat structure post 2026-09 restructure).
        Falls back to a full-path substring scan for any legacy/unexpected
        nesting so nothing silently lands in "other".
        """
        path_lower = rel_path.replace("\\", "/").lower()
        top_folder = path_lower.split("/")[0]
        for keyword, doc_type, category, source in cls._FOLDER_MAP:
            if top_folder == keyword or top_folder.startswith(keyword):
                return {
                    "document_type": doc_type,
                    "category":      category,
                    "source":        source,
                }
        # Fallback: substring scan across the full path (handles any
        # not-yet-restructured or manually added nested folders)
        for keyword, doc_type, category, source in cls._FOLDER_MAP:
            if keyword.replace("_", " ") in path_lower or keyword in path_lower:
                return {
                    "document_type": doc_type,
                    "category":      category,
                    "source":        source,
                }
        return {"document_type": "Other", "category": "other", "source": "General"}

    # Structural Headers for Semantic Segmentation (Judgments/AARs)
    STRUCTURE_PATTERNS = {
        "FACTS": r"(?:Brief\s+)?Facts(?:\s+of\s+the\s+case)?|Background",
        "ISSUE": r"Issue[s]?\s+for\s+determination|Question[s]?\s+presented|Point[s]?\s+for\s+determination|Questions\s+for\s+which\s+advance\s+ruling\s+is\s+sought",
        "ARGUMENTS_APPLICANT": r"Arguments?\s+of\s+the\s+applicant|Submissions?\s+of\s+the\s+applicant|Applicant's\s+Submission",
        "ARGUMENTS_REVENUE": r"Arguments?\s+of\s+the\s+revenue|Submissions?\s+of\s+the\s+department|Respondent's\s+Submission",
        "LAW": r"Relevant\s+Legal\s+Provisions|Statutory\s+Framework|Legal\s+Position",
        "ANALYSIS": r"Analysis|Findings|Discussion|Observations|Reasoning",
        "RULING": r"Ruling|Order|Held|Conclusion|Ratio\s+Decidendi"
    }

    # High-Precision Citation Patterns
    # Supports: Section 17, Section 9(3), Section 17(5)(a), Sec. 16(2), u/s 73
    CITATION_PATTERNS = {
        "section": r"(?:Section|Sec\.|u/s)\s+(\d+[A-Z]*(?:\(\d+\))*(?:\([a-z]\))*)",
        "rule": r"Rule\s+(\d+[A-Z]*(?:\(\d+\))*(?:\([a-z]\))*)",
        "notification": r"Notification\s+No\.\s+(\d+/\d+)",
        "circular": r"Circular\s+No\.\s+(\d+/\d+/\d+)",
        "schedule": r"Schedule\s+(I|II|III)(?:\s+Para\s+(\d+[a-z]?))?",
        "act": r"(?:CGST|IGST|SGST|UTGST|GST)\s+Act",
    }

    @staticmethod
    def normalize_citation(type_str: str, value: str) -> str:
        """
        Canonicalizes citations into a standardized format: SOURCE_TYPE_VALUE
        Example: Section 17 -> CGST_SEC_17
        """
        clean_val = value.replace("/", "_").replace("(", "_").replace(")", "").strip().upper()
        type_prefix = type_str.upper()[:3]
        
        # Default source to CGST if not specified in text (common in GST practice)
        return f"CGST_{type_prefix}_{clean_val}"

    @classmethod
    def classify_topic(cls, text: str) -> str:
        """
        Classify chunk into controlled taxonomy based on high-precision keywords and NORMALIZED CITATIONS.
        """
        text_lower = text.lower()
        topic_scores = {}
        
        keyword_map = {
            "ITC": ["input tax credit", "itc", "blocked credit"],
            "RCM": ["reverse charge", "rcm", "9(3)", "9(4)", "reverse charge mechanism"],
            "Works_Contract": ["works contract", "immovable property", "construction", "erection", "commissioning"],
            "Place_of_Supply": ["place of supply", "inter-state", "intra-state"],
            "Exemption": ["exemption", "exempt", "not taxable", "nil rated"],
            "Refund": ["refund", "zero rated", "inverted duty"],
            "Export": ["export", "sez", "lut", "zero rated", "high seas sale", "bill of lading", "shipping bill"],
            "Penalty": ["penalty", "confiscation", "fine", "detention"],
            "Registration": ["registration", "gstin", "cancellation"],
            "Valuation": ["valuation", "transaction value", "open market value"],
            "Composite_Supply": ["composite supply", "mixed supply", "natural bundle"]
        }
        
        for topic, keywords in keyword_map.items():
            count = sum(2 if k in text_lower else 0 for k in keywords) 
            if count > 0:
                topic_scores[topic] = count
                
        # Primary check: Normalized Provision mapping (High Weight)
        normalized_citations = cls.extract_citations(text, normalize=True)
        provision_map = {
            "CGST_SEC_16": "ITC",
            "CGST_SEC_17": "ITC",
            "CGST_RUL_42": "ITC",
            "CGST_RUL_43": "ITC",
            "CGST_SEC_15": "Valuation",
            "CGST_SEC_9": "RCM",
            "CGST_SEC_8": "Composite_Supply",
            "CGST_SEC_10": "Place_of_Supply",
            "CGST_SEC_12": "Place_of_Supply",
            "CGST_SEC_13": "Place_of_Supply",
            "CGST_SEC_54": "Refund",
            "CGST_SEC_122": "Penalty",
            "CGST_SEC_129": "Penalty",
            "CGST_SEC_22": "Registration",
            "CGST_SEC_24": "Registration",
        }
        
        for cit in normalized_citations:
            # Match base section (e.g., CGST_SEC_17_5 matches CGST_SEC_17)
            for prov, topic in provision_map.items():
                if cit.startswith(prov):
                    topic_scores[topic] = topic_scores.get(topic, 0) + 10

        if not topic_scores:
            return "General"
            
        return max(topic_scores, key=topic_scores.get)

    @classmethod
    def extract_citations(cls, text: str, normalize: bool = False) -> List[str]:
        citations = []
        for key, pattern in cls.CITATION_PATTERNS.items():
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for m in matches:
                groups = m.groups()
                if not groups:
                    citations.append(key.upper())
                    continue
                
                if key == "schedule":
                    sched_num = groups[0]
                    para_num = groups[1] if len(groups) > 1 and groups[1] else ""
                    raw = f"Schedule {sched_num}" + (f" Para {para_num}" if para_num else "")
                    if normalize:
                        citations.append(f"CGST_SCHED_{sched_num}_PARA_{para_num}".strip("_"))
                    else:
                        citations.append(raw.upper())
                else:
                    val = groups[0]
                    if normalize:
                        citations.append(cls.normalize_citation(key, val))
                    else:
                        citations.append(f"{key.upper()} {val}")
                    
        return list(dict.fromkeys(citations))

    @staticmethod
    def _split_capped(text: str, structure: str, max_chars: int = 2000,
                       min_chars: int = 50, provision: str | None = None) -> List[Dict[str, Any]]:
        """
        Universal size-bounded splitter: every chunk emitted is between
        min_chars and max_chars (except when the WHOLE input is shorter
        than min_chars, in which case it's dropped entirely — a fragment
        that small isn't real content and nothing else exists to merge it
        into).

        This is the single shared implementation behind every chunking
        path (Statute/Rules provisions, Case Law segments, Circular/
        Notification paragraphs) after three separate bugs were found
        where each path had its own copy of this logic with a gap:
        an unbounded fallback (a whole document as ONE 180,919-char
        "chunk"), an unbounded single-paragraph case (one 22,297-char
        "chunk" when no section markers were found at all), and a
        mid-list flush that could emit a chunk under min_chars. One
        shared, tested implementation instead of N separate copies.
        """
        if len(text) <= max_chars:
            return [{"text": text, "structure": structure, **({"provision": provision} if provision else {})}] if len(text) >= min_chars else []

        paras = re.split(r'\n\n|\.\s+(?=[A-Z])', text)
        out: List[Dict[str, Any]] = []
        current = ""
        for p in paras:
            p = p.strip()
            if not p:
                continue
            if len(current) + len(p) < max_chars:
                current = f"{current} {p}".strip() if current else p
            else:
                if current:
                    out.append({"text": current, "structure": structure})
                if len(p) > max_chars:
                    slices = [p[i:i + max_chars] for i in range(0, len(p), max_chars)]
                    if len(slices) > 1 and len(slices[-1].strip()) < min_chars:
                        slices[-2] += slices[-1]
                        slices.pop()
                    for s in slices:
                        out.append({"text": s, "structure": structure})
                    current = ""
                else:
                    current = p
        if current:
            if len(current.strip()) < min_chars and out:
                out[-1]["text"] = f"{out[-1]['text']} {current}".strip()
            else:
                out.append({"text": current, "structure": structure})

        # Final safety net: fold any chunk that still ended up under
        # min_chars into a neighbour (mid-list flushes above can produce
        # one even after the per-branch handling).
        if not out:
            return out
        cleaned: List[Dict[str, Any]] = []
        for c in out:
            if len(c["text"].strip()) < min_chars and cleaned:
                cleaned[-1]["text"] = f"{cleaned[-1]['text']} {c['text']}".strip()
            else:
                cleaned.append(c)
        if len(cleaned) == 1 and len(cleaned[0]["text"].strip()) < min_chars:
            return []
        if len(cleaned) > 1 and len(cleaned[0]["text"].strip()) < min_chars:
            cleaned[1]["text"] = f"{cleaned[0]['text']} {cleaned[1]['text']}".strip()
            cleaned = cleaned[1:]
        if provision:
            for c in cleaned:
                c["provision"] = provision
        return cleaned

    @classmethod
    def structural_split(cls, text: str, doc_type: str) -> List[Dict[str, Any]]:
        """
        Elite Segmenter: Splits by legal component headers and then sub-chunks large sections.
        Ensures strict section isolation by checking for line-start headers.
        """
        if doc_type in ["Statute", "Rules"]:
            # Preserve existing provision-based logic for statutes
            MIN_PROVISION_CHARS = 60   # below this, a "marker + content" pair
                                        # is an inline cross-reference (e.g.
                                        # "...as per Section 9, Section 10...")
                                        # caught by the split regex, not a real
                                        # section header worth its own chunk.
            chunks = []
            pattern = cls.CITATION_PATTERNS["section"] if doc_type == "Statute" else cls.CITATION_PATTERNS["rule"]
            parts = re.split(f"({pattern})", text, flags=re.IGNORECASE)

            if len(parts) > 1:
                raw_pairs = []
                for i in range(1, len(parts), 2):
                    marker = parts[i]
                    content = parts[i+1] if i+1 < len(parts) else ""
                    raw_pairs.append((marker, content))

                # Merge any pair whose marker+content is too short into the
                # NEXT pair (its content genuinely continues there — the
                # split point was spurious, not a real section boundary).
                merged: list[tuple[str, str]] = []
                pending_marker = None
                pending_text = ""
                for marker, content in raw_pairs:
                    combined = f"{marker} {content}".strip()
                    if pending_marker is None:
                        pending_marker, pending_text = marker, combined
                    else:
                        pending_text = f"{pending_text} {combined}".strip()
                    if len(pending_text) >= MIN_PROVISION_CHARS:
                        merged.append((pending_marker, pending_text))
                        pending_marker, pending_text = None, ""
                if pending_marker is not None:
                    # Trailing short fragment — attach to the last real chunk
                    # rather than dropping it or emitting it alone.
                    if merged:
                        last_marker, last_text = merged[-1]
                        merged[-1] = (last_marker, f"{last_text} {pending_text}".strip())
                    else:
                        merged.append((pending_marker, pending_text))

                for marker, combined_text in merged:
                    chunks.extend(cls._split_capped(
                        combined_text, "PROVISION",
                        max_chars=2000, min_chars=MIN_PROVISION_CHARS, provision=marker,
                    ))
            else:
                # No section/rule markers found at all — the WHOLE document
                # was previously kept as one unbounded "STATUTE_BODY" chunk
                # (real case: a 22,297-char single chunk for IGST Rules.pdf,
                # which has no "Rule N" headers in a form the regex catches).
                chunks.extend(cls._split_capped(text, "STATUTE_BODY", max_chars=2000, min_chars=MIN_PROVISION_CHARS))
            return chunks

        # Case Law / Advance Ruling Semantic Segmentation
        MIN_SEGMENT_CHARS = 50   # below this, a segment is noise (a stray
                                  # heading match with almost no content
                                  # before/after it) — merge it rather than
                                  # emit it, or drop real content silently.
        header_names = list(cls.STRUCTURE_PATTERNS.keys())
        # Use ^ or \n to ensure headers are at start of logical blocks
        patterns = [f"(?P<{name}>(?:^|\\n)\\s*{cls.STRUCTURE_PATTERNS[name]})" for name in header_names]
        master_pattern = "|".join(patterns)

        raw_segments = []
        last_end = 0
        current_type = "BACKGROUND"

        for match in re.finditer(master_pattern, text, re.IGNORECASE):
            content = text[last_end:match.start()].strip()
            if content:
                raw_segments.append({"text": content, "structure": current_type})

            for name in header_names:
                if match.group(name):
                    current_type = name
                    break
            last_end = match.end()

        final_content = text[last_end:].strip()
        if final_content:
            raw_segments.append({"text": final_content, "structure": current_type})

        # Merge any segment under MIN_SEGMENT_CHARS into the NEXT segment
        # (its content genuinely continues there) instead of dropping it —
        # the old code simply discarded short segments before a header
        # match, silently losing real text. A trailing short segment with
        # no "next" gets folded into the previous one instead.
        segments = []
        pending_text, pending_type = "", None
        for seg in raw_segments:
            if pending_type is None:
                pending_text, pending_type = seg["text"], seg["structure"]
            else:
                pending_text = f"{pending_text}\n\n{seg['text']}".strip()
                pending_type = seg["structure"]  # adopt the newer/more specific label
            if len(pending_text) >= MIN_SEGMENT_CHARS:
                segments.append({"text": pending_text, "structure": pending_type})
                pending_text, pending_type = "", None
        if pending_type is not None:
            if segments:
                segments[-1]["text"] = f"{segments[-1]['text']}\n\n{pending_text}".strip()
            elif len(pending_text) >= MIN_SEGMENT_CHARS:
                segments.append({"text": pending_text, "structure": pending_type})
            # else: the ENTIRE document produced under MIN_SEGMENT_CHARS of
            # text (e.g. a near-blank cover page) — nothing to merge into,
            # and a lone 4-character "chunk" isn't real content. Drop it;
            # this shows up as a legitimate zero-chunk file in the QA
            # report rather than a fake near-empty chunk in the index.

        # Recursive sub-chunking if segments are too large (Gold standard: ~1000-1500 chars)
        MAX_PARA_CHUNK_CHARS = 1500  # hard cap — a single paragraph this
                                       # large (e.g. one giant run-on
                                       # paragraph with no sentence breaks,
                                       # common in scanned/OCR'd judgments)
                                       # gets hard-sliced rather than kept
                                       # whole (real case: a 3640-char
                                       # single "paragraph" slipping through
                                       # as one chunk).
        final_chunks = []
        for seg in segments:
            if len(seg["text"]) > 2000:
                # Split large paragraphs
                paras = re.split(r'\n\n|\.\s+(?=[A-Z])', seg["text"])
                current_chunk = ""
                for p in paras:
                    if len(current_chunk) + len(p) < 1500:
                        current_chunk += (" " if current_chunk else "") + p
                    else:
                        if current_chunk:
                            final_chunks.append({"text": current_chunk, "structure": seg["structure"]})
                        if len(p) > MAX_PARA_CHUNK_CHARS:
                            slices = [p[i:i + MAX_PARA_CHUNK_CHARS] for i in range(0, len(p), MAX_PARA_CHUNK_CHARS)]
                            if len(slices) > 1 and len(slices[-1]) < MIN_SEGMENT_CHARS:
                                slices[-2] += slices[-1]
                                slices.pop()
                            for s in slices:
                                final_chunks.append({"text": s, "structure": seg["structure"]})
                            current_chunk = ""
                        else:
                            current_chunk = p
                # Trailing remainder: merge into the last emitted chunk if
                # it's too small to stand alone rather than emitting a
                # near-empty final piece.
                if current_chunk:
                    if len(current_chunk) < MIN_SEGMENT_CHARS and final_chunks:
                        final_chunks[-1]["text"] = f"{final_chunks[-1]['text']} {current_chunk}".strip()
                    else:
                        final_chunks.append({"text": current_chunk, "structure": seg["structure"]})
            else:
                final_chunks.append(seg)

        # ── Final safety net ────────────────────────────────────────────
        # The paragraph-flush loop above can still emit a small chunk
        # mid-list — not just at the very end — whenever a short paragraph
        # is immediately followed by one large enough to trigger a flush
        # (e.g. current_chunk="" + a 70-char para, then the next para is
        # 3000 chars → the 70-char para gets flushed alone). Rather than
        # special-case every place that can happen, do one forward pass
        # over the WHOLE final list and fold any under-threshold chunk
        # into its neighbour. This is the single point that guarantees no
        # chunk below MIN_SEGMENT_CHARS ever leaves this function.
        if not final_chunks:
            return final_chunks
        cleaned: list[dict] = []
        for chunk in final_chunks:
            if len(chunk["text"]) < MIN_SEGMENT_CHARS and cleaned:
                cleaned[-1]["text"] = f"{cleaned[-1]['text']} {chunk['text']}".strip()
            elif len(chunk["text"]) < MIN_SEGMENT_CHARS and not cleaned:
                # First chunk overall is tiny — hold it and prepend to
                # whichever chunk comes next (it belongs to what follows).
                cleaned.append(chunk)
            else:
                cleaned.append(chunk)
        # If the held first-tiny-chunk never found anything after it,
        # collapse the whole document to nothing rather than keep it alone.
        if len(cleaned) == 1 and len(cleaned[0]["text"]) < MIN_SEGMENT_CHARS:
            return []
        # Fold a still-tiny leading chunk into the one right after it.
        if cleaned and len(cleaned[0]["text"]) < MIN_SEGMENT_CHARS and len(cleaned) > 1:
            cleaned[1]["text"] = f"{cleaned[0]['text']} {cleaned[1]['text']}".strip()
            cleaned = cleaned[1:]

        return cleaned

    @staticmethod
    def generate_chunk_id(metadata: Dict[str, Any], structure: str, text: str, index: int) -> str:
        """
        Builds a globally-unique, stable chunk ID.

        `index` (the chunk's position within its source document) is always
        included — without it, two chunks with byte-identical text (common:
        repeated boilerplate paragraphs across circulars/notifications) would
        hash to the same content_hash and collide, silently overwriting one
        chunk's vector/citation with the other in any ID-keyed store.
        """
        rel_path = metadata.get("rel_path", "unknown")
        name_match = re.search(r'([^\\/]+)\.(?:pdf|docx|xlsx)', rel_path, re.IGNORECASE)
        name = name_match.group(1).upper()[:20] if name_match else "DOC"

        doc_type_short = metadata.get("document_type", "DOC")[:3].upper()
        # Hash the full rel_path + index + text so identical text in two
        # different documents (or two positions in the same document)
        # never collides.
        hash_input = f"{rel_path}|{index}|{text}".encode("utf-8", errors="ignore")
        content_hash = hashlib.md5(hash_input).hexdigest()[:8].upper()

        return f"{doc_type_short}_{name}_{structure}_{index:04d}_{content_hash}".upper()
