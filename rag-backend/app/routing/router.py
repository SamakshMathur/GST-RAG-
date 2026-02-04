from app.routing.intent_classifier import classify_intent


def route_query(question: str) -> dict:
    intent_info = classify_intent(question)
    intent = intent_info["intent"]

    if intent == "form_lookup":
        return {"use_sources": ["docx"], "mode": "text"}

    if intent == "rate_comparison":
        return {"use_sources": ["excel"], "mode": "structured"}

    if intent == "rate_lookup":
        return {"use_sources": ["excel", "pdf"], "mode": "hybrid"}

    if intent == "aar_lookup":
        return {"use_sources": ["pdf"], "mode": "text"}

    if intent == "jobwork_rate":
        return {"use_sources": ["pdf"], "mode": "text"}

    if intent == "act_section_lookup":
        return {"use_sources": ["excel"], "mode": "structured"}

    if intent == "procedure":
        return {"use_sources": ["docx", "pdf"], "mode": "text"}

    # --- FALLBACK ---
    return {"use_sources": ["pdf", "docx", "excel"], "mode": "general"}
