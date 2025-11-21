from google import genai
from pydantic import BaseModel, Field
from typing import List, Optional
import pdfplumber
import json
import os

# ================================================================
# 1) Pydantic Schema (used for Gemini structured-output)
# ================================================================

class Education(BaseModel):
    degree: str = Field(description="Degree earned")
    institution: str = Field(description="Name of the institution")
    year: str = Field(description="Year or range, e.g. 2020 or 2020–2024")

class Experience(BaseModel):
    company: str = Field(description="Name of workplace")
    role: str = Field(description="Job title or role")
    years: str = Field(description="Years worked or range")
    role_summary: str = Field(description="1–2 sentence summary of responsibilities")

class Project(BaseModel):
    title: str = Field(description="Project title")
    description: str = Field(description="Short description of the project")
    technologies: List[str] = Field(description="List of technologies used")

class Resume(BaseModel):
    name: str = Field(description="Full name of the candidate")
    email: str = Field(description="Email address")
    phone: str = Field(description="Phone number")
    linkedin: str = Field(description="LinkedIn profile URL")
    github: str = Field(description="GitHub profile URL")
    education: List[Education]
    experience: List[Experience]
    projects: List[Project]
    skills: List[str]
    extracurriculars: List[str]


# ================================================================
# 2) Extract text from PDF
# ================================================================

def extract_text_from_pdf(pdf_path: str) -> str:
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


# ================================================================
# 3) Gemini structured-output resume parsing
# ================================================================

import time
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable

def call_gemini_with_retry(client, model, prompt, schema, max_retries=5):
    """
    Handles 503 UNAVAILABLE + 429 rate limits with exponential backoff.
    """
    delay = 2  # seconds

    for attempt in range(1, max_retries + 1):
        try:
            return client.models.generate_content(
                model=model,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": schema,
                },
            )

        except (ResourceExhausted, ServiceUnavailable) as e:
            print(f"⚠️ Gemini overload attempt {attempt}/{max_retries}: {e}")
            
            if attempt == max_retries:
                raise e  # rethrow final attempt

            time.sleep(delay)
            delay *= 2  # exponential backoff 2s → 4s → 8s → 16s

        except Exception as e:
            print("❌ Unexpected Gemini error:", e)
            raise e


def parse_resume_gemini(pdf_path: str, api_key: str) -> dict:
    resume_text = extract_text_from_pdf(pdf_path)

    client = genai.Client(api_key=api_key)
    schema = Resume.model_json_schema()

    prompt = f"""
Please extract structured resume information from the text below.

Follow the schema strictly.

Resume Text:
{resume_text}
"""

    # ---- NEW LINE: using retry-safe wrapper ----
    response = call_gemini_with_retry(
        client,
        model="gemini-2.5-flash-lite",
        prompt=prompt,
        schema=schema,
        max_retries=5
    )

    resume_obj = Resume.model_validate_json(response.text)
    return resume_obj.model_dump()


# ================================================================
# 4) Main entry point
# ================================================================

if __name__ == "__main__":
    # api_key = "YOUR_API_KEY"
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    result = parse_resume_gemini("RahasyaBarkurResume.pdf", api_key)
    print(json.dumps(result, indent=2))
