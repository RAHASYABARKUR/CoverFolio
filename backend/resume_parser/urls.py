from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_resume, name='upload_resume'),
    path('list/', views.list_resumes, name='list_resumes'),
    path('<int:resume_id>/', views.get_resume, name='get_resume'),
    path('<int:resume_id>/delete/', views.delete_resume, name='delete_resume'),
]
