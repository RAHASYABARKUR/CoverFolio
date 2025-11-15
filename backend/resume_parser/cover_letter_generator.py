from google import genai
from typing import Dict, Any
import os


def generate_cover_letter_gemini(
    resume_data: Dict[str, Any],
    job_description: str,
    role: str,
    company_name: str = "",
    api_key: str = None
) -> str:
    """
    Generate a professional cover letter using Gemini API.
    
    Args:
        resume_data: Parsed resume data with name, experience, projects, skills, etc.
        job_description: The job posting description
        role: The position being applied for
        company_name: Name of the company (optional)
        api_key: Gemini API key
    
    Returns:
        Generated cover letter as a string
    """
    if not api_key:
        api_key = os.getenv('GEMINI_API_KEY')
    
    # Configure Gemini client (same as resume_parser_gemini.py)
    client = genai.Client(api_key=api_key)
    
    # Extract key information from resume
    candidate_name = resume_data.get('name', 'Candidate')
    email = resume_data.get('email', '')
    phone = resume_data.get('phone', '')
    
    # Format experience
    experience_text = ""
    if resume_data.get('experience'):
        experience_text = "\n\nKey Experience:\n"
        for exp in resume_data['experience'][:3]:  # Top 3 experiences
            experience_text += f"- {exp.get('role', '')} at {exp.get('company', '')}: {exp.get('role_summary', '')}\n"
    
    # Format projects
    projects_text = ""
    if resume_data.get('projects'):
        projects_text = "\n\nNotable Projects:\n"
        for proj in resume_data['projects'][:2]:  # Top 2 projects
            projects_text += f"- {proj.get('title', '')}: {proj.get('description', '')}\n"
    
    # Format skills
    skills_text = ""
    if resume_data.get('skills'):
        skills_text = f"\n\nKey Skills: {', '.join(resume_data['skills'][:10])}"
    
    # Create the prompt
    company_mention = f"at {company_name}" if company_name else ""
    
    prompt = f"""You are a professional cover letter writer. Create a compelling, professional cover letter for the following job application.

**Candidate Information:**
Name: {candidate_name}
Email: {email}
Phone: {phone}
{experience_text}
{projects_text}
{skills_text}

**Job Information:**
Position: {role} {company_mention}

**Job Description:**
{job_description}

**Instructions:**
1. Write a professional cover letter that:
   - Opens with enthusiasm for the specific role and company
   - Highlights 2-3 most relevant experiences/projects that match the job requirements
   - Demonstrates knowledge of the role and how the candidate's skills align
   - Shows personality while maintaining professionalism
   - Closes with a strong call to action

2. Format the letter properly with:
   - Candidate's contact information at the top
   - Date
   - Company name and hiring manager (if known, otherwise "Hiring Manager")
   - Professional greeting
   - 3-4 concise paragraphs
   - Professional closing

3. Keep the tone confident but not arrogant
4. Make it specific to THIS job posting, not generic
5. Length: 300-400 words

Generate ONLY the cover letter text, no additional commentary.
"""

    # Generate cover letter using the same method as resume parsing
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Error generating cover letter: {str(e)}")
        raise Exception(f"Failed to generate cover letter: {str(e)}")
