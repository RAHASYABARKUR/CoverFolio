from django.urls import path
from . import views

app_name = 'portfolio'

urlpatterns = [
    # Portfolio endpoints
    path('', views.portfolio_view, name='portfolio'),
    path('public/<int:user_id>/', views.public_portfolio_view, name='public-portfolio'),
    path('populate-from-resume/<int:resume_id>/', views.populate_from_resume, name='populate-from-resume'),
    
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
    
    # Hobby endpoints
    path('hobbies/', views.hobby_list_create, name='hobby-list-create'),
    path('hobbies/<int:hobby_id>/', views.hobby_detail, name='hobby-detail'),
    
    # Award endpoints
    path('awards/', views.award_list_create, name='award-list-create'),
    path('awards/<int:award_id>/', views.award_detail, name='award-detail'),
    
    # Contact endpoints
    path('contacts/', views.contact_list_create, name='contact-list-create'),
    path('contacts/<int:contact_id>/', views.contact_detail, name='contact-detail'),
    
    # Publication endpoints
    path('publications/', views.publication_list_create, name='publication-list-create'),
    path('publications/<int:pk>/', views.publication_detail, name='publication-detail'),
    
    # Patent endpoints
    path('patents/', views.patent_list_create, name='patent-list-create'),
    path('patents/<int:pk>/', views.patent_detail, name='patent-detail'),
    
    # Other endpoints
    path('others/', views.other_list_create, name='other-list-create'),
    path('others/<int:pk>/', views.other_detail, name='other-detail'),
]
