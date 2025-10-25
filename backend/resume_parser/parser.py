"""
Resume text parser to extract structured data.
Uses regex patterns and heuristics to parse resume text into JSON format.
"""
import re
import json
from datetime import datetime


class ResumeParser:
    """Parse raw resume text into structured JSON data."""
    
    def __init__(self, text):
        self.text = text
        self.lines = [line.strip() for line in text.split('\n') if line.strip()]
        self.data = {
            'name': '',
            'email': '',
            'phone': '',
            'linkedin': '',
            'github': '',
            'education': [],
            'experience': [],
            'projects': [],
            'skills': [],
            'extracurriculars': []
        }
    
    def parse(self):
        """Main parsing method."""
        self._extract_contact_info()
        self._extract_education()
        self._extract_experience()
        self._extract_projects()
        self._extract_skills()
        self._extract_extracurriculars()
        return self.data
    
    def _extract_contact_info(self):
        """Extract name, email, phone, LinkedIn, GitHub."""
        # Email pattern
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, self.text)
        if email_match:
            self.data['email'] = email_match.group()
        
        # Phone pattern (various formats)
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phone_match = re.search(phone_pattern, self.text)
        if phone_match:
            self.data['phone'] = phone_match.group()
        
        # LinkedIn pattern
        linkedin_pattern = r'linkedin\.com/in/[\w-]+'
        linkedin_match = re.search(linkedin_pattern, self.text, re.IGNORECASE)
        if linkedin_match:
            self.data['linkedin'] = 'https://' + linkedin_match.group()
        
        # GitHub pattern
        github_pattern = r'github\.com/[\w-]+'
        github_match = re.search(github_pattern, self.text, re.IGNORECASE)
        if github_match:
            self.data['github'] = 'https://' + github_match.group()
        
        # Name is typically the first line (if not a section header)
        if self.lines and not any(keyword in self.lines[0].lower() 
                                  for keyword in ['resume', 'cv', 'curriculum']):
            self.data['name'] = self.lines[0]
    
    def _extract_education(self):
        """Extract education entries."""
        education_keywords = ['education', 'academic', 'university', 'college', 'school']
        education_section = self._find_section(education_keywords)
        
        if not education_section:
            return
        
        # Degree patterns
        degree_patterns = [
            r'(Bachelor|B\.?S\.?|B\.?A\.?|Master|M\.?S\.?|M\.?A\.?|PhD|Ph\.?D\.?|Doctor)',
            r'(Associate|A\.?S\.?|A\.?A\.?)'
        ]
        
        current_entry = None
        
        for line in education_section:
            # Check if this is a degree line
            is_degree = any(re.search(pattern, line, re.IGNORECASE) for pattern in degree_patterns)
            
            if is_degree:
                if current_entry:
                    self.data['education'].append(current_entry)
                
                current_entry = {
                    'degree': line,
                    'institution': '',
                    'year': '',
                    'gpa': ''
                }
            elif current_entry:
                # Check for GPA
                gpa_match = re.search(r'GPA:?\s*(\d\.\d+)', line, re.IGNORECASE)
                if gpa_match:
                    current_entry['gpa'] = gpa_match.group(1)
                
                # Check for year
                year_match = re.search(r'(19|20)\d{2}', line)
                if year_match:
                    current_entry['year'] = year_match.group()
                
                # If line has university/college keywords, it's likely the institution
                if any(word in line.lower() for word in ['university', 'college', 'institute', 'school']):
                    current_entry['institution'] = line
        
        if current_entry:
            self.data['education'].append(current_entry)
    
    def _extract_experience(self):
        """Extract work experience entries."""
        experience_keywords = ['experience', 'employment', 'work history', 'professional']
        experience_section = self._find_section(experience_keywords)
        
        if not experience_section:
            return
        
        current_entry = None
        
        for line in experience_section:
            # Check if this looks like a job title (often has keywords like engineer, developer, manager)
            job_keywords = ['engineer', 'developer', 'analyst', 'manager', 'specialist', 
                          'consultant', 'intern', 'associate', 'coordinator', 'lead']
            
            is_title = any(keyword in line.lower() for keyword in job_keywords)
            
            # Check for year pattern (might indicate dates)
            has_date = re.search(r'(19|20)\d{2}', line)
            
            if is_title and not current_entry:
                current_entry = {
                    'company': '',
                    'role': line,
                    'years': '',
                    'role_summary': ''
                }
            elif current_entry:
                if has_date and not current_entry['years']:
                    # Extract date range
                    date_match = re.search(r'(\w+\s+(19|20)\d{2})\s*[-–—]\s*(\w+\s+(19|20)\d{2}|Present)', line, re.IGNORECASE)
                    if date_match:
                        current_entry['years'] = date_match.group()
                elif not current_entry['company'] and not has_date:
                    # This might be the company name
                    current_entry['company'] = line
                elif current_entry['company']:
                    # Add to role summary
                    if current_entry['role_summary']:
                        current_entry['role_summary'] += ' ' + line
                    else:
                        current_entry['role_summary'] = line
                
                # If we hit another job title, save current and start new
                if is_title and current_entry.get('company'):
                    self.data['experience'].append(current_entry)
                    current_entry = {
                        'company': '',
                        'role': line,
                        'years': '',
                        'role_summary': ''
                    }
        
        if current_entry and current_entry.get('company'):
            self.data['experience'].append(current_entry)
    
    def _extract_projects(self):
        """Extract project entries."""
        project_keywords = ['projects', 'portfolio', 'work samples']
        project_section = self._find_section(project_keywords)
        
        if not project_section:
            return
        
        current_entry = None
        
        for line in project_section:
            # Project titles are often bold or capitalized
            if line.isupper() or (line and line[0].isupper() and len(line.split()) <= 5):
                if current_entry:
                    self.data['projects'].append(current_entry)
                
                current_entry = {
                    'title': line,
                    'description': '',
                    'technologies': []
                }
            elif current_entry:
                # Check for technologies (often in parentheses or after keywords)
                tech_match = re.search(r'(?:Technologies?|Tools?|Stack):\s*(.+)', line, re.IGNORECASE)
                if tech_match:
                    tech_list = tech_match.group(1)
                    current_entry['technologies'] = [t.strip() for t in re.split(r'[,;•|]', tech_list)]
                else:
                    # Add to description
                    if current_entry['description']:
                        current_entry['description'] += ' ' + line
                    else:
                        current_entry['description'] = line
        
        if current_entry:
            self.data['projects'].append(current_entry)
    
    def _extract_skills(self):
        """Extract skills list."""
        skill_keywords = ['skills', 'technical skills', 'competencies', 'expertise']
        skill_section = self._find_section(skill_keywords)
        
        if not skill_section:
            return
        
        for line in skill_section:
            # Skip lines that are just category headers
            if any(keyword in line.lower() for keyword in ['programming', 'languages', 'frameworks', 'tools', 'soft skills']):
                continue
            
            # Split by common delimiters
            skills = re.split(r'[,;•|]', line)
            for skill in skills:
                skill = skill.strip()
                if skill and len(skill) > 1:
                    self.data['skills'].append(skill)
    
    def _extract_extracurriculars(self):
        """Extract extracurricular activities."""
        extra_keywords = ['extracurricular', 'activities', 'involvement', 'leadership', 
                         'volunteer', 'awards', 'honors', 'achievements']
        extra_section = self._find_section(extra_keywords)
        
        if not extra_section:
            return
        
        for line in extra_section:
            if line and len(line) > 10:  # Filter out very short lines
                self.data['extracurriculars'].append(line)
    
    def _find_section(self, keywords):
        """Find and extract a section based on keywords."""
        section_lines = []
        in_section = False
        
        # Common section headers to detect when to stop
        all_sections = ['education', 'experience', 'projects', 'skills', 'extracurricular', 
                       'certifications', 'awards', 'references', 'summary', 'objective']
        
        for i, line in enumerate(self.lines):
            line_lower = line.lower()
            
            # Check if this line is a section header
            is_section_header = any(keyword in line_lower for keyword in all_sections)
            
            # Check if this is our target section
            if any(keyword in line_lower for keyword in keywords):
                in_section = True
                continue  # Skip the header itself
            
            # If we hit another section header, stop
            elif in_section and is_section_header:
                break
            
            # Add lines if we're in the section
            elif in_section:
                section_lines.append(line)
        
        return section_lines


def parse_resume_text(text):
    """
    Main function to parse resume text into structured data.
    
    Args:
        text (str): Raw resume text
    
    Returns:
        dict: Structured resume data
    """
    parser = ResumeParser(text)
    return parser.parse()
