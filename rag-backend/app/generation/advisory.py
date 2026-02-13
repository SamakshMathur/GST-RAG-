import openai
import os
import hashlib
import json
from diskcache import Cache
from app.config import (
    OPENAI_API_KEY, 
    LLM_MODEL, 
    CACHE_DIR,
    DATA_DIR
)
from app.generation.prompts.advisory_prompt import ADVISORY_SYSTEM_PROMPT
from app.generation.pdf_report import PDFReportGenerator

# Initialize Cache
cache = Cache(CACHE_DIR)

# Initialize PDF Generator
# Reports go to RAG_INFORMATION_DATABASE/generated_reports for easy serving
REPORTS_DIR = os.path.join(DATA_DIR, "generated_reports")
pdf_gen = PDFReportGenerator(output_dir=REPORTS_DIR)

# Client setup
client = openai.OpenAI(api_key=OPENAI_API_KEY)

def generate_legal_advisory(user_input: str, context: str, subject: str = "GST Query") -> dict:
    """
    Generates a formal Legal Advisory Opinion using GPT-4o-mini + Caching + PDF.
    Returns: {"content": str, "pdf_url": str}
    """
    
    # 1. Check Cache (Speed Engine)
    # Create a unique key based on the input
    query_hash = hashlib.md5((user_input + context[:100]).encode()).hexdigest()
    cache_key = f"advisory_{query_hash}"
    
    if cache_key in cache:
        print(f"Serving from Cache: {cache_key}")
        return cache[cache_key]

    # 2. Format Prompt
    formatted_prompt = ADVISORY_SYSTEM_PROMPT.format(
        user_input=user_input,
        context=context,
        subject=subject
    )

    messages = [
        {"role": "system", "content": "You are a Senior Supreme Court Advocate. Draft a professional legal opinion."},
        {"role": "user", "content": formatted_prompt}
    ]

    try:
        # 3. Call LLM (Intelligence Engine)
        print(f"Calling OpenAI ({LLM_MODEL})...")
        response = client.chat.completions.create(
            model=LLM_MODEL, 
            messages=messages,
            temperature=0.3, 
            max_tokens=2500 
        )
        
        advisory_content = response.choices[0].message.content.strip()

        # 4. Generate PDF (Output Engine)
        filename = f"Advisory_{query_hash[:8]}.pdf"
        pdf_path = pdf_gen.generate_report(advisory_content, filename=filename)
        
        # 5. Construct Result
        result = {
            "content": advisory_content,
            "pdf_url": f"/api/documents/view?category=reports&filename={filename}",
            "cached": False
        }

        # 6. Save to Cache
        cache[cache_key] = {**result, "cached": True} # Mark as cached for next time
        
        return result

    except Exception as e:
        print(f"Error generating advisory: {e}")
        return {
            "content": f"## Error Generating Advisory\n\nWe encountered an issue: {str(e)}",
            "pdf_url": None
        }
