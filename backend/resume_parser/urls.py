from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_resume, name='upload_resume'),
    path('list/', views.list_resumes, name='list_resumes'),
    path('<int:resume_id>/', views.get_resume, name='get_resume'),
    path('<int:resume_id>/delete/', views.delete_resume, name='delete_resume'),
    path('generate-cover-letter/', views.generate_cover_letter, name='generate_cover_letter'),
    path('chat/', views.chat_with_ai_assistant, name='chat_with_ai'),
    
    # Cover Letter Draft endpoints
    path('cover-letters/save/', views.save_cover_letter_draft, name='save_cover_letter_draft'),
    path('cover-letters/list/', views.list_cover_letter_drafts, name='list_cover_letter_drafts'),
    path('cover-letters/<int:cover_letter_id>/', views.get_cover_letter_draft, name='get_cover_letter_draft'),
    path('cover-letters/<int:cover_letter_id>/update/', views.update_cover_letter_draft, name='update_cover_letter_draft'),
    path('cover-letters/<int:cover_letter_id>/delete/', views.delete_cover_letter_draft, name='delete_cover_letter_draft'),
]

