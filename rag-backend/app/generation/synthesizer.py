import openai
import os
from app.config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, OPENAI_MODEL
from app.generation.prompt import SYSTEM_PROMPT

# Use OpenRouter for the LLM (Chat)
if not OPENROUTER_API_KEY:
    # If key is missing, we might warn or fail. 
    # For now, let's print a warning but allow init (it will fail at runtime if not set)
    print("WARNING: OPENROUTER_API_KEY is not set. Chat generation will fail.")

client = openai.OpenAI(
    base_url=OPENROUTER_BASE_URL,
    api_key=OPENROUTER_API_KEY
)

def synthesize_answer(question: str, context: str) -> str:
    """
    Synthesizes an answer using OpenRouter (StepFun model) based on the provided context.
    """
    
    formatted_system_prompt = SYSTEM_PROMPT.format(context=context)
    
    # --- PASS 1: Initial Draft ---
    messages = [
        {"role": "system", "content": formatted_system_prompt},
        {"role": "user", "content": question}
    ]

    try:
        response_1 = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages
            # temperature=0.0
        )
        draft_answer = response_1.choices[0].message.content.strip()
        
        # --- PASS 2: Self-Critique & Verification Loop ---
        # "Contradiction Check" as requested
        critique_prompt = (
            "You are a Senior GST Editor. Review the DRAFT ANSWER below against the provided CONTEXT.\n"
            "1. Check if any Circular/Notification in the context contradicts the answer.\n"
            "2. Check if any exception mentioned in the context was missed.\n"
            "3. If the draft is correct and complete, output it exactly as is.\n"
            "4. If there are errors/omissions, rewrite the answer using the strict Legal Reasoning Template.\n\n"
            f"DRAFT ANSWER:\n{draft_answer}\n\n"
            f"CONTEXT:\n{context}"
        )
        
        verification_messages = [
            {"role": "system", "content": "You are a meticulous legal editor. Ensure 100% accuracy."},
            {"role": "user", "content": critique_prompt}
        ]
        
        response_2 = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=verification_messages
        )
        
        final_answer = response_2.choices[0].message.content.strip()
        
        return final_answer

    except Exception as e:
        print(f"Error in synthesize_answer: {e}")
        return (
            "I encountered an error while generating the answer. "
            f"Error details: {str(e)}"
        )
