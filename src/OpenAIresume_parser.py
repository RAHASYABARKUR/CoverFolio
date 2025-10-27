


import os
import json
import pdfplumber
from openai import OpenAI

# --- Step 1: Set your API key here ---


client = OpenAI()

# --- Step 2: Extract text from PDF ---
def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text.strip()

# --- Step 3: JSON structure template ---
resume_json_structure = {
    "Name": "",
    "Email": "",
    "Phone": "",
    "LinkedIn": "",
    "GitHub": "",
    "Education": [
        {"Degree": "", "Institution": "", "Year": ""}
    ],
    "Experience": [
        {"Company": "", "Role": "", "Years": "", "Role Summary": ""}
    ],
    "Projects": [
        {"Name": "", "Description": "", "Tech Stack": []}
    ],
    "Skills": [],
    "Extracurriculars": []
}

# --- Step 4: Main parser ---
def parse_resume(pdf_path):
    resume_text = extract_text_from_pdf(pdf_path)

    instruction = f"""
    You are an expert resume parser.
    Extract information from the following resume text strictly in valid JSON format matching this structure:
    {json.dumps(resume_json_structure, indent=4)}

    Rules:
    - Leave fields empty if not found.
    - Output only valid JSON (no markdown, no explanations).
    - Include LinkedIn, GitHub, Projects, and Extracurriculars if present.

    Resume text:
    {resume_text}
    """

    # Use 'chat.completions' for compatibility with 2.2.0
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": instruction}]
    )

    # Get response text
    response_text = response.choices[0].message.content.strip()

    # Try parsing JSON safely
    try:
        data = json.loads(response_text)
    except json.JSONDecodeError:
        print("⚠️ Warning: Model returned invalid JSON. Attempting to fix...")
        cleaned = response_text[response_text.find("{"):response_text.rfind("}")+1]
        data = json.loads(cleaned)

    return data

# --- Step 5: Run it ---
if __name__ == "__main__":
    pdf_path = "test/sampleResumes/RahasyaBarkurResume.pdf"
    result = parse_resume(pdf_path)
    print(json.dumps(result, indent=4))

