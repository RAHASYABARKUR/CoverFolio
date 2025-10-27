from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class CoverLetter(models.Model):
    """Model for generated cover letters"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cover_letters')
    title = models.CharField(max_length=200, help_text="Cover letter title/identifier")
    role = models.CharField(max_length=200, help_text="Job role/position")
    company_name = models.CharField(max_length=200, blank=True, help_text="Target company")
    job_description = models.TextField(help_text="Job description provided by user")
    additional_info = models.TextField(blank=True, help_text="Additional user-provided information")
    generated_content = models.TextField(help_text="AI-generated cover letter content")
    is_finalized = models.BooleanField(default=False, help_text="Whether user has finalized the letter")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Cover Letter'
        verbose_name_plural = 'Cover Letters'
    
    def __str__(self):
        return f"{self.user.email} - {self.role} at {self.company_name or 'Unknown Company'}"