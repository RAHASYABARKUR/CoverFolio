import os
import time
from google import genai
from google.genai import types


def chat_with_ai(message: str, context: str = None, max_retries: int = 3) -> str:
    """
    Send a message to Gemini AI and get a response.
    
    Args:
        message: User's message/query
        context: Optional context (e.g., resume data, cover letter content, portfolio info)
        max_retries: Maximum number of retry attempts
    
    Returns:
        AI response as string
    """
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    client = genai.Client(api_key=api_key)
    
    # Build the prompt with context if provided
    if context:
        full_prompt = f"""You are a helpful AI assistant for CoverFolio, a professional portfolio and resume management application.

Context Information:
{context}

User Query: {message}

Please provide a helpful, professional, and concise response. If the user is asking to summarize, refine, or rewrite content, focus on making it professional and impactful."""
    else:
        full_prompt = f"""You are a helpful AI assistant for CoverFolio, a professional portfolio and resume management application. 
Help users with their resumes, cover letters, portfolios, and career-related questions.

User Query: {message}

Please provide a helpful, professional, and concise response."""
    
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash-lite',
                contents=full_prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=1000,
                )
            )
            
            if response and response.text:
                return response.text.strip()
            else:
                raise ValueError("Empty response from Gemini API")
                
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"Attempt {attempt + 1} failed: {str(e)}. Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                raise Exception(f"Failed to get AI response after {max_retries} attempts: {str(e)}")
    
    raise Exception("Failed to generate AI response")


def chat_with_conversation_history(messages: list, max_retries: int = 3) -> str:
    """
    Chat with AI maintaining conversation history.
    
    Args:
        messages: List of message dictionaries with 'role' and 'content' keys
                 Example: [{'role': 'user', 'content': 'Hello'}, {'role': 'assistant', 'content': 'Hi there!'}]
        max_retries: Maximum number of retry attempts
    
    Returns:
        AI response as string
    """
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    client = genai.Client(api_key=api_key)
    
    # Convert messages to Gemini format
    conversation = """You are a helpful AI assistant for CoverFolio, a professional portfolio and resume management application.
Help users with their resumes, cover letters, portfolios, and career-related questions.

Conversation History:
"""
    
    for msg in messages:
        role = "User" if msg['role'] == 'user' else "Assistant"
        conversation += f"\n{role}: {msg['content']}"
    
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash-lite',
                contents=conversation,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=1000,
                )
            )
            
            if response and response.text:
                return response.text.strip()
            else:
                raise ValueError("Empty response from Gemini API")
                
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt
                print(f"Attempt {attempt + 1} failed: {str(e)}. Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                raise Exception(f"Failed to get AI response after {max_retries} attempts: {str(e)}")
    
    raise Exception("Failed to generate AI response")
