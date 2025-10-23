from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Resume(models.Model):
    """Model to store resume information."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=200, blank=True)
    file_path = models.CharField(max_length=500)
    extracted_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title or 'Untitled Resume'}"
