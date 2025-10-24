from django.urls import path
from . import views

app_name = 'portfolio'

urlpatterns = [
    # Portfolio endpoints
    path('', views.portfolio_view, name='portfolio'),
    path('public/<int:user_id>/', views.public_portfolio_view, name='public-portfolio'),
    
    # Project endpoints
    path('projects/', views.project_list_create, name='project-list-create'),
    path('projects/<int:project_id>/', views.project_detail, name='project-detail'),
    
    # Skill endpoints
    path('skills/', views.skill_list_create, name='skill-list-create'),
    path('skills/<int:skill_id>/', views.skill_detail, name='skill-detail'),
    
    # Experience endpoints
    path('experiences/', views.experience_list_create, name='experience-list-create'),
    path('experiences/<int:experience_id>/', views.experience_detail, name='experience-detail'),
    
    # Education endpoints
    path('education/', views.education_list_create, name='education-list-create'),
    path('education/<int:education_id>/', views.education_detail, name='education-detail'),
    
    # Certification endpoints
    path('certifications/', views.certification_list_create, name='certification-list-create'),
    path('certifications/<int:certification_id>/', views.certification_detail, name='certification-detail'),
]
