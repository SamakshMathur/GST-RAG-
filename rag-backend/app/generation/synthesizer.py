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
    
    messages = [
        {"role": "system", "content": formatted_system_prompt},
        {"role": "user", "content": question}
    ]

    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL, # "stepfun/step-3.5-flash:free"
            messages=messages,
            # temperature=0.0, # some models might default differently, strictly speaking 0 is good for facts
            # max_tokens=1500
        )
        
        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Error in synthesize_answer: {e}")
        return (
            "I encountered an error while generating the answer. "
            f"Error details: {str(e)}"
        )
