from app.generation.confidence import estimate_confidence
from app.generation.source_formatter import format_sources
from app.generation.synthesizer import synthesize_answer
from app.generation.safety import apply_safety_guards


def build_final_answer(question: str, context: str, chunks: list) -> str:
    """
    Builds the final, safe, demo-ready answer.
    """

    raw_answer = synthesize_answer(question, context)
    confidence = estimate_confidence(context)
    sources = format_sources(chunks)

    return apply_safety_guards(
        answer=raw_answer,
        confidence=confidence,
        sources=sources
    )
