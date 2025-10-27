"""
Cover Letter Generation Service
Generates personalized cover letters using portfolio data and job requirements.
"""

import re
from typing import Dict, List, Optional
from django.contrib.auth import get_user_model

User = get_user_model()


class CoverLetterGenerator:
    """Generate cover letters using template-based approach with portfolio data."""
    
    def __init__(self, user: User):
        self.user = user
        self.portfolio = None
        try:
            self.portfolio = user.portfolio
        except:
            pass
    
    def generate_cover_letter(self, role: str, company_name: str, job_description: str, additional_info: str = "") -> str:
        """
        Generate a cover letter based on user's portfolio and job requirements.
        
        Args:
            role: Job position/role
            company_name: Target company name
            job_description: Job description text
            additional_info: Additional user-provided information
            
        Returns:
            Generated cover letter content
        """
        # Extract key requirements from job description
        requirements = self._extract_requirements(job_description)
        
        # Get relevant portfolio data
        portfolio_data = self._get_portfolio_data()
        
        # Generate cover letter using template
        cover_letter = self._build_cover_letter(
            role=role,
            company_name=company_name,
            requirements=requirements,
            portfolio_data=portfolio_data,
            additional_info=additional_info
        )
        
        return cover_letter
    
    def _extract_requirements(self, job_description: str) -> Dict[str, List[str]]:
        """Extract key requirements from job description."""
        requirements = {
            'skills': [],
            'experience': [],
            'qualifications': []
        }
        
        # Common skill keywords to look for
        skill_keywords = [
            'python', 'javascript', 'react', 'django', 'node', 'sql', 'aws', 'docker',
            'kubernetes', 'git', 'agile', 'scrum', 'leadership', 'communication',
            'problem solving', 'analytical', 'creative', 'teamwork', 'project management'
        ]
        
        # Common experience keywords
        experience_keywords = [
            'years of experience', 'experience with', 'proven track record',
            'demonstrated ability', 'hands-on experience', 'industry experience'
        ]
        
        # Extract skills
        job_lower = job_description.lower()
        for skill in skill_keywords:
            if skill in job_lower:
                requirements['skills'].append(skill.title())
        
        # Extract experience requirements
        for exp_keyword in experience_keywords:
            if exp_keyword in job_lower:
                # Try to extract the context around the keyword
                pattern = rf'.{{0,50}}{re.escape(exp_keyword)}.{{0,50}}'
                matches = re.findall(pattern, job_description, re.IGNORECASE)
                requirements['experience'].extend(matches)
        
        return requirements
    
    def _get_portfolio_data(self) -> Dict:
        """Get relevant data from user's portfolio."""
        if not self.portfolio:
            return {
                'name': self.user.get_full_name() or self.user.email.split('@')[0],
                'email': self.user.email,
                'skills': [],
                'experiences': [],
                'projects': [],
                'education': []
            }
        
        return {
            'name': self.user.get_full_name() or self.user.email.split('@')[0],
            'email': self.user.email,
            'bio': self.portfolio.bio or "",
            'skills': [skill.name for skill in self.portfolio.skills.all()[:10]],
            'experiences': [
                {
                    'company': exp.company,
                    'position': exp.position,
                    'description': exp.description,
                    'is_current': exp.is_current
                }
                for exp in self.portfolio.experiences.all()[:3]
            ],
            'projects': [
                {
                    'title': proj.title,
                    'description': proj.description,
                    'tech_stack': proj.tech_stack
                }
                for proj in self.portfolio.projects.all()[:3]
            ],
            'education': [
                {
                    'institution': edu.institution,
                    'degree': edu.get_degree_display(),
                    'field_of_study': edu.field_of_study
                }
                for edu in self.portfolio.education.all()[:2]
            ]
        }
    
    def _build_cover_letter(self, role: str, company_name: str, requirements: Dict, 
                          portfolio_data: Dict, additional_info: str) -> str:
        """Build the cover letter using template and data."""
        
        # Get user's name
        name = portfolio_data['name']
        
        # Get most relevant skills
        relevant_skills = self._match_skills(portfolio_data['skills'], requirements['skills'])
        
        # Get most relevant experience
        relevant_experience = self._get_relevant_experience(portfolio_data['experiences'], requirements)
        
        # Get most relevant project
        relevant_project = self._get_relevant_project(portfolio_data['projects'], requirements)
        
        # Build cover letter
        cover_letter = f"""Dear Hiring Manager,

I am writing to express my strong interest in the {role} position at {company_name or 'your company'}. With my background in {', '.join(relevant_skills[:3]) if relevant_skills else 'technology and software development'}, I am confident that I would be a valuable addition to your team.

"""
        
        # Add experience paragraph
        if relevant_experience:
            exp = relevant_experience[0]
            cover_letter += f"""In my current role as {exp['position']} at {exp['company']}, I have gained extensive experience in {', '.join(relevant_skills[:2]) if relevant_skills else 'software development'}. {exp['description'][:200]}... This experience has equipped me with the skills necessary to excel in the {role} position.

"""
        
        # Add project paragraph
        if relevant_project:
            proj = relevant_project[0]
            cover_letter += f"""One of my notable achievements includes {proj['title']}, where I {proj['description'][:150]}... This project demonstrates my ability to {', '.join(proj['tech_stack'][:3]) if proj['tech_stack'] else 'deliver high-quality solutions'} and work effectively in a team environment.

"""
        
        # Add skills paragraph
        if relevant_skills:
            cover_letter += f"""My technical expertise includes {', '.join(relevant_skills[:5])}, which directly aligns with the requirements for this position. I am particularly excited about the opportunity to apply these skills in {company_name or 'your organization'}'s innovative environment.

"""
        
        # Add additional info if provided
        if additional_info:
            cover_letter += f"""Additionally, {additional_info[:200]}...

"""
        
        # Add closing paragraph
        cover_letter += f"""I am enthusiastic about the opportunity to contribute to {company_name or 'your company'}'s continued success and would welcome the chance to discuss how my skills and experience can benefit your team. Thank you for considering my application.

Sincerely,
{name}

{portfolio_data['email']}"""
        
        return cover_letter
    
    def _match_skills(self, user_skills: List[str], required_skills: List[str]) -> List[str]:
        """Match user skills with required skills."""
        matched_skills = []
        user_skills_lower = [skill.lower() for skill in user_skills]
        
        for req_skill in required_skills:
            for user_skill in user_skills_lower:
                if req_skill.lower() in user_skill or user_skill in req_skill.lower():
                    matched_skills.append(req_skill)
                    break
        
        return matched_skills
    
    def _get_relevant_experience(self, experiences: List[Dict], requirements: Dict) -> List[Dict]:
        """Get most relevant work experience."""
        if not experiences:
            return []
        
        # For now, return the most recent experience
        return experiences[:1]
    
    def _get_relevant_project(self, projects: List[Dict], requirements: Dict) -> List[Dict]:
        """Get most relevant project."""
        if not projects:
            return []
        
        # For now, return the first project
        return projects[:1]


def generate_cover_letter_for_user(user: User, role: str, company_name: str, 
                                 job_description: str, additional_info: str = "") -> str:
    """
    Convenience function to generate a cover letter for a user.
    
    Args:
        user: User instance
        role: Job position/role
        company_name: Target company name
        job_description: Job description text
        additional_info: Additional user-provided information
        
    Returns:
        Generated cover letter content
    """
    generator = CoverLetterGenerator(user)
    return generator.generate_cover_letter(role, company_name, job_description, additional_info)
