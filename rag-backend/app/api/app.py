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


# ---------- Request / Response ----------
class QuestionRequest(BaseModel):
    question: str


class AnswerResponse(BaseModel):
    answer: str
    confidence: float
    intent: str
    sources: str


# ---------- Load Retriever ONCE ----------
retriever = Retriever(
    index_path=Path("vectordb/index.faiss"),
    chunks_path=Path("data/chunks/chunks.jsonl")
)


# ---------- Endpoint ----------
@app.post("/ask", response_model=AnswerResponse)
def ask_question(req: QuestionRequest):

    question = req.question.strip()

    # Intent
    intent_info = classify_intent(question)
    intent = intent_info["intent"]

    # Routing
    route = route_query(question)

    # Retrieval
    chunks = retriever.search(
        query=question,
        top_k=5,
        allowed_sources=route["use_sources"]
    )

    # Context
    context = build_context(chunks)

    # Final Answer (Phase 9 + 10 + 11 logic)
    final_answer = build_final_answer(question, context, chunks)

    return {
        "answer": final_answer,
        "confidence": intent_info.get("confidence", 0.5),
        "intent": intent,
        "sources": "See answer text"
    }
