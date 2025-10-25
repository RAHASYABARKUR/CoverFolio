from django.contrib import admin
from .models import Portfolio, Project, Skill, Experience, Education, Certification, Hobby, Award, Contact, Publication, Patent, Other


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'is_public', 'created_at', 'updated_at']
    list_filter = ['is_public', 'created_at']
    search_fields = ['user__email', 'title', 'bio']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'portfolio', 'status', 'featured', 'created_at']
    list_filter = ['status', 'featured', 'created_at']
    search_fields = ['title', 'description', 'portfolio__user__email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-featured', 'order', '-created_at']


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'proficiency_level', 'portfolio', 'created_at']
    list_filter = ['category', 'proficiency_level', 'created_at']
    search_fields = ['name', 'portfolio__user__email']
    readonly_fields = ['created_at']


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ['position', 'company', 'employment_type', 'is_current', 'start_date', 'end_date']
    list_filter = ['employment_type', 'is_current', 'start_date']
    search_fields = ['position', 'company', 'portfolio__user__email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-is_current', '-start_date']


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ['institution', 'degree', 'field_of_study', 'is_current', 'start_date', 'end_date']
    list_filter = ['degree', 'is_current', 'start_date']
    search_fields = ['institution', 'field_of_study', 'portfolio__user__email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-is_current', '-start_date']


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ['name', 'issuing_organization', 'issue_date', 'expiry_date', 'portfolio']
    list_filter = ['issue_date', 'issuing_organization']
    search_fields = ['name', 'issuing_organization', 'portfolio__user__email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-issue_date']


@admin.register(Hobby)
class HobbyAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_current', 'portfolio', 'created_at']
    list_filter = ['category', 'is_current', 'created_at']
    search_fields = ['name', 'description', 'portfolio__user__email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-is_current', '-start_date']


@admin.register(Award)
class AwardAdmin(admin.ModelAdmin):
    list_display = ['title', 'issuer', 'category', 'date', 'portfolio']
    list_filter = ['category', 'date']
    search_fields = ['title', 'issuer', 'portfolio__user__email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-date', 'order']


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['label', 'contact_type', 'value', 'is_primary', 'is_public', 'portfolio']
    list_filter = ['contact_type', 'is_primary', 'is_public']
    search_fields = ['label', 'value', 'portfolio__user__email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-is_primary', 'order', 'contact_type']


@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    list_display = ['title', 'publication_type', 'publisher', 'publication_date', 'citation_count', 'portfolio']
    list_filter = ['publication_type', 'publication_date']
    search_fields = ['title', 'authors', 'publisher', 'doi', 'portfolio__user__email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-publication_date', 'order']


@admin.register(Patent)
class PatentAdmin(admin.ModelAdmin):
    list_display = ['title', 'patent_number', 'status', 'filing_date', 'issue_date', 'portfolio']
    list_filter = ['status', 'filing_date', 'patent_office']
    search_fields = ['title', 'inventors', 'patent_number', 'portfolio__user__email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-filing_date', 'order']


@admin.register(Other)
class OtherAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'date', 'portfolio', 'order']
    list_filter = ['category', 'date']
    search_fields = ['title', 'description', 'category', 'tags', 'portfolio__user__email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['order', '-date', '-created_at']
