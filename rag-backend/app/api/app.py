from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
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
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api import documents
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])

from app.api import advisory
app.include_router(advisory.router, prefix="/api/advisory", tags=["Advisory"])

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
    reasoning: Optional[Any] = None

# ---------- Lazy Load Retriever ----------
from app.dependencies import get_retriever

# ---------- Endpoint ----------
@app.get("/")
def health_check():
    return {"status": "active", "message": "LETA Backend is Running normally"}

@app.post("/ask", response_model=AnswerResponse)
def ask_question(req: QuestionRequest):
    question = req.question.strip()
    intent_info = classify_intent(question)
    intent = intent_info["intent"]
    route = route_query(question)
    retriever = get_retriever()
    chunks = retriever.search(
        query=question,
        top_k=50,
        allowed_sources=route["use_sources"]
    )
    context = build_context(chunks)
    result = build_final_answer(question, context, chunks)
    
    if isinstance(result, dict):
        final_answer = result.get("content", "")
        reasoning = result.get("reasoning", None)
    else:
        final_answer = result
        reasoning = None

    seen_sources = set()
    source_list = []
    for c in chunks:
        key = (c.get("source", "Unknown"), c.get("page", 0))
        if key not in seen_sources:
            seen_sources.add(key)
            page_val = c.get("page")
            safe_page = int(page_val) if page_val is not None else 0
            source_list.append({
                "source": c.get("source", "Unknown"),
                "page": safe_page
            })

    # Calculate mock confidence for now
    confidence_score = 0.92 
    if chunks:
        # Use rerank score if available
        if "_rerank_score" in chunks[0]:
            confidence_score = chunks[0]["_rerank_score"]

    return {
        "answer": final_answer,
        "confidence": confidence_score,
        "intent": intent.upper(),
        "sources": source_list,
        "reasoning": reasoning
    }

# ---------- PDF Reporting Endpoint ----------
from fastapi.responses import Response
from app.generation.pdf_report import PDFReportGenerator
import os

pdf_gen = PDFReportGenerator(output_dir="data/generated_reports")

class PDFRequest(BaseModel):
    title: str
    content: str

@app.post("/generate-pdf")
def create_pdf(req: PDFRequest):
    # Use the class to generate PDF
    # We construct a filename
    filename = f"Report_{hash(req.title)}.pdf"
    pdf_path = pdf_gen.generate_report(req.content, filename)
    
    if not os.path.exists(pdf_path):
        return Response(status_code=500, content="Error generating PDF")
        
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=advisory_report.pdf"}
    )
