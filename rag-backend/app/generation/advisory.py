import openai
from app.config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, OPENAI_MODEL
from app.generation.prompts.advisory_prompt import ADVISORY_SYSTEM_PROMPT

# Reuse the client configuration
client = openai.OpenAI(
    base_url=OPENROUTER_BASE_URL,
    api_key=OPENROUTER_API_KEY
)

def generate_legal_advisory(user_input: str, context: str, subject: str = "GST Query") -> str:
    """
    Generates a formal Legal Advisory Opinion using the LLM.
    """
    
    # Format the prompt
    formatted_prompt = ADVISORY_SYSTEM_PROMPT.format(
        user_input=user_input,
        context=context,
        subject=subject
    )

    messages = [
        {"role": "system", "content": "You are a Senior GST Legal Consultant. Draft a professional legal opinion."},
        {"role": "user", "content": formatted_prompt}
    ]

    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL, # Using the paid/stable model for quality
            messages=messages,
            temperature=0.3, # Lower temperature for more formal/consistent output
            max_tokens=2000  # Allow for longer, detailed reports
        )
        
        advisory_content = response.choices[0].message.content.strip()
        return advisory_content

    except Exception as e:
        print(f"Error generating advisory: {e}")
        return f"## Error Generating Advisory\n\nWe encountered an issue: {str(e)}"
