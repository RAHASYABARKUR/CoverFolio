from django.contrib import admin
from .models import Resume, CoverLetter

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__email', 'title', 'extracted_text')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(CoverLetter)
class CoverLetterAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'role', 'company_name', 'template_style', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at', 'template_style')
    search_fields = ('user__email', 'title', 'role', 'company_name', 'content')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')

