"""
Management command to reparse all resumes and update structured_data.
"""
from django.core.management.base import BaseCommand
from resume_parser.models import Resume
from resume_parser.parser import parse_resume_text


class Command(BaseCommand):
    help = 'Reparse all resumes and update structured_data field'

    def handle(self, *args, **options):
        resumes = Resume.objects.all()
        self.stdout.write(f'Found {resumes.count()} resume(s) to parse')
        
        for resume in resumes:
            self.stdout.write(f'\nProcessing resume ID {resume.id}: {resume.title}')
            
            if not resume.extracted_text:
                self.stdout.write(self.style.WARNING(f'  No extracted text found'))
                continue
            
            try:
                # Parse the text
                structured_data = parse_resume_text(resume.extracted_text)
                
                # Update the resume
                resume.structured_data = structured_data
                resume.save()
                
                self.stdout.write(self.style.SUCCESS(f'  ✓ Successfully parsed'))
                self.stdout.write(f'  Found:')
                self.stdout.write(f'    - Name: {structured_data.get("name", "N/A")}')
                self.stdout.write(f'    - Email: {structured_data.get("email", "N/A")}')
                self.stdout.write(f'    - Education: {len(structured_data.get("education", []))} entries')
                self.stdout.write(f'    - Experience: {len(structured_data.get("experience", []))} entries')
                self.stdout.write(f'    - Projects: {len(structured_data.get("projects", []))} entries')
                self.stdout.write(f'    - Skills: {len(structured_data.get("skills", []))} items')
                self.stdout.write(f'    - Extracurriculars: {len(structured_data.get("extracurriculars", []))} items')
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ✗ Failed to parse: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n\nCompleted!'))
