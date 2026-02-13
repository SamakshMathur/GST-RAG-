import openai
from app.config import OPENAI_API_KEY, LLM_MODEL
from app.generation.prompt import SYSTEM_PROMPT

# Initialize OpenAI Client
if not OPENAI_API_KEY:
    print("WARNING: OPENAI_API_KEY not found in environment. Answer generation will fail.")

client = openai.OpenAI(api_key=OPENAI_API_KEY)

def synthesize_answer(question: str, context: str) -> str:
    """
    Synthesizes an answer using the primary LLM (GPT-4o-mini) based on the provided context.
    """
    if not OPENAI_API_KEY:
        return (
            "## ⚠️ **System Notice: OpenAI API Key Missing**\n\n"
            "The LETA Legal AI system is operational, but **Answer Generation** is currently disabled.\n\n"
            "**To enable AI capabilities:**\n"
            "1.  Open your `.env` file.\n"
            "2.  Add: `OPENAI_API_KEY=sk-...`\n"
            "3.  Restart the backend.\n\n"
            "*The Document Retrieval System remains active.*"
        )
    
    formatted_system_prompt = SYSTEM_PROMPT.format(context=context)
    
    # --- PASS 1: Initial Draft ---
    messages = [
        {"role": "system", "content": formatted_system_prompt},
        {"role": "user", "content": question}
    ]

    try:
        response_1 = client.chat.completions.create(
            model=LLM_MODEL,
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
            model=LLM_MODEL,
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
