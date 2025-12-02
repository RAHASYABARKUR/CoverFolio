from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Resume(models.Model):
    """Model to store resume information."""
    user = models.ForeignKey(User, on_delete=models.SET_NULL,     null=True,
    blank=True,related_name='resumes')
    title = models.CharField(max_length=200, blank=True)
    file_path = models.CharField(max_length=500)
    extracted_text = models.TextField(blank=True)
    structured_data = models.JSONField(
        null=True, 
        blank=True,
        help_text="Parsed resume data in structured JSON format"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title or 'Untitled Resume'}"


class CoverLetter(models.Model):
    """Model to store cover letter drafts."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cover_letters')
    resume = models.ForeignKey(Resume, on_delete=models.SET_NULL, null=True, blank=True, related_name='cover_letters')
    title = models.CharField(max_length=200, help_text="Title for the cover letter (e.g., role name)")
    role = models.CharField(max_length=200, blank=True, help_text="Job role applied for")
    company_name = models.CharField(max_length=200, blank=True, help_text="Company name")
    content = models.TextField(help_text="Cover letter content")
    
    # Template and formatting preferences
    template_style = models.CharField(
        max_length=50, 
        default='professional',
        choices=[
            ('professional', 'Professional'),
            ('modern', 'Modern'),
            ('creative', 'Creative'),
            ('header', 'Header Style'),
        ]
    )
    font_family = models.CharField(max_length=50, default='Arial')
    font_size = models.CharField(
        max_length=20, 
        default='medium',
        choices=[
            ('small', 'Small (11pt)'),
            ('medium', 'Medium (12pt)'),
            ('large', 'Large (13pt)'),
        ]
    )
    text_align = models.CharField(
        max_length=20, 
        default='left',
        choices=[
            ('left', 'Left'),
            ('center', 'Center'),
            ('justify', 'Justify'),
        ]
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"

