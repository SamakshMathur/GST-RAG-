from fastapi import FastAPI
from pydantic import BaseModel

from pathlib import Path

from app.retrieval.retriever import Retriever
from app.routing.router import route_query
from app.generation.context_builder import build_context
from app.generation.final_answer import build_final_answer
from app.routing.intent_classifier import classify_intent


# ---------- App ----------
app = FastAPI(
    title="GST Legal RAG API",
    version="1.0",
    description="In-house GST knowledge assistant"
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["*"],  # Wildcard with credentials is often blocked
    allow_origin_regex="https?://.*", # Allow basic HTTP and HTTPS patterns
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import documents
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])

from app.api import advisory
app.include_router(advisory.router, prefix="/api/advisory", tags=["Advisory"])


# ---------- Request / Response ----------
from typing import List, Dict, Any

# ---------- Request / Response ----------
class QuestionRequest(BaseModel):
    question: str


class Source(BaseModel):
    source: str
    page: int


class AnswerResponse(BaseModel):
    answer: str
    confidence: float
    intent: str
    sources: List[Source]


# ---------- Lazy Load Retriever ----------
from app.dependencies import get_retriever


# ---------- Endpoint ----------
@app.get("/")
def health_check():
    return {"status": "active", "message": "LETA Backend is Running normally"}

@app.post("/ask", response_model=AnswerResponse)
def ask_question(req: QuestionRequest):

    question = req.question.strip()

    # Intent
    intent_info = classify_intent(question)
    intent = intent_info["intent"]

    # Routing
    route = route_query(question)

    # Retrieval
    retriever = get_retriever()
    chunks = retriever.search(
        query=question,
        top_k=3000,
        allowed_sources=route["use_sources"]
    )

    # Context
    context = build_context(chunks)

    # Final Answer (Phase 9 + 10 + 11 logic)
    # Answer Generation (With Reasoning Metadata)
    result = build_final_answer(question, context, chunks)
    
    # Check if result is a dict (standard path now) or string (fallback safety)
    if isinstance(result, dict):
        final_answer = result.get("content", "")
        reasoning = result.get("reasoning", None)
    else:
        final_answer = result
        reasoning = None

    # Extract unique sources
    seen_sources = set()
    source_list = []
    for c in chunks:
        # Create a unique key for deduplication
        key = (c.get("source", "Unknown"), c.get("page", 0))
        if key not in seen_sources:
            seen_sources.add(key)
            page_val = c.get("page")
            safe_page = int(page_val) if page_val is not None else 0
            source_list.append({
                "source": c.get("source", "Unknown"),
                "page": safe_page
            })

    return {
        "answer": final_answer,
        "confidence": 0.95 if final_answer and "I cannot find" not in final_answer else 0.0,
        "intent": intent,
        "sources": source_list,
        "reasoning": reasoning  # Passing real reasoning to frontend
    }
