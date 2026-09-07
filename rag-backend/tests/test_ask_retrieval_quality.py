"""Regression tests for GST-RAG retrieval quality fixes.

Validates:
1. Document-level circular/notification metadata inheritance across sibling chunks.
2. Direct reference lookup pinning all substantive pages of multi-chunk circulars.
3. Explicit-reference priority preventing taxonomy dilution.
4. Intent-aware evidence resolution prioritizing explicitly requested circulars
   while strictly preserving the universal statutory/case-law authority hierarchy for general queries.
"""
from __future__ import annotations

import os
from typing import Any, Dict, List
import pytest

from app.dependencies import get_retriever
from app.retrieval.retriever import Retriever
from app.retrieval.authority_taxonomy import classify_query_authority
from app.retrieval.evidence_resolver import resolve_evidence


@pytest.fixture(scope="module")
def retriever_instance() -> Retriever:
    """Fixture providing an initialized Retriever instance."""
    return get_retriever()


def test_circular_sibling_metadata_inheritance(retriever_instance: Retriever):
    """Test 1: All chunks belonging to the same Circular 184 document inherit CIRCULAR_184.

    Validates sibling identity dynamically via rel_path as well as checking the known
    deterministic fixture indices (4586, 4587, 4588, 4589).
    """
    retriever = retriever_instance
    cir184_indices: List[int] = []

    # Find all chunks from Circular 184 PDF dynamically by rel_path
    for idx, chunk in enumerate(retriever.chunks):
        meta = chunk.get("metadata") or {}
        rel_path = (chunk.get("rel_path") or meta.get("rel_path") or "").replace("\\", "/").lower()
        if "cir-184-16-2022" in rel_path or "184_16_2022" in rel_path:
            cir184_indices.append(idx)

    # In our deterministic corpus, there should be 4 chunks (e.g. 4586, 4587, 4588, 4589)
    assert len(cir184_indices) >= 4, f"Expected at least 4 chunks for Circular 184, found {len(cir184_indices)}"

    # Check known fixture indices are in cir184_indices if they match the corpus
    fixture_indices = [4586, 4587, 4588, 4589]
    for fi in fixture_indices:
        if fi < len(retriever.chunks):
            chunk_rel = (retriever.chunks[fi].get("rel_path") or retriever.chunks[fi].get("metadata", {}).get("rel_path", "")).lower()
            if "cir-184" in chunk_rel:
                assert fi in cir184_indices

    # Verify every sibling chunk has CIRCULAR_184 in metadata provision_keys
    for idx in cir184_indices:
        chunk = retriever.chunks[idx]
        meta = chunk.get("metadata") or {}
        keys = meta.get("provision_keys", [])
        assert "CIRCULAR_184" in keys, f"Chunk {idx} ({meta.get('rel_path')}) missing CIRCULAR_184 in provision_keys: {keys}"

    # Verify provision_index maps CIRCULAR_184 to all sibling chunk indices
    indexed_indices = retriever._provision_index.get("CIRCULAR_184", [])
    for idx in cir184_indices:
        assert idx in indexed_indices, f"Chunk {idx} not in retriever._provision_index['CIRCULAR_184']"


def test_direct_ref_lookup_covers_substantive_pages(retriever_instance: Retriever):
    """Test 2: Direct ref lookup pins all substantive pages of Circular 184.

    Ensures that chunks beyond the cover page (chunk_index 1 and 2) are pinned
    and not cut off by an overly restrictive per-key cap.
    """
    retriever = retriever_instance
    pinned = retriever._direct_ref_lookup(["CIRCULAR_184"])

    assert len(pinned) >= 4, f"Expected at least 4 pinned chunks for CIRCULAR_184, got {len(pinned)}"

    chunk_indices = []
    for c in pinned:
        meta = c.get("metadata") or {}
        ci = meta.get("chunk_index")
        if ci is not None:
            chunk_indices.append(ci)

    # Verify substantive pages (chunk_index 1, 2) are present
    assert 0 in chunk_indices, "Missing cover page (chunk_index 0)"
    assert 1 in chunk_indices, "Missing substantive page 1 (chunk_index 1)"
    assert 2 in chunk_indices, "Missing substantive page 2 (chunk_index 2)"
    assert 3 in chunk_indices, "Missing substantive page 3 (chunk_index 3)"


def test_explicit_circular_query_preserves_requested_candidates(retriever_instance: Retriever):
    """Test 3: Explicit circular query suppresses generic taxonomy circular flooding."""
    query = "Clarification regarding GST on transportation of goods to place outside India under Circular No. 184/16/2022-GST"

    # Verify authority taxonomy does not inject unrelated default circulars (like CIRCULAR_125, 135)
    tax = classify_query_authority(query)
    assert "CIRCULAR_125" not in tax.get("circulars", [])
    assert "CIRCULAR_135" not in tax.get("circulars", [])

    # Verify direct ref lookup contains Circular 184
    retriever = retriever_instance
    explicit_refs = [r for r in ["CIRCULAR_184"] if r in retriever._provision_index]
    pinned = retriever._direct_ref_lookup(explicit_refs)
    assert any("cir-184-16-2022" in (c.get("rel_path") or c.get("metadata", {}).get("rel_path", "")).lower() for c in pinned)


def test_explicit_circular_evidence_precedence():
    """Test 4: Intent-aware evidence resolution.

    Verifies BOTH:
    1. An explicitly requested Circular 184 candidate receives primary-evidence treatment
       because it matches the requested reference; and
    2. A general query with no explicit circular/notification continues using the existing
       statutory/case-law authority hierarchy.
    """
    # Mock chunks representing different authority levels with identical base rerank scores
    cir_184_chunk = {
        "chunk_id": "cir_184_p1",
        "rel_path": "circular/cir-184-16-2022.pdf",
        "text": "Circular No. 184/16/2022-GST clarification on transportation of goods outside India",
        "_rerank_score": 0.85,
        "metadata": {
            "rel_path": "circular/cir-184-16-2022.pdf",
            "provision_keys": ["CIRCULAR_184"],
        },
    }

    sc_chunk = {
        "chunk_id": "sc_case_1",
        "rel_path": "case_law/supreme court/mohit_minerals.pdf",
        "text": "Supreme Court ruling on ocean freight and GST provisions",
        "_rerank_score": 0.86,
        "metadata": {
            "rel_path": "case_law/supreme court/mohit_minerals.pdf",
            "provision_keys": ["CGST_SEC_16"],
        },
    }

    act_chunk = {
        "chunk_id": "act_sec_16",
        "rel_path": "act/cgst_act_2017.pdf",
        "text": "Section 16 Eligibility and conditions for taking input tax credit",
        "_rerank_score": 0.86,
        "metadata": {
            "rel_path": "act/cgst_act_2017.pdf",
            "provision_keys": ["CGST_SEC_16"],
        },
    }

    chunks_pool = [sc_chunk, act_chunk, cir_184_chunk]

    # 1. Explicit Circular 184 query -> Circular 184 must rank #1 due to query-intent match
    explicit_query = "What is the clarification in Circular No. 184/16/2022-GST regarding transportation of goods?"
    resolved_explicit = resolve_evidence(chunks_pool, explicit_query)

    assert resolved_explicit[0]["chunk_id"] == "cir_184_p1", (
        f"Expected Circular 184 to be primary evidence for explicit query, got {resolved_explicit[0]['chunk_id']}"
    )
    assert len(resolved_explicit[0]["_evidence_exact_refs"]) > 0
    assert resolved_explicit[0]["_evidence_resolution_score"] > resolved_explicit[1]["_evidence_resolution_score"]

    # 2. General query without explicit circular -> Universal statutory/case-law hierarchy must govern
    general_query = "What are the rules and precedents for transportation of goods?"
    resolved_general = resolve_evidence(chunks_pool, general_query)

    # Supreme Court (rank 1) and Act (rank 2) must outrank Circular (rank 5)
    assert resolved_general[0]["chunk_id"] == "sc_case_1", (
        f"Expected Supreme Court precedent to rank #1 for general query, got {resolved_general[0]['chunk_id']}"
    )
    assert resolved_general[1]["chunk_id"] == "act_sec_16", (
        f"Expected Act to rank #2 for general query, got {resolved_general[1]['chunk_id']}"
    )
    assert resolved_general[2]["chunk_id"] == "cir_184_p1", (
        f"Expected Circular to rank #3 for general query, got {resolved_general[2]['chunk_id']}"
    )


def test_non_explicit_query_authority_hierarchy_unchanged():
    """Test 5: Non-explicit query authority hierarchy remains strictly intact."""
    high_court_chunk = {
        "chunk_id": "hc_1",
        "rel_path": "case_law/high court/judgment_1.pdf",
        "text": "High court judgment on input tax credit",
        "_rerank_score": 0.80,
        "metadata": {"rel_path": "case_law/high court/judgment_1.pdf"},
    }
    notification_chunk = {
        "chunk_id": "notif_1",
        "rel_path": "notification/notif_12_2017.pdf",
        "text": "Notification No. 12/2017 Central Tax Rate",
        "_rerank_score": 0.80,
        "metadata": {"rel_path": "notification/notif_12_2017.pdf"},
    }
    circular_chunk = {
        "chunk_id": "cir_1",
        "rel_path": "circular/cir_99.pdf",
        "text": "CBIC circular guidelines",
        "_rerank_score": 0.80,
        "metadata": {"rel_path": "circular/cir_99.pdf"},
    }
    commentary_chunk = {
        "chunk_id": "icai_1",
        "rel_path": "commentary/icai_guide.pdf",
        "text": "ICAI technical guide on GST",
        "_rerank_score": 0.80,
        "metadata": {"rel_path": "commentary/icai_guide.pdf"},
    }

    pool = [commentary_chunk, circular_chunk, notification_chunk, high_court_chunk]
    resolved = resolve_evidence(pool, "General query on tax rate applicability")

    # Order by authority rank: High Court (3) -> Notification (4) -> Circular (5) -> Commentary (7)
    expected_order = ["hc_1", "notif_1", "cir_1", "icai_1"]
    actual_order = [c["chunk_id"] for c in resolved]
    assert actual_order == expected_order, f"Expected order {expected_order}, got {actual_order}"
