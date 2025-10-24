from django.contrib import admin
from .models import Portfolio, Project, Skill, Experience, Education, Certification


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
